<?php
namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

class AdminHelper
{
    /**
     * Get all users with admin role
     *
     * @return Collection
     */
    public static function getAdminUsers(): Collection
    {
        return User::role('admin')->where('status', 'active')->get();
    }

    /**
     * Get all users with club admin role for a specific club
     *
     * @param int $clubId
     * @param string $permission
     * @return Collection
     */
    public static function getClubAdminUsers(int $clubId, string $permission = 'view_voting_events'): Collection
    {
        $roles = Role::where('name', 'like', 'c_admin_%')->get()->pluck('name');

        if (Role::where('name', 'c_admin_' . $clubId)->exists()) {
            $users = User::role('c_admin_' . $clubId)->where('status', 'active')->get();
            return $users->filter(function ($user) use ($permission) {
                return $user->hasPermissionTo($permission);
            });
        }

        $users = User::role($roles)->where('status', 'active')->get();
        return $users->filter(function ($user) use ($permission) {
            return $user->hasPermissionTo($permission);
        });
    }
}
