<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ClubPosition;
use App\Models\NominationApplication;
use App\Models\NominationWinner;
use App\Models\Vote;
use App\Models\VotingEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VotingEventController extends Controller
{
    /**
     * Display a listing of active and upcoming voting events.
     */
    public function index(Request $request)
    {
        // Get only active club memberships
        $userClubs = $request->user()->clubs()
            ->where('club_user.status', 'active')
            ->pluck('clubs.id');

        // Get active voting events for clubs where the user is an active member
        $activeVotingEvents = VotingEvent::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();

        // Get upcoming voting events
        $upcomingVotingEvents = VotingEvent::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where('status', 'active')
            ->where('start_date', '>', now())
            ->get();

        // Get completed voting events
        $completedVotingEvents = VotingEvent::with(['club'])
            ->whereIn('club_id', $userClubs)
            ->where(function ($query) {
                $query->where('status', 'closed')
                    ->orWhere(function ($q) {
                        $q->where('status', 'active')
                            ->where('end_date', '<', now());
                    });
            })
            ->orderBy('end_date', 'desc')
            ->limit(10) // Limit to recent events
            ->get();

        // Get user's votes
        $userVotes = Vote::where('user_id', $request->user()->id)->get();

        // Group votes by voting event
        $votesByEvent = $userVotes->groupBy('voting_event_id');

        // Process all voting events to check voting status
        $allEvents = $activeVotingEvents->concat($upcomingVotingEvents)->concat($completedVotingEvents);

        foreach ($allEvents as $votingEvent) {
            // Get all available positions in this voting event's club
            $availablePositions = ClubPosition::where('club_id', $votingEvent->club_id)
                ->where('is_active', true)
                ->get();

            // Get all candidates for this voting event's club that have approved applications
            $candidates = NominationApplication::whereHas('nomination', function ($query) use ($votingEvent) {
                $query->where('club_id', $votingEvent->club_id);
            })
                ->where('status', 'approved')
                ->get();

            // Group candidates by position
            $candidatesByPosition = $candidates->groupBy('club_position_id');

            // Default to false
            $votingEvent->has_voted_all = false;

            // Only check voting status if there are actual candidates
            if ($candidatesByPosition->count() > 0) {
                // Check if user has voted for all positions that have candidates
                $hasVotedForAllPositions = true;

                foreach ($candidatesByPosition as $positionId => $positionCandidates) {
                    // Only check positions that actually have candidates
                    if ($positionCandidates->count() > 0) {
                        // Check if user has voted for this position
                        $hasVotedForPosition = false;

                        if (isset($votesByEvent[$votingEvent->id])) {
                            foreach ($votesByEvent[$votingEvent->id] as $vote) {
                                $candidatePositionId = $candidates->firstWhere('id', $vote->nomination_application_id)->club_position_id ?? null;
                                if ($candidatePositionId == $positionId) {
                                    $hasVotedForPosition = true;
                                    break;
                                }
                            }
                        }

                        if (! $hasVotedForPosition) {
                            $hasVotedForAllPositions = false;
                            break;
                        }
                    }
                }

                $votingEvent->has_voted_all = $hasVotedForAllPositions;
            }

            // For completed events, also check if the user has cast any votes
            $votingEvent->has_any_votes = isset($votesByEvent[$votingEvent->id]) && $votesByEvent[$votingEvent->id]->count() > 0;
        }

        return Inertia::render('user/voting-events/index', [
            'activeVotingEvents'    => $activeVotingEvents,
            'upcomingVotingEvents'  => $upcomingVotingEvents,
            'completedVotingEvents' => $completedVotingEvents,
        ]);
    }

    /**
     * Display a specific voting event with candidates.
     */
    public function show(Request $request, VotingEvent $votingEvent)
    {
        $votingEvent->load('club');

        // Check if user is a member of this club
        $isMember = $request->user()->clubs()
            ->where('clubs.id', $votingEvent->club_id)
            ->where('club_user.status', 'active')
            ->exists();

        if (! $isMember) {
            return redirect()->route('user.voting-events.index')
                ->with('error', 'You are not a member of this club.');
        }

        // Get all positions for this club
        $positions = ClubPosition::where('club_id', $votingEvent->club_id)->get();

        // Get the last nomination for this club
        $lastNomination = $votingEvent->club->nominations()->orderBy('created_at', 'desc')->first();

        // Get all candidates (approved nomination applications)
        $candidates = NominationApplication::whereHas('nomination', function ($query) use ($votingEvent) {
            $query->where('club_id', $votingEvent->club_id);
        })
            ->where('status', 'approved')
            ->with([
                'user:id,name,email,student_id,avatar,department_id',
                'clubPosition:id,name',
                'user.department:id,name',
            ])
            ->get();

        // Add vote counts for each candidate
        foreach ($candidates as $candidate) {
            $candidate->votes_count = Vote::where('nomination_application_id', $candidate->id)
                ->where('voting_event_id', $votingEvent->id)
                ->count();

            // Check if this candidate is a winner (only for closed events)
            $candidate->is_winner = false;
            if (($votingEvent->status === 'closed') && $lastNomination) {
                $winner = NominationWinner::where('nomination_id', $lastNomination->id)
                    ->where('voting_event_id', $votingEvent->id)
                    ->where('nomination_application_id', $candidate->id)
                    ->exists();

                $candidate->is_winner = $winner;
            }
        }

        // Group candidates by position
        $candidatesByPosition = $candidates->groupBy('club_position_id');

        // Get user's votes for this voting event
        $userVotes = Vote::where('user_id', $request->user()->id)
            ->where('voting_event_id', $votingEvent->id)
            ->pluck('nomination_application_id')
            ->toArray();

        // Get winners if the voting is closed
        $winners = collect([]);
        if (($votingEvent->status === 'closed') && $lastNomination) {
            $winners = NominationWinner::where('nomination_id', $lastNomination->id)
                ->where('voting_event_id', $votingEvent->id)
                ->with(['nominationApplication.user:id,name,email,student_id,avatar,department_id', 'clubPosition:id,name'])
                ->get();
        }

        // Calculate voting statistics
        $totalVotes          = Vote::where('voting_event_id', $votingEvent->id)->count();
        $totalEligibleVoters = $votingEvent->club->users()->where('club_user.status', 'active')->count();
        $votingPercentage    = $totalEligibleVoters > 0 ? ($totalVotes / $totalEligibleVoters) * 100 : 0;

        // Check if voting is closed
        $isVotingClosed = $votingEvent->status === 'closed' || $votingEvent->end_date < now();

        return Inertia::render('user/voting-events/show', [
            'votingEvent'          => $votingEvent,
            'positions'            => $positions,
            'candidatesByPosition' => $candidatesByPosition,
            'userVotes'            => $userVotes,
            'isVotingClosed'       => $isVotingClosed,
            'winners'              => $winners,
            'votingStats'          => [
                'totalVotes'          => $totalVotes,
                'totalEligibleVoters' => $totalEligibleVoters,
                'votingPercentage'    => round($votingPercentage, 1),
            ],
        ]);
    }

    /**
     * Submit a vote for a candidate.
     */
    public function vote(Request $request)
    {
        $validated = $request->validate([
            'voting_event_id'           => 'required|exists:voting_events,id',
            'nomination_application_id' => 'required|exists:nomination_applications,id',
        ]);

        $votingEvent = VotingEvent::findOrFail($validated['voting_event_id']);
        $candidate   = NominationApplication::findOrFail($validated['nomination_application_id']);

        // Check if the voting event is active
        if ($votingEvent->status !== 'active') {
            return back()->with('error', 'This voting event is not currently active.');
        }

        // Check if voting period is active
        if (now() < $votingEvent->start_date || now() > $votingEvent->end_date) {
            return back()->with('error', 'Voting is not currently open for this event.');
        }

        // Check if user is a member of this club
        $isMember = $request->user()->clubs()
            ->where('clubs.id', $votingEvent->club_id)
            ->where('club_user.status', 'active')
            ->exists();

        if (! $isMember) {
            return back()->with('error', 'You are not a member of this club.');
        }

        // Check if the user has already voted for a candidate in this position
        $positionId = $candidate->club_position_id;

        $hasVotedForPosition = Vote::where('user_id', $request->user()->id)
            ->where('voting_event_id', $votingEvent->id)
            ->whereHas('nominationApplication', function ($query) use ($positionId) {
                $query->where('club_position_id', $positionId);
            })
            ->exists();

        if ($hasVotedForPosition) {
            return back()->with('error', 'You have already voted for this position.');
        }

        try {
            DB::beginTransaction();

            // Create the vote
            Vote::create([
                'user_id'                   => $request->user()->id,
                'voting_event_id'           => $votingEvent->id,
                'nomination_application_id' => $candidate->id,
            ]);

            DB::commit();

            $this->logActivity('Voted in ' . $votingEvent->title, 'vote');

            return back()->with('success', 'Your vote has been recorded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }
}
