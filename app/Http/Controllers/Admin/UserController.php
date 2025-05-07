<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use App\Models\Department;
use App\Http\Resources\Admin\UserResource;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $hasAuthorization = $this->checkAuthorization('view_users', $request);
        if ($hasAuthorization) return $hasAuthorization;

        // get only name of the role
        $users = User::with(['roles', 'department'])->get();


        return Inertia::render('admin/users/index', [
            'users' => UserResource::collection($users),
            'roles' => Role::select('id', 'name')->orderBy('name')->get(),
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request): Response
    {
        $hasAuthorization = $this->checkAuthorization('create_users', $request);
        if ($hasAuthorization) return $hasAuthorization;

        $roles = Role::all();

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $hasAuthorization = $this->checkAuthorization('create_users', $request, true);
        if ($hasAuthorization) return $hasAuthorization;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);



        if ($request->roles) {
            $user->syncRoles($request->roles);
        }

        $this->logActivity(sprintf('%s created %s user', auth()->user()->name, $user->name), 'user');

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully!');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $hasAuthorization = $this->checkAuthorization('edit_users', $request);
        if ($hasAuthorization) return $hasAuthorization;

        $roles = Role::all();
        $user->load('roles');

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $hasAuthorization = $this->checkAuthorization('edit_users', $request, true);
        if ($hasAuthorization) return $hasAuthorization;

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->password) {
            $user->update([
                'password' => bcrypt($request->password),
            ]);
        }

        if ($request->roles) {
            $user->syncRoles($request->roles);
        }

        $this->logActivity(sprintf('%s updated %s user', auth()->user()->name, $user->name), 'user');

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully!');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user, Request $request): RedirectResponse
    {
        $hasAuthorization = $this->checkAuthorization('delete_users', $request, true);
        if ($hasAuthorization) return $hasAuthorization;

        if (auth()->id() === $user->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if ($user->roles->contains('name', 'admin')) {
            return back()->with('error', 'You cannot delete the admin account.');
        }

        $user->delete();

        $this->logActivity(sprintf('%s deleted %s user', auth()->user()->name, $user->name), 'user');

        return back()->with('success', 'User deleted successfully!');
    }

    /**
     * Update the specified user's roles.
     */
    public function updateRoles(Request $request, User $user): RedirectResponse
    {
        $hasAuthorization = $this->checkAuthorization('edit_users', $request, true);
        if ($hasAuthorization) return $hasAuthorization;

        $validated = $request->validate([
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->syncRoles($validated['roles'] ?? []);

        $this->logActivity(sprintf('%s updated %s user roles', auth()->user()->name, $user->name), 'user');

        return back()->with('success', 'User roles updated successfully!');
    }
}
