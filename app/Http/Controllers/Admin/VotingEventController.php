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

    /**
     * Update the status of a voting event.
     */
    public function updateStatus(Request $request, VotingEvent $votingEvent)
    {
        $response = $this->checkAuthorization("edit_voting_events", $request);
        if ($response) {
            return $response;
        }

        $validated = $request->validate([
            'status'    => 'required|in:active,draft,closed,archived',
            'winners'   => 'sometimes|array',
            'winners.*' => 'integer|exists:nomination_applications,id',
        ]);

        $oldStatus = $votingEvent->status;
        $votingEvent->update([
            'status' => $validated['status'],
        ]);

        // Process position updates when voting event is closed
        if ($validated['status'] === 'closed' && $oldStatus !== 'closed') {
            $this->processVotingResults($votingEvent, $validated['winners'] ?? []);
        }

        $this->logActivity("Updated Voting Event Status: {$votingEvent->title} from {$oldStatus} to {$validated['status']}", "voting_event");

        return redirect()->back()
            ->with('success', 'Voting event status updated successfully.');
    }

    /**
     * Check for tied votes in a voting event.
     */
    public function checkTies(Request $request, VotingEvent $votingEvent)
    {
        $response = $this->checkAuthorization("edit_voting_events", $request);
        if ($response) {
            return $response;
        }

        $results = $this->identifyTiesAndWinners($votingEvent);

        // Store in session for the frontend
        if ($results['needsManualSelection']) {
            session([
                'voting_ties' => [
                    'voting_event_id' => $votingEvent->id,
                    'ties'            => $results['ties'],
                    'winners'         => $results['winners'],
                ],
            ]);
        }

        // Return the ties to the frontend
        return response()->json([
            'ties'                 => $results['ties'],
            'winners'              => $results['winners'],
            'needsManualSelection' => $results['needsManualSelection'],
        ]);
    }

    /**
     * Get candidates grouped by position with vote counts.
     */
    private function getCandidatesByPosition(VotingEvent $votingEvent)
    {
        $club           = $votingEvent->club;
        $lastNomination = Nomination::where('club_id', $votingEvent->club_id)
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $lastNomination) {
            return collect([]);
        }

        // Get all approved nomination applications
        $applications = NominationApplication::where('nomination_id', $lastNomination->id)
            ->where('status', 'approved')
            ->with(['user', 'clubPosition:id,name'])
            ->get();

        // Load vote counts for each candidate
        foreach ($applications as $application) {
            $application->votes_count = Vote::where('nomination_application_id', $application->id)
                ->where('voting_event_id', $votingEvent->id)
                ->count();
        }

        // Group candidates by position
        return $applications->groupBy('club_position_id');
    }

    /**
     * Identify tied positions and winners.
     */
    private function identifyTiesAndWinners(VotingEvent $votingEvent)
    {
        $candidatesByPosition = $this->getCandidatesByPosition($votingEvent);
        $winners              = [];
        $ties                 = [];

        foreach ($candidatesByPosition as $positionId => $candidates) {
            // Skip empty positions
            if ($candidates->isEmpty()) {
                continue;
            }

            // Sort candidates by vote count (highest first)
            $sortedCandidates = $candidates->sortByDesc('votes_count');

            // Get the highest vote count
            $highestVotes = $sortedCandidates->first()->votes_count;

            // Check if there's a tie for the highest vote count
            $candidatesWithHighestVotes = $sortedCandidates->filter(function ($candidate) use ($highestVotes) {
                return $candidate->votes_count === $highestVotes;
            });

            // If there's more than one candidate with the highest vote count, it's a tie
            if ($candidatesWithHighestVotes->count() > 1) {
                $ties[$positionId] = $candidatesWithHighestVotes;
            } else {
                // If there's only one candidate with the highest vote count, they're the winner
                $winners[$positionId] = $sortedCandidates->first()->id;
            }
        }

        return [
            'winners'              => $winners,
            'ties'                 => $ties,
            'needsManualSelection' => ! empty($ties),
            'candidatesByPosition' => $candidatesByPosition,
        ];
    }

    /**
     * Process the voting results and update club positions.
     */
    private function processVotingResults(VotingEvent $votingEvent, array $manualWinners = [])
    {
        $results = $this->identifyTiesAndWinners($votingEvent);
        $winners = $results['winners'];

        // If there are ties and no manual winners provided, return the results without updating
        if ($results['needsManualSelection'] && empty($manualWinners)) {
            // Store the results in the session for the frontend to display
            session(['voting_ties' => [
                'voting_event_id'      => $votingEvent->id,
                'ties'                 => $results['ties'],
                'winners'              => $winners,
                'candidatesByPosition' => $results['candidatesByPosition'],
            ]]);

            return [
                'success'              => false,
                'message'              => 'There are ties that need manual resolution.',
                'needsManualSelection' => true,
                'ties'                 => $results['ties'],
            ];
        }

        // Merge manual winners with automatic winners
        foreach ($manualWinners as $positionId => $applicationId) {
            $winners[$positionId] = $applicationId;
        }

        // Update club positions for winners
        $club = $votingEvent->club;
        foreach ($winners as $positionId => $applicationId) {
            $application = NominationApplication::find($applicationId);
            if (! $application) {
                continue;
            }

            // Update club_user pivot to set the new position
            $club->users()->updateExistingPivot($application->user_id, [
                'position_id' => $positionId,
            ]);

            // Log the position update
            $position = $application->clubPosition;
            $this->logActivity(
                "Updated user {$application->user->name} to position {$position->name} in {$club->name} based on voting results",
                "club"
            );
        }

        return [
            'success' => true,
            'message' => 'Positions updated successfully based on voting results.',
            'winners' => $winners,
        ];
    }
}
