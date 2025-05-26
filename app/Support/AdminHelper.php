<?php
namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

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
     * @return Collection
     */
    public static function getClubAdminUsers(int $clubId): Collection
    {
        return User::role('c_admin_' . $clubId)->where('status', 'active')->get();
    }
}
