<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NominationRequest;
use App\Models\Club;
use App\Models\Nomination;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NominationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $response = $this->checkAuthorization("view_nominations", $request);
        if ($response) {
            return $response;
        }

        $nominations = Nomination::with('club')->get();

        $clubs = Club::select('id', 'name')->get();

        return Inertia::render('admin/nominations/index', [
            'nominations' => $nominations,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $response = $this->checkAuthorization("create_nominations", $request);
        if ($response) {
            return $response;
        }

        $clubs = Club::select('id', 'name')->where('status', 'active')->get();

        return Inertia::render('admin/nominations/create', [
            'clubs' => $clubs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NominationRequest $request)
    {
        $response = $this->checkAuthorization("create_nominations", $request);
        if ($response) {
            return $response;
        }

        $validated = $request->validated();

        $nomination = Nomination::where('club_id', $validated['club_id'])->where('status', 'active')->first();
        if ($nomination) {
            return back()->withErrors(['error' => 'Club already has an active nomination.']);
        }

        $nomination = Nomination::create($validated);

        $this->logActivity("Create Nomination {$nomination->title}", "nomination");

        return redirect()->route('admin.nominations.index')
            ->with('success', 'Nomination created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Nomination $nomination, Request $request)
    {
        $response = $this->checkAuthorization("view_nomination_applications", $request);

        if ($response) {
            return $response;
        }

        $nomination->load('club', 'applications');

        return Inertia::render('admin/nominations/show', [
            'nomination'   => $nomination,
            'applications' => $nomination->applications,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Nomination $nomination, Request $request)
    {
        $response = $this->checkAuthorization("edit_nominations", $request);
        if ($response) {
            return $response;
        }

        $nomination->load('club');
        $clubs = Club::select('id', 'name')->get();

        return Inertia::render('admin/nominations/edit', [
            'nomination' => $nomination,
            'clubs'      => $clubs,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NominationRequest $request, Nomination $nomination)
    {
        $response = $this->checkAuthorization("edit_nominations", $request);
        if ($response) {
            return $response;
        }

        $validated = $request->validated();

        $nomination->update($validated);

        $this->logActivity("Update Nomination {$nomination->title}", "nomination");

        return redirect()->route('admin.nominations.index')
            ->with('success', 'Nomination updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Nomination $nomination)
    {
        $response = $this->checkAuthorization("delete_nominations", $request);
        if ($response) {
            return $response;
        }

        try {
            // Check if there are any applications
            if ($nomination->applications()->exists()) {
                return back()->withErrors(['error' => 'Cannot delete a nomination that has applications.']);
            }

            $nomination->delete();

            $this->logActivity("Delete Nomination {$nomination->title}", "nomination");

            return redirect()->route('admin.nominations.index')
                ->with('success', 'Nomination deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete nomination. ' . $e->getMessage()]);
        }
    }
}
