<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
}
