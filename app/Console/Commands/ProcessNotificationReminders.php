<?php
namespace App\Console\Commands;

use App\Jobs\SendNotificationReminder;
use App\Models\NotificationReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessNotificationReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:process {--dry-run : Show what would be processed without actually processing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process due notification reminders and dispatch email jobs';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Processing notification reminders...');

        try {
            // Get all due reminders
            $dueReminders = NotificationReminder::due()
                ->with('notifiable')
                ->get();

            if ($dueReminders->isEmpty()) {
                $this->info('No due reminders found.');
                return Command::SUCCESS;
            }

            $this->info("Found {$dueReminders->count()} due reminder(s).");

            $processed = 0;
            $failed    = 0;

            foreach ($dueReminders as $reminder) {
                try {
                    if ($this->option('dry-run')) {
                        $this->line("Would process reminder ID: {$reminder->id} for {$reminder->email} (Type: {$reminder->notifiable_type_name})");
                        $processed++;
                        continue;
                    }

                    // Dispatch the job to send the reminder
                    SendNotificationReminder::dispatch($reminder);

                    $this->line("Dispatched reminder ID: {$reminder->id} for {$reminder->email} (Type: {$reminder->notifiable_type_name})");

                    Log::info("Dispatched notification reminder job", [
                        'reminder_id'     => $reminder->id,
                        'email'           => $reminder->email,
                        'notifiable_type' => $reminder->notifiable_type,
                        'notifiable_id'   => $reminder->notifiable_id,
                    ]);

                    $processed++;

                } catch (\Exception $e) {
                    $this->error("Failed to process reminder ID: {$reminder->id} - {$e->getMessage()}");

                    Log::error("Failed to dispatch notification reminder job", [
                        'reminder_id' => $reminder->id,
                        'error'       => $e->getMessage(),
                    ]);

                    $failed++;
                }
            }

            if ($this->option('dry-run')) {
                $this->info("Dry run completed. Would have processed {$processed} reminder(s).");
            } else {
                $this->info("Successfully dispatched {$processed} reminder(s).");

                if ($failed > 0) {
                    $this->warn("Failed to dispatch {$failed} reminder(s). Check logs for details.");
                }
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Error processing notification reminders: {$e->getMessage()}");

            Log::error("Error in ProcessNotificationReminders command", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Command::FAILURE;
        }
    }
}
