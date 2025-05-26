<?php
namespace App\Console\Commands;

use App\Models\Nomination;
use App\Notifications\Admin\NominationClosedNotification;
use App\Support\AdminHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CloseExpiredNominations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nominations:close-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Close nominations that have passed their end date';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for expired nominations...');

        try {
            // Find nominations that are active but have end dates in the past
            $expiredNominations = Nomination::where('status', 'active')
                ->where('end_date', '<', now())
                ->get();

            if ($expiredNominations->isEmpty()) {
                $this->info('No expired nominations found.');
                return Command::SUCCESS;
            }

            $count = 0;
            foreach ($expiredNominations as $nomination) {
                $nomination->update(['status' => 'closed']);
                $count++;

                // Notify admin and club admins that the nomination has been closed
                $this->notifyAdmins($nomination);

                $this->info("Closed nomination: {$nomination->title} (ID: {$nomination->id})");
                Log::info("Automatically closed expired nomination: {$nomination->title} (ID: {$nomination->id})");
            }

            $this->info("Successfully closed {$count} expired nominations.");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error closing expired nominations: {$e->getMessage()}");
            Log::error("Error in CloseExpiredNominations command: {$e->getMessage()}", [
                'exception' => $e,
            ]);

            return Command::FAILURE;
        }
    }

    /**
     * Notify admins about the closed nomination
     *
     * @param Nomination $nomination
     * @return void
     */
    private function notifyAdmins(Nomination $nomination)
    {
        try {
            // Notify system admins
            $adminUsers = AdminHelper::getAdminUsers();
            foreach ($adminUsers as $admin) {
                $admin->notify(new NominationClosedNotification($nomination));
            }

            // Notify club admins if the nomination is associated with a club
            if ($nomination->club_id) {
                $clubAdmins = AdminHelper::getClubAdminUsers($nomination->club_id, 'edit_nominations');
                foreach ($clubAdmins as $clubAdmin) {
                    $clubAdmin->notify(new NominationClosedNotification($nomination));
                }
            }

            Log::info("Sent nomination closed notifications for: {$nomination->title} (ID: {$nomination->id})");
        } catch (\Exception $e) {
            Log::error("Error sending nomination closed notifications: {$e->getMessage()}", [
                'nomination_id' => $nomination->id,
                'exception'     => $e,
            ]);
        }
    }
}
