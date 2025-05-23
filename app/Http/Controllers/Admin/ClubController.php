<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClubRequest;
use App\Models\Club;
use App\Models\PaymentLog;
use App\Models\User;
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
        $response = $this->checkAuthorization('view_clubs', $request);
        if ($response) {
            return $response;
        }

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
            'clubs' => $query->latest()->paginate($per_page),
        ]);
    }

    /**
     * Show the form for creating a new club.
     */
    public function create(Request $request): Response
    {
        $response = $this->checkAuthorization('create_clubs', $request);
        if ($response) {
            return $response;
        }

        return Inertia::render('admin/clubs/create');
    }

    /**
     * Store a newly created club in storage.
     */
    public function store(ClubRequest $request)
    {
        $response = $this->checkAuthorization('create_clubs', $request, true, 'admin.dashboard');
        if ($response) {
            return $response;
        }

        $validated = $request->validated();
        $positions = $validated['positions'] ?? '[]';
        unset($validated['positions']);

        // Parse positions from JSON string
        if (is_string($positions)) {
            $positions = json_decode($positions, true);
        }

        // Handle image upload if present
        if ($request->hasFile('club_image')) {
            $file               = $request->file('club_image');
            $path               = $file->store('clubs', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $club = Club::create($validated);

        if ($club) {
            $this->logActivity(sprintf('%s created a new %s club', auth()->user()->name, $club->name), 'club');
        }

        // Create positions
        if (! empty($positions)) {
            foreach ($positions as $position) {
                $club->positions()->create([
                    'name'        => $position['name'],
                    'description' => $position['description'] ?? null,
                    'is_active'   => $position['is_active'] ?? true,
                ]);
            }
        }

        return to_route('admin.clubs.index')->with('success', 'Club created successfully.');
    }

    /**
     * Show the club details.
     */
    public function show(Club $club, Request $request): Response
    {
        $response = $this->checkAuthorization('view_clubs', $request);
        if ($response) {
            return $response;
        }

        $club->load([
            'users',
            'users.paymentLogs.paymentMethod',
        ]);

        // Get positions with their current holders from nomination winners
        $positionsWithHolders = $club->getPositionsWithCurrentHolders();

        return Inertia::render('admin/clubs/show', [
            'club'                 => $club,
            'positionsWithHolders' => $positionsWithHolders,
        ]);
    }

    /**
     * Show the form for editing the club.
     */
    public function edit(Club $club, Request $request): Response
    {
        $response = $this->checkAuthorization('edit_clubs', $request);
        if ($response) {
            return $response;
        }

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
        $response = $this->checkAuthorization('edit_clubs', $request, true, 'admin.dashboard');
        if ($response) {
            return $response;
        }

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
            $file               = $request->file('club_image');
            $path               = $file->store('clubs', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $club->update($validated);

        if ($club) {
            $this->logActivity(sprintf('%s updated the %s', auth()->user()->name, $club->name), 'club');
        }

        // Update positions
        if (! empty($positions)) {
            // Handle positions sent as JSON string
            if (is_string($positions)) {
                $positions = json_decode($positions, true);
            }

            // Delete existing positions
            $club->positions()->delete();

            // Create new positions
            foreach ($positions as $position) {
                $club->positions()->create([
                    'name'        => $position['name'],
                    'description' => $position['description'] ?? null,
                    'is_active'   => $position['is_active'] ?? true,
                ]);
            }
        }

        return to_route('admin.clubs.index')->with('success', 'Club updated successfully.');
    }

    /**
     * Remove the club from storage.
     */
    public function destroy(Club $club, Request $request)
    {
        $response = $this->checkAuthorization('delete_clubs', $request, true, 'admin.dashboard');
        if ($response) {
            return $response;
        }

        // Delete the club image if exists
        if ($club->image && Storage::disk('public')->exists(str_replace('/storage/', '', $club->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $club->image));
        }

        $club->delete();

        if ($club) {
            $this->logActivity(sprintf('%s deleted the %s', auth()->user()->name, $club->name), 'club');
        }
        return to_route('admin.clubs.index')->with('success', 'Club deleted successfully.');
    }

    /**
     * Update a member's status in the club.
     */
    public function updateMemberStatus(Request $request, Club $club, User $user)
    {
        $response = $this->checkAuthorization('edit_club_users', $request);
        if ($response) {
            return $response;
        }

        $request->validate([
            'status' => 'required|in:active,inactive,pending,banned',
        ]);

        $club->users()->updateExistingPivot($user->id, [
            'status' => $request->status,
        ]);

        if ($club) {
            $this->logActivity(sprintf('%s updated the status of %s in the %s', auth()->user()->name, $user->name, $club->name), 'club');
        }

        return back()->with('success', 'Member status updated successfully.');
    }

    /**
     * Update a member's position assignment in the club manually.
     * Note: This is separate from position assignments through voting events.
     */
    public function updateMemberPosition(Request $request, Club $club, User $user)
    {
        $response = $this->checkAuthorization('edit_club_users', $request);
        if ($response) {
            return $response;
        }

        $request->validate([
            'position_id' => 'nullable|exists:club_positions,id,club_id,' . $club->id,
        ]);

        $club->users()->updateExistingPivot($user->id, [
            'position_id' => $request->position_id,
        ]);

        if ($club) {
            $this->logActivity(sprintf('%s manually assigned %s to position in the %s', auth()->user()->name, $user->name, $club->name), 'club');
        }
        return back()->with('success', 'Member position updated successfully.');
    }

    /**
     * Remove a member from the club.
     */
    public function removeMember(Club $club, User $user, Request $request)
    {
        $response = $this->checkAuthorization('delete_club_users', $request);
        if ($response) {
            return $response;
        }

        $club->users()->detach($user->id);

        if ($club) {
            $this->logActivity(sprintf('%s removed %s from the %s', auth()->user()->name, $user->name, $club->name), 'club');
        }
        return back()->with('success', 'Member removed from club successfully.');
    }

    /**
     * Update payment status and member status based on payment approval/rejection
     */
    public function updatePaymentStatus(Request $request, Club $club, User $user, PaymentLog $payment)
    {
        $response = $this->checkAuthorization('edit_club_users', $request);
        if ($response) {
            return $response;
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        // Update payment status
        $payment->update([
            'status' => $request->status,
        ]);

        // If payment is approved, activate the member
        if ($request->status === 'approved') {
            $club->users()->updateExistingPivot($user->id, [
                'status' => 'active',
            ]);

            $actionMessage = 'approved';
        } else {
            $club->users()->updateExistingPivot($user->id, [
                'status' => 'inactive',
            ]);
            $actionMessage = 'rejected';
        }

        $this->logActivity(
            sprintf('%s %s payment for %s in the %s club',
                auth()->user()->name,
                $actionMessage,
                $user->name,
                $club->name),
            'payment'
        );

        return back()->with('success', "Payment and member status {$actionMessage} successfully.");
    }

    /**
     * Add multiple users to the club at once
     */
    public function addMembers(Request $request, Club $club)
    {
        $response = $this->checkAuthorization('edit_club_users', $request);
        if ($response) {
            return $response;
        }

        $request->validate([
            'user_ids'   => 'required|array',
            'user_ids.*' => 'required|exists:users,id',
        ]);

        $userIds    = $request->user_ids;
        $attachData = [];

        // Prepare data for attaching users
        foreach ($userIds as $userId) {
            $attachData[$userId] = [
                'status'    => 'active',
                'joined_at' => now(),
            ];
        }

        // Attach users to club
        $club->users()->attach($attachData);

        if (count($userIds) > 0) {
            $this->logActivity(
                sprintf('%s added %d members to the %s club',
                    auth()->user()->name,
                    count($userIds),
                    $club->name
                ),
                'club'
            );
        }

        return back()->with('success', count($userIds) . ' members added to club successfully.');
    }

    /**
     * Get a list of users who are not members of the specified club
     */
    public function getNonMembers(Request $request, Club $club)
    {
        $response = $this->checkAuthorization('edit_club_users', $request);
        if ($response) {
            return $response;
        }

        // Get IDs of existing members
        $existingMemberIds = $club->users()->pluck('users.id')->toArray();

        // Query for users who are not members (limit to 100 for performance)
        $users = User::whereNotIn('id', $existingMemberIds)
            ->select(['id', 'name', 'email', 'student_id', 'avatar'])
            ->take(100)
            ->get();

        return response()->json($users);
    }
}
