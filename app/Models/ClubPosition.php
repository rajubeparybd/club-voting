<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClubPosition extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the club that owns the position.
     */
    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    /**
     * Get the users who have this position.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'club_position_user')
            ->withTimestamps()
            ->withPivot('joined_at');
    }

    /**
     * Get the nomination applications for this position.
     */
    public function nominationApplications(): BelongsToMany
    {
        return $this->belongsToMany(NominationApplication::class, 'nomination_application_position')
            ->using(NominationApplicationPosition::class)
            ->withPivot('additional_requirements', 'status', 'max_applicants', 'admin_notes')
            ->withTimestamps();
    }

    /**
     * Get the nomination winners for this position.
     */
    public function nominationWinners(): HasMany
    {
        return $this->hasMany(NominationWinner::class);
    }

    /**
     * Get the current holder of this position based on the most recent voting event.
     *
     * @param int|null $clubId Optional club ID to filter by if needed
     * @return \App\Models\User|null
     */
    public function getCurrentHolder($clubId = null)
    {
        $query = $this->nominationWinners()
            ->whereHas('votingEvent', function ($query) use ($clubId) {
                $query->where('status', 'closed');

                if ($clubId) {
                    $query->where('club_id', $clubId);
                }
            })
            ->with(['nominationApplication.user', 'votingEvent'])
            ->orderBy('voting_event_id', 'desc'); // Get the most recent voting event

        $winner = $query->first();

        return $winner ? $winner->nominationApplication->user : null;
    }
}
