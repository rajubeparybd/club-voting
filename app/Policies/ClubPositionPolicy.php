<?php

namespace App\Policies;

use App\Models\ClubPosition;
use App\Models\User;

class ClubPositionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_club_positions');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ClubPosition $clubPosition): bool
    {
        return $user->hasPermissionTo('view_club_positions');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_club_positions');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ClubPosition $clubPosition): bool
    {
        return $user->hasPermissionTo('edit_club_positions');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ClubPosition $clubPosition): bool
    {
        return $user->hasPermissionTo('delete_club_positions');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ClubPosition $clubPosition): bool
    {
        return $user->hasPermissionTo('restore_club_positions');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ClubPosition $clubPosition): bool
    {
        return $user->hasPermissionTo('force_delete_club_positions');
    }
}
