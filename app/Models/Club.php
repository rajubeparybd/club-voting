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
            ->withPivot('position_id', 'status', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get the positions for the club.
     */
    public function positions(): HasMany
    {
        return $this->hasMany(ClubPosition::class);
    }

    /**
     * Get the nominations for the club.
     */
    public function nominations(): HasMany
    {
        return $this->hasMany(Nomination::class);
    }

    /**
     * Get active nominations for this club.
     */
    public function activeNominations()
    {
        return $this->nominations()->where('status', 'active')
            ->where('end_date', '>=', now());
    }
}
