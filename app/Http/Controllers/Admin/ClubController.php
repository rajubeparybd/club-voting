<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClubRequest;
use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ClubController extends Controller
{
    /**
     * Display a listing of the clubs.
     */
    public function index(Request $request): Response
    {
        $query = Club::query()
            ->withCount('users')
            ->withCount('positions');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        $per_page = $request->get('per_page', 10);

        return Inertia::render('admin/clubs/index', [
            'clubs' => $query->latest()->paginate($per_page)
        ]);
    }

    /**
     * Show the form for creating a new club.
     */
    public function create(): Response
    {
        return Inertia::render('admin/clubs/create');
    }

    /**
     * Store a newly created club in storage.
     */
    public function store(ClubRequest $request)
    {
        $validated = $request->validated();
        $positions = $validated['positions'] ?? '[]';
        unset($validated['positions']);

        // Parse positions from JSON string
        if (is_string($positions)) {
            $positions = json_decode($positions, true);
        }

        // Handle image upload if present
        if ($request->hasFile('club_image')) {
            $file = $request->file('club_image');
            $path = $file->store('clubs', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $club = Club::create($validated);

        // Create positions
        if (!empty($positions)) {
            foreach ($positions as $position) {
                $club->positions()->create([
                    'name' => $position['name'],
                    'description' => $position['description'] ?? null,
                    'is_active' => $position['is_active'] ?? true,
                ]);
            }
        }

        return to_route('admin.clubs.index')->with('success', 'Club created successfully.');
    }

    /**
     * Show the club details.
     */
    public function show(Club $club): Response
    {
        $club->load(['positions', 'users']);

        return Inertia::render('admin/clubs/show', [
            'club' => $club,
        ]);
    }

    /**
     * Show the form for editing the club.
     */
    public function edit(Club $club): Response
    {
        $club->load('positions');

        return Inertia::render('admin/clubs/edit', [
            'club' => $club,
        ]);
    }

    /**
     * Update the club in storage.
     */
    public function update(ClubRequest $request, Club $club)
    {
        $validated = $request->validated();
        $positions = $validated['positions'] ?? [];
        unset($validated['positions']);

        // Handle image upload if present
        if ($request->hasFile('club_image')) {
            // Delete old image if exists
            if ($club->image && Storage::disk('public')->exists(str_replace('/storage/', '', $club->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $club->image));
            }

            // Store new image
            $file = $request->file('club_image');
            $path = $file->store('clubs', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $club->update($validated);

        // Update positions
        if (!empty($positions)) {
            // Handle positions sent as JSON string
            if (is_string($positions)) {
                $positions = json_decode($positions, true);
            }

            // Delete existing positions
            $club->positions()->delete();

            // Create new positions
            foreach ($positions as $position) {
                $club->positions()->create([
                    'name' => $position['name'],
                    'description' => $position['description'] ?? null,
                    'is_active' => $position['is_active'] ?? true,
                ]);
            }
        }

        return to_route('admin.clubs.index')->with('success', 'Club updated successfully.');
    }

    /**
     * Remove the club from storage.
     */
    public function destroy(Club $club)
    {
        // Delete the club image if exists
        if ($club->image && Storage::disk('public')->exists(str_replace('/storage/', '', $club->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $club->image));
        }

        $club->delete();

        return to_route('admin.clubs.index')->with('success', 'Club deleted successfully.');
    }
}
