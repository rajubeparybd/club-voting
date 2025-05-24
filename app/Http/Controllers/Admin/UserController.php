<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\Department;
use App\Models\User;
use App\Notifications\User\WelcomeUserNotification;
use App\Support\MediaHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $hasAuthorization = $this->checkAuthorization('view_users', $request);
        if ($hasAuthorization) {
            return $hasAuthorization;
        }

        // get only name of the role
        $users = User::with(['roles', 'department'])->get();

        return Inertia::render('admin/users/index', [
            'users'       => UserResource::collection($users),
            'roles'       => Role::select('id', 'name')->orderBy('name')->get(),
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request): Response
    {
        //
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $hasAuthorization = $this->checkAuthorization('create_users', $request, true);
        if ($hasAuthorization) {
            return $hasAuthorization;
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
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
        //
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        //
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user, Request $request): RedirectResponse
    {
        $hasAuthorization = $this->checkAuthorization('delete_users', $request, true);
        if ($hasAuthorization) {
            return $hasAuthorization;
        }

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
        if ($hasAuthorization) {
            return $hasAuthorization;
        }

        $validated = $request->validate([
            'roles'   => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->syncRoles($validated['roles'] ?? []);

        $this->logActivity(sprintf('%s updated %s user roles', auth()->user()->name, $user->name), 'user');

        return back()->with('success', 'User roles updated successfully!');
    }

    /**
     * Store a newly created user from student API data.
     */
    public function storeFromApi(Request $request): RedirectResponse
    {
        $hasAuthorization = $this->checkAuthorization('create_users', $request, true);
        if ($hasAuthorization) {
            return $hasAuthorization;
        }

        $validated = $request->validate([
            'student_id'                 => 'required|string|unique:' . User::class,
            'intake'                     => 'required|string',
            'email'                      => 'required|email|unique:' . User::class,
            'student_data'               => 'required|array',
            'student_data.name'          => 'nullable|string',
            'student_data.gender'        => 'nullable|string',
            'student_data.department_id' => 'nullable|exists:departments,id',
            'student_data.avatar'        => 'nullable|string',
        ]);

        // Generate a random password
        $password = Str::random(10);

        // Create the user
        $user = User::create([
            'student_id'    => $validated['student_id'],
            'intake'        => $validated['intake'],
            'name'          => $validated['student_data']['name'] ?? null,
            'email'         => $validated['email'],
            'gender'        => $validated['student_data']['gender'] ?? null,
            'department_id' => $validated['student_data']['department_id'] ?? null,
            'password'      => Hash::make($password),
        ]);

        // Handle avatar upload if available
        if (isset($validated['student_data']['avatar']) && $validated['student_data']['avatar']) {
            MediaHelper::addMediaFromBase64($user, $validated['student_data']['avatar'], 'avatar', $user->student_id);
        }

        // Assign default role
        $user->assignRole('user');

        // Send welcome notification with password
        $user->notify(new WelcomeUserNotification($password));

        $this->logActivity(sprintf('%s created user %s via API', auth()->user()->name, $user->name), 'user');

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully! Password sent to user\'s email.');
    }
}
