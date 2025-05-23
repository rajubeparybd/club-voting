<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Nomination;
use App\Models\NominationApplication;
use App\Models\NominationWinner;
use App\Models\Vote;
use App\Models\VotingEvent;
use DB;
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

        $votingEvents = VotingEvent::with(['club'])->orderBy('created_at', 'desc')->get();
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

                // Check if this candidate is a winner
                $candidate->is_winner = false;
                if ($votingEvent->status === 'closed') {
                    $winner = NominationWinner::where('nomination_id', $lastNomination->id)
                        ->where('voting_event_id', $votingEvent->id)
                        ->where('nomination_application_id', $candidate->id)
                        ->exists();

                    $candidate->is_winner = $winner;
                }
            }
        }

        // Get winners if the voting is closed
        $winners = collect([]);
        if ($votingEvent->status === 'closed' && $lastNomination) {
            $winners = NominationWinner::where('nomination_id', $lastNomination->id)
                ->where('voting_event_id', $votingEvent->id)
                ->with(['nominationApplication.user:id,name,email,student_id,avatar,department_id', 'clubPosition:id,name'])
                ->get();
        }

        // Get voting statistics
        $totalVotes          = Vote::where('voting_event_id', $votingEvent->id)->count();
        $totalEligibleVoters = $votingEvent->club->users()->count();
        $totalCandidates     = $candidates->count();
        $totalPositions      = $candidates->pluck('club_position_id')->unique()->count();
        $votingPercentage    = $totalEligibleVoters > 0 ? ($totalVotes / $totalEligibleVoters) * 100 : 0;

        $daysRemaining     = round(now()->diffInDays($votingEvent->end_date, false));
        $daysRemainingText = $daysRemaining > 0
        ? "{$daysRemaining} days remaining"
        : "Voting has ended";

        return Inertia::render('admin/voting-events/show', [
            'votingEvent'    => $votingEvent,
            'club'           => $votingEvent->club,
            'lastNomination' => $lastNomination,
            'candidates'     => $candidates,
            'winners'        => $winners,
            'votingStats'    => [
                'totalVotes'          => $totalVotes,
                'totalEligibleVoters' => $totalEligibleVoters,
                'totalCandidates'     => $totalCandidates,
                'totalPositions'      => $totalPositions,
                'votingPercentage'    => round($votingPercentage, 1),
                'daysRemaining'       => $daysRemainingText,
                'isExpired'           => $votingEvent->end_date < now(),
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

        try {
            $validated = $request->validate([
                'status'    => 'required|in:active,draft,closed,archived',
                'winners'   => 'sometimes|array',
                'winners.*' => 'integer|exists:nomination_applications,id',
            ]);

            $oldStatus = $votingEvent->status;

            // Prevent changing from closed/archived to any other status
            if (($oldStatus === 'closed' || $oldStatus === 'archived') && $validated['status'] !== $oldStatus) {
                return redirect()->back()->withErrors([
                    'error' => 'Closed or archived voting events cannot be changed to any other status. Please create a new voting event instead.',
                ]);
            }

            DB::beginTransaction();

            $votingEvent->update([
                'status' => $validated['status'],
            ]);

            // Process position updates when voting event is closed
            if ($validated['status'] === 'closed' && $oldStatus !== 'closed') {
                $this->processVotingResults($votingEvent, $validated['winners'] ?? []);
            }

            $this->logActivity("Updated Voting Event Status: {$votingEvent->title} from {$oldStatus} to {$validated['status']}", "voting_event");

            // Add additional success message if voting event was closed
            $message = 'Voting event status updated successfully.';
            if ($validated['status'] === 'closed' && $oldStatus !== 'closed') {
                $message .= ' Winners have been recorded in the system. View current position holders on the club details page.';
            }

            DB::commit();

            return redirect()->back()
                ->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update voting event status. ' . $e->getMessage());
        }
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

        // Save winners to nomination_winners table
        $club = $votingEvent->club;

        // Get the most recent nomination for this club regardless of status
        $lastNomination = $club->nominations()
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $lastNomination) {
            // Log the issue
            $this->logActivity(
                "Failed to save winners for voting event {$votingEvent->title}: No nomination found for club {$club->name}",
                "error"
            );
            return [
                'success' => false,
                'message' => 'No nomination found for this club.',
            ];
        }

        foreach ($winners as $positionId => $applicationId) {
            $application = NominationApplication::find($applicationId);
            if (! $application) {
                continue;
            }

            // Save to nomination winners table
            $votesCount = Vote::where('nomination_application_id', $applicationId)
                ->where('voting_event_id', $votingEvent->id)
                ->count();

            // Get the user_id from the application
            $userId = $application->user_id;

            NominationWinner::updateOrCreate(
                [
                    'nomination_id'    => $lastNomination->id,
                    'voting_event_id'  => $votingEvent->id,
                    'club_position_id' => $positionId,
                ],
                [
                    'nomination_application_id' => $applicationId,
                    'winner_id'                 => $userId,
                    'votes_count'               => $votesCount,
                    'is_tie_resolved'           => isset($manualWinners[$positionId]),
                ]
            );

            // Log the position update
            $position = $application->clubPosition;
            $this->logActivity(
                "Set user {$application->user->name} as the winner for position {$position->name} in {$club->name} based on voting results",
                "club"
            );
        }

        return [
            'success' => true,
            'message' => 'Winners saved successfully based on voting results.',
            'winners' => $winners,
        ];
    }
}
