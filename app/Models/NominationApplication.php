<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class NominationApplication extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = ['id'];

    protected $appends = ['cv_url'];

    /**
     * Get the nomination that this application belongs to.
     */
    public function nomination(): BelongsTo
    {
        return $this->belongsTo(Nomination::class);
    }

    /**
     * Get the user that submitted this application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the club that this application is for.
     */
    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    /**
     * Get the club position that this application is for.
     */
    public function clubPosition(): BelongsTo
    {
        return $this->belongsTo(ClubPosition::class);
    }

    /**
     * Register the media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cv')
            ->singleFile();
    }

    /**
     * Get the CV URL.
     */
    public function getCvUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('cv');
    }

    /**
     * Check if the application is pending review.
     */
    public function isPending(): bool
    {
        return $this->positions()->where('status', 'pending')->exists();
    }

    /**
     * Check if the application has been approved.
     */
    public function isApproved(): bool
    {
        return $this->positions()->where('status', 'approved')->exists();
    }

    /**
     * Check if the application has been rejected.
     */
    public function isRejected(): bool
    {
        return $this->positions()->where('status', 'rejected')->exists();
    }

    /**
     * Get the votes for this nomination application (candidate).
     */
    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    /**
     * Check if this application is a winner for any position.
     */
    public function winner()
    {
        return $this->hasOne(NominationWinner::class);
    }
}
