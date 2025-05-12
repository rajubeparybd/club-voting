<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class NominationApplication extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = ['id'];

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
     * Get the positions that this application is for.
     */
    public function positions(): BelongsToMany
    {
        return $this->belongsToMany(ClubPosition::class, 'nomination_application_position')
            ->using(NominationApplicationPosition::class)
            ->withPivot('additional_requirements', 'status', 'max_applicants', 'admin_notes')
            ->withTimestamps();
    }

    /**
     * Register the media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('na_statement');
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
}
