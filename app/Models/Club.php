<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Club extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'open_date' => 'datetime',
    ];

    /**
     * Get the users that belong to the club.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('position_id', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get the positions for the club.
     */
    public function positions(): HasMany
    {
        return $this->hasMany(ClubPosition::class);
    }
}
