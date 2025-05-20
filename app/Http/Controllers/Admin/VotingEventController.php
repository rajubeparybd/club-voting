<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Nomination;
use App\Models\NominationApplication;
use App\Models\Vote;
use App\Models\VotingEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VotingEventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $response = $this->checkAuthorization("view_voting_events", $request);
        if ($response) {
            return $response;
        }

        $votingEvents = VotingEvent::with(['club'])->get();
        $clubs        = Club::select('id', 'name')->where('status', 'active')->whereHas('nominations', function ($query) {
            $query->whereIn('status', ['closed', 'archived']);
        })->get();

        return Inertia::render('admin/voting-events/index', [
            'votingEvents' => $votingEvents,
            'clubs'        => $clubs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $response = $this->checkAuthorization("create_voting_events", $request);
        if ($response) {
            return $response;
        }

        $validated = $request->validate([
            'club_id'     => 'required|exists:clubs,id',
            'title'       => 'required|string|min:3',
            'description' => 'nullable|string|min:10',
            'status'      => 'required|in:active,draft,closed,archived',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
        ]);

        // Check if there's an active voting event for this club
        $existingEvent = VotingEvent::where('club_id', $validated['club_id'])
            ->whereIn('status', ['active', 'draft'])
            ->first();

        $activeNominations = Nomination::where('club_id', $validated['club_id'])
            ->where('status', 'active')
            ->count();

        $hasNoNominations = Nomination::where('club_id', $validated['club_id'])->whereIn('status', ['closed', 'archived'])->count();

        if ($hasNoNominations < 1) {
            return back()->with('error', 'This club has no nominations. Please create a nomination before creating a voting event.');
        }

        if ($activeNominations > 0) {
            return back()->with('error', 'This club has an active nomination. Please close the nomination before creating a voting event.');
        }

        if ($existingEvent) {
            return back()->with('error', 'This club already has an active or draft voting event. Please close the voting event before creating a new one.');
        }

        $votingEvent = VotingEvent::create($validated);

        $this->logActivity("Created Voting Event: {$votingEvent->title}", "voting_event");

        return redirect()->route('admin.voting-events.index')
            ->with('success', 'Voting event created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, VotingEvent $votingEvent)
    {
        $response = $this->checkAuthorization("view_voting_events", $request);
        if ($response) {
            return $response;
        }

        $votingEvent->load('club');
        $lastNomination = Nomination::where('club_id', $votingEvent->club_id)
            ->orderBy('created_at', 'desc')
            ->first();

        // Get candidates (approved nomination applications)
        $candidates = collect([]);
        if ($lastNomination) {
            $candidates = NominationApplication::where('nomination_id', $lastNomination->id)
                ->where('status', 'approved')
                ->with(['user:id,name,email,student_id,avatar,department_id', 'clubPosition:id,name'])
                ->get();

            // Load vote counts for each candidate
            foreach ($candidates as $candidate) {
                $candidate->votes_count = Vote::where('nomination_application_id', $candidate->id)
                    ->where('voting_event_id', $votingEvent->id)
                    ->count();
            }
        }

        // Get voting statistics
        $totalVotes          = Vote::where('voting_event_id', $votingEvent->id)->count();
        $totalEligibleVoters = $votingEvent->club->users()->count();
        $totalCandidates     = $candidates->count();
        $totalPositions      = $candidates->pluck('club_position_id')->unique()->count();
        $votingPercentage    = $totalEligibleVoters > 0 ? ($totalVotes / $totalEligibleVoters) * 100 : 0;

        // Get recent voters
        $recentVoters = Vote::where('voting_event_id', $votingEvent->id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($vote) {
                $timeDiff = $vote->created_at->diffForHumans();
                return [
                    'id'         => $vote->user_id,
                    'name'       => $vote->user->name,
                    'student_id' => $vote->user->student_id,
                    'avatar'     => $vote->user->avatar,
                    'timestamp'  => $timeDiff,
                ];
            });

        $daysRemaining     = round(now()->diffInDays($votingEvent->end_date, false));
        $daysRemainingText = $daysRemaining > 0
        ? "{$daysRemaining} days remaining"
        : "Voting has ended";

        return Inertia::render('admin/voting-events/show', [
            'votingEvent'    => $votingEvent,
            'club'           => $votingEvent->club,
            'lastNomination' => $lastNomination,
            'candidates'     => $candidates,
            'votingStats'    => [
                'totalVotes'          => $totalVotes,
                'totalEligibleVoters' => $totalEligibleVoters,
                'totalCandidates'     => $totalCandidates,
                'totalPositions'      => $totalPositions,
                'votingPercentage'    => round($votingPercentage, 1),
                'daysRemaining'       => $daysRemainingText,
                'recentVoters'        => $recentVoters,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VotingEvent $votingEvent)
    {
        $response = $this->checkAuthorization("edit_voting_events", $request);
        if ($response) {
            return $response;
        }

        $validated = $request->validate([
            'club_id'     => 'required|exists:clubs,id',
            'title'       => 'required|string|min:3',
            'description' => 'nullable|string|min:10',
            'status'      => 'required|in:active,draft,closed,archived',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
        ]);

        // If changing club, check if there's an active voting event for the new club
        if ($votingEvent->club_id != $validated['club_id']) {
            $existingEvent = VotingEvent::where('club_id', $validated['club_id'])
                ->whereIn('status', ['active', 'draft'])
                ->where('id', '!=', $votingEvent->id)
                ->first();

            if ($existingEvent) {
                return back()->with('error', 'The selected club already has an active or draft voting event. Please close the voting event before creating a new one.');
            }
        }

        $votingEvent->update($validated);

        $this->logActivity("Updated Voting Event: {$votingEvent->title}", "voting_event");

        return redirect()->route('admin.voting-events.index')
            ->with('success', 'Voting event updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, VotingEvent $votingEvent)
    {
        $response = $this->checkAuthorization("delete_voting_events", $request);
        if ($response) {
            return $response;
        }

        try {
            $votingEvent->delete();

            $this->logActivity("Deleted Voting Event: {$votingEvent->title}", "voting_event");

            return redirect()->route('admin.voting-events.index')
                ->with('success', 'Voting event deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete voting event. ' . $e->getMessage());
        }
    }
}
