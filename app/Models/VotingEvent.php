<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class VotingEvent extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = ['id'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date'   => 'datetime',
    ];

    /**
     * Get the club that owns the voting event.
     */
    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    /**
     * Get the votes for this voting event.
     */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    /**
     * Get the winners for this voting event.
     */
    public function winners(): HasMany
    {
        return $this->hasMany(NominationWinner::class);
    }

    /**
     * Get the nomination winners for this voting event.
     * Alias for winners() for more explicit naming in eager loading.
     */
    public function nominationWinners(): HasMany
    {
        return $this->hasMany(NominationWinner::class);
    }

    /**
     * Get the notification reminders for this voting event.
     */
    public function notificationReminders(): MorphMany
    {
        return $this->morphMany(NotificationReminder::class, 'notifiable');
    }
}
