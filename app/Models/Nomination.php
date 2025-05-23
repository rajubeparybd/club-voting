<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Nomination extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'start_date'           => 'datetime',
        'end_date'             => 'datetime',
        'eligibility_criteria' => 'array',
    ];

    /**
     * Get the club that owns the nomination.
     */
    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    /**
     * Get the applications for this nomination.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(NominationApplication::class);
    }

    /**
     * Get the positions for this nomination.
     */
    public function positions(): BelongsToMany
    {
        return $this->belongsToMany(ClubPosition::class, 'nomination_positions')
            ->withPivot('max_applicants', 'additional_requirements', 'status', 'admin_notes')
            ->withTimestamps();
    }

    /**
     * Get the winners for this nomination.
     */
    public function winners(): HasMany
    {
        return $this->hasMany(NominationWinner::class);
    }

    /**
     * Check if the nomination is currently open.
     */
    public function isOpen(): bool
    {
        $now = now();
        return $this->status === 'active' &&
        $now->greaterThanOrEqualTo($this->start_date) &&
        $now->lessThanOrEqualTo($this->end_date);
    }

    /**
     * Check if the nomination is closed or has ended.
     */
    public function isClosed(): bool
    {
        return $this->status === 'closed' ||
        $this->status === 'archived' ||
        now()->greaterThan($this->end_date);
    }
}
