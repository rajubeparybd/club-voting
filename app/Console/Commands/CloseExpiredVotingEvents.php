<?php
namespace App\Console\Commands;

use App\Models\ClubPosition;
use App\Models\NominationApplication;
use App\Models\Vote;
use App\Models\VotingEvent;
use App\Notifications\Admin\VotingEventClosedNotification;
use App\Notifications\Admin\VotingEventTiedNotification;
use App\Support\AdminHelper;
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
                    $winners    = [];
                    $hasTie     = false;
                    $tieDetails = [];

                    foreach ($candidatesByPosition as $positionId => $positionCandidates) {
                        if ($positionCandidates->isEmpty()) {
                            continue;
                        }

                        // Sort candidates by vote count in descending order
                        $sortedCandidates = $positionCandidates->sortByDesc('votes_count');

                        // Get the highest vote count
                        $highestVoteCount = $sortedCandidates->first()->votes_count;

                        // Find candidates with the highest vote count (could be multiple in case of a tie)
                        $topCandidates = $sortedCandidates->filter(function ($candidate) use ($highestVoteCount) {
                            return $candidate->votes_count === $highestVoteCount;
                        });

                        // Check if there's a tie (more than one candidate with the highest vote count)
                        if ($topCandidates->count() > 1 && $highestVoteCount > 0) {
                            $hasTie   = true;
                            $position = ClubPosition::find($positionId);

                            // Store tie details for notification
                            $tieDetails[] = [
                                'position'   => $position,
                                'candidates' => $topCandidates,
                                'vote_count' => $highestVoteCount,
                            ];

                            $this->warn("Tie detected for position {$position->name} with {$highestVoteCount} votes each.");

                            // Log the tie
                            $this->logActivity(
                                "Tie detected in voting event {$votingEvent->title} for position {$position->name}",
                                'voting_tie'
                            );

                            // Continue to the next position without determining a winner
                            continue;
                        }

                        // The candidate with the most votes is the winner
                        $winner = $sortedCandidates->first();

                        if ($winner && $winner->votes_count > 0) {
                            $winners[$positionId] = [
                                'user_id'       => $winner->user_id,
                                'user_name'     => $winner->user->name,
                                'position_id'   => $positionId,
                                'position_name' => $winner->clubPosition->name,
                                'votes_count'   => $winner->votes_count,
                            ];

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

                    // If there's a tie, notify admins and don't close the voting event
                    if ($hasTie) {
                        // Rollback any changes made
                        DB::rollBack();

                        // Notify admins about the tie
                        $this->notifyAdminsAboutTie($votingEvent, $tieDetails);

                        $this->warn("Voting event {$votingEvent->title} has tie votes. Manual intervention required.");
                        continue; // Skip to the next voting event
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

                    // Notify admins about the closed voting event
                    $this->notifyAdminsAboutClosure($votingEvent, $winners);

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
     * Notify admins about a tie in a voting event.
     *
     * @param VotingEvent $votingEvent
     * @param array $tieDetails
     * @return void
     */
    protected function notifyAdminsAboutTie(VotingEvent $votingEvent, array $tieDetails): void
    {
        try {
            // Get system admins
            $adminUsers = AdminHelper::getAdminUsers();

            // Get club admins
            $clubAdmins = AdminHelper::getClubAdminUsers($votingEvent->club_id, 'edit_voting_events');

            // Combine all admins to notify
            $allAdmins = $adminUsers->merge($clubAdmins);

            foreach ($tieDetails as $tie) {
                foreach ($allAdmins as $admin) {
                    $admin->notify(new VotingEventTiedNotification(
                        $votingEvent,
                        $tie['position'],
                        $tie['candidates']->toArray(),
                        $tie['vote_count']
                    ));
                }
            }

            $this->info("Sent tie notifications for voting event: {$votingEvent->title}");
            Log::info("Sent tie notifications for voting event: {$votingEvent->title} (ID: {$votingEvent->id})");
        } catch (\Exception $e) {
            $this->error("Error sending tie notifications: {$e->getMessage()}");
            Log::error("Error sending tie notifications: {$e->getMessage()}", [
                'voting_event_id' => $votingEvent->id,
                'exception'       => $e,
            ]);
        }
    }

    /**
     * Notify admins about the closure of a voting event.
     *
     * @param VotingEvent $votingEvent
     * @param array $winners
     * @return void
     */
    protected function notifyAdminsAboutClosure(VotingEvent $votingEvent, array $winners): void
    {
        try {
            // Get system admins
            $adminUsers = AdminHelper::getAdminUsers();

            // Get club admins
            $clubAdmins = AdminHelper::getClubAdminUsers($votingEvent->club_id, 'edit_voting_events');

            // Combine all admins to notify
            $allAdmins = $adminUsers->merge($clubAdmins);

            foreach ($allAdmins as $admin) {
                $admin->notify(new VotingEventClosedNotification($votingEvent, $winners));
            }

            $this->info("Sent closure notifications for voting event: {$votingEvent->title}");
            Log::info("Sent closure notifications for voting event: {$votingEvent->title} (ID: {$votingEvent->id})");
        } catch (\Exception $e) {
            $this->error("Error sending closure notifications: {$e->getMessage()}");
            Log::error("Error sending closure notifications: {$e->getMessage()}", [
                'voting_event_id' => $votingEvent->id,
                'exception'       => $e,
            ]);
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
