<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoleRequest;
use App\Support\RoleManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{

    use RoleManager;

    /**
     * Display a listing of the roles.
     */
    public function index(Request $request): Response
    {
        $response = $this->checkAuthorization('view_roles', $request);

        if ($response) {
            return $response;
        }

        $query = Role::query()
            ->with('permissions')
            ->withCount('users');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $per_page = $request->get('per_page', 10);

        return Inertia::render('admin/roles/index', [
            'roles' => $query->latest()->paginate($per_page)
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(RoleRequest $request): RedirectResponse
    {
        $response = $this->checkAuthorization('create_roles', $request, true, 'admin.dashboard');

        if ($response) {
            return $response;
        }

        $role = Role::create([
            'name'       => $request->name,
            'guard_name' => 'web',
        ]);

        if ($role) {
            $this->logActivity(sprintf('%s created a new %s role', auth()->user()->name, $this->formatRoleToText($role->name)), 'role');
        }

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role created successfully!');
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(Request $request): Response
    {
        $response = $this->checkAuthorization('create_roles', $request);

        if ($response) {
            return $response;
        }

        $permissions = Permission::all();

        return Inertia::render('admin/roles/create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Request $request, Role $role): Response
    {
        $response = $this->checkAuthorization('edit_roles', $request);

        if ($response) {
            return $response;
        }

        $permissions = Permission::all();
        $role->load('permissions');

        return Inertia::render('admin/roles/edit', [
            'role'        => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        $response = $this->checkAuthorization('edit_roles', $request, true, 'admin.dashboard');

        if ($response) {
            return $response;
        }

        if ($role->name === 'admin' || $role->name === 'user') {
            return back()->with('error', 'The admin role cannot be renamed.');
        }

        $role->update([
            'name' => $request->name,
        ]);

        if ($role) {
            $this->logActivity(sprintf('%s updated the %s role', auth()->user()->name, $this->formatRoleToText($role->name)), 'role');
        }
        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role updated successfully!');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Request $request, Role $role): RedirectResponse
    {
        $response = $this->checkAuthorization('delete_roles', $request, true, 'admin.dashboard');

        if ($response) {
            return $response;
        }

        if ($role->name === 'admin' || $role->name === 'user') {
            return back()->with('error', 'This is a default role and cannot be deleted.');
        }

        $role->delete();

        if ($role) {
            $this->logActivity(sprintf('%s deleted the %s role', auth()->user()->name, $this->formatRoleToText($role->name)), 'role');
        }

        return back()->with('success', 'Role deleted successfully!');
    }

}
