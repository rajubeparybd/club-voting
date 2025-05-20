<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ClubPosition;
use App\Models\NominationApplication;
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

        // Get user's votes
        $userVotes = Vote::where('user_id', $request->user()->id)->get();

        // Group votes by voting event
        $votesByEvent = $userVotes->groupBy('voting_event_id');

        // Check which voting events the user has completed voting for all positions
        foreach ($activeVotingEvents as $votingEvent) {
            // Get all available positions in this voting event's club
            $availablePositions = ClubPosition::where('club_id', $votingEvent->club_id)->get();
            $positionIds        = $availablePositions->pluck('id')->toArray();

            // Get all candidates for this voting event
            $candidates = NominationApplication::whereHas('nomination', function ($query) use ($votingEvent) {
                $query->where('club_id', $votingEvent->club_id);
            })
                ->where('status', 'approved')
                ->get();

            // Group candidates by position
            $candidatesByPosition = $candidates->groupBy('club_position_id');

            // Check if user has voted for all positions that have candidates
            $hasVotedForAllPositions = true;

            foreach ($candidatesByPosition as $positionId => $positionCandidates) {
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

                if (! $hasVotedForPosition && $positionCandidates->count() > 0) {
                    $hasVotedForAllPositions = false;
                    break;
                }
            }

            $votingEvent->has_voted_all = $hasVotedForAllPositions;
        }

        return Inertia::render('user/voting-events/index', [
            'activeVotingEvents'   => $activeVotingEvents,
            'upcomingVotingEvents' => $upcomingVotingEvents,
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

        // Group candidates by position
        $candidatesByPosition = $candidates->groupBy('club_position_id');

        // Get user's votes for this voting event
        $userVotes = Vote::where('user_id', $request->user()->id)
            ->where('voting_event_id', $votingEvent->id)
            ->pluck('nomination_application_id')
            ->toArray();

        return Inertia::render('user/voting-events/show', [
            'votingEvent'          => $votingEvent,
            'positions'            => $positions,
            'candidatesByPosition' => $candidatesByPosition,
            'userVotes'            => $userVotes,
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
