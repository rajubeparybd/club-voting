<?php

namespace App\Policies;

use App\Models\Club;
use App\Models\User;

class ClubsPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_clubs');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Club $club): bool
    {
        return $user->hasPermissionTo('view_clubs');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_clubs');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Club $club): bool
    {
        return $user->hasPermissionTo('edit_clubs');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Club $club): bool
    {
        return $user->hasPermissionTo('delete_clubs');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Club $club): bool
    {
        return $user->hasPermissionTo('restore_clubs');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Club $club): bool
    {
        return $user->hasPermissionTo('force_delete_clubs');
    }
}
