<?php
namespace App\Console\Commands;

use App\Models\ClubPosition;
use App\Models\NominationApplication;
use App\Models\Vote;
use App\Models\VotingEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CloseExpiredVotingEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'voting-events:close-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Close voting events that have passed their end date, calculate winners, and update positions';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for expired voting events...');

        try {
            // Find voting events that are active but have end dates in the past
            $expiredVotingEvents = VotingEvent::with(['club'])
                ->where('status', 'active')
                ->where('end_date', '<', now())
                ->get();

            if ($expiredVotingEvents->isEmpty()) {
                $this->info('No expired voting events found.');
                return Command::SUCCESS;
            }

            $count = 0;
            foreach ($expiredVotingEvents as $votingEvent) {
                DB::beginTransaction();
                try {
                    $this->info("Processing voting event: {$votingEvent->title} (ID: {$votingEvent->id})");

                    // Get all positions for this club
                    $positions = ClubPosition::where('club_id', $votingEvent->club_id)
                        ->where('is_active', true)
                        ->get();

                    // Get all candidates with their vote counts
                    $candidates = NominationApplication::whereHas('nomination', function ($query) use ($votingEvent) {
                        $query->where('club_id', $votingEvent->club_id);
                    })
                        ->where('status', 'approved')
                        ->with(['user:id,name,email', 'clubPosition:id,name'])
                        ->get();

                    // Calculate vote counts for each candidate
                    foreach ($candidates as $candidate) {
                        $candidate->votes_count = Vote::where('nomination_application_id', $candidate->id)
                            ->where('voting_event_id', $votingEvent->id)
                            ->count();
                    }

                    // Group candidates by position
                    $candidatesByPosition = $candidates->groupBy('club_position_id');

                    // Determine winners for each position
                    $winners = [];
                    foreach ($candidatesByPosition as $positionId => $positionCandidates) {
                        if ($positionCandidates->isEmpty()) {
                            continue;
                        }

                        // Sort candidates by vote count in descending order
                        $sortedCandidates = $positionCandidates->sortByDesc('votes_count');

                        // TODO: Notify admin that the voting event has been closed
                        // TODO: Implement tie-breaking logic here if multiple candidates have the same vote count
                        // For now, we're simply taking the first candidate with the highest votes

                        // The candidate with the most votes is the winner
                        $winner = $sortedCandidates->first();

                        if ($winner && $winner->votes_count > 0) {
                            $winners[$positionId] = $winner;
                            $this->info("Winner for position {$winner->clubPosition->name}: {$winner->user->name} with {$winner->votes_count} votes");

                            // Update the club_user relationship to assign the position
                            $votingEvent->club->users()->updateExistingPivot($winner->user_id, [
                                'position_id' => $positionId,
                            ]);

                            // Log this activity
                            $this->logActivity(
                                "Elected as {$winner->clubPosition->name} in {$votingEvent->club->name} club election",
                                'election',
                                $winner->user_id
                            );
                        } else {
                            $this->warn("No winner determined for position {$positionId} - no votes cast");
                        }
                    }

                    // Close the voting event
                    $votingEvent->update(['status' => 'closed']);

                    // Log the closing of the voting event
                    $this->logActivity(
                        "Automatically closed voting event: {$votingEvent->title} and assigned winners to positions",
                        'system'
                    );

                    $count++;
                    $this->info("Successfully processed voting event: {$votingEvent->title}");

                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->error("Error processing voting event {$votingEvent->title}: {$e->getMessage()}");
                    Log::error("Error processing voting event {$votingEvent->id}: {$e->getMessage()}", [
                        'exception' => $e,
                    ]);
                }
            }

            $this->info("Successfully processed {$count} expired voting events.");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error closing expired voting events: {$e->getMessage()}");
            Log::error("Error in CloseExpiredVotingEvents command: {$e->getMessage()}", [
                'exception' => $e,
            ]);

            return Command::FAILURE;
        }
    }

    /**
     * Log an activity.
     *
     * @param  string  $message  This is the message that will be logged.
     * @param  string  $event    This is the event that will be logged.
     * @param  int|null  $userId  The user ID to log the activity for.
     */
    protected function logActivity(string $message, string $event = 'system', ?int $userId = null): void
    {
        $activity = activity()->event($event);

        if ($userId) {
            $activity->causedBy($userId);
        }

        $activity->log($message);

        Log::info($message);
    }
}
