<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Nomination;
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
        $clubs        = Club::select('id', 'name')->where('status', 'active')->get();

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
            ->get();

        if ($activeNominations) {
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
    public function show(string $id)
    {
        //
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
