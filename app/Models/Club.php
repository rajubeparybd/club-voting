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

    protected $appends = ['members_count'];

    protected $with = ['positions'];

    public function getMembersCountAttribute()
    {
        return $this->users()->count();
    }

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
     * Get the payment logs for the club.
     */
    public function paymentLogs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    /**
     * Get active nominations for this club.
     */
    public function activeNominations()
    {
        return $this->nominations()->where('status', 'active')
            ->where('end_date', '>=', now());
    }

    /**
     * Get the voting events for the club.
     */
    public function votingEvents(): HasMany
    {
        return $this->hasMany(VotingEvent::class);
    }

    /**
     * Get positions with their current holders based on the most recent voting event.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getPositionsWithCurrentHolders()
    {
        $positions = $this->positions()->where('is_active', true)->get();

        // Find the most recent closed or archived voting event
        $mostRecentVotingEvent = $this->votingEvents()
            ->where('status', 'closed')
            ->orderBy('id', 'desc')
            ->first();

        if (! $mostRecentVotingEvent) {
            // No closed voting events, return positions without holders
            return $positions->map(function ($position) {
                $position->current_holder = null;
                $position->votes_count    = null;
                return $position;
            });
        }

        // Get the last nomination for this club
        $lastNomination = $this->nominations()
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $lastNomination) {
            // No nominations, return positions without holders
            return $positions->map(function ($position) {
                $position->current_holder = null;
                return $position;
            });
        }

        // Get winners from the most recent voting event
        $winners = $lastNomination->winners->where('voting_event_id', $mostRecentVotingEvent->id);

        // Map positions with their holders
        return $positions->map(function ($position) use ($winners, $lastNomination, $mostRecentVotingEvent) {
            $winner = $winners->where('club_position_id', $position->id)->where('nomination_id', $lastNomination->id)->where('voting_event_id', $mostRecentVotingEvent->id)->first();

            // First try to get the winner directly from winner_id
            if ($winner && $winner->winner_id) {
                $user           = User::where('status', 'active')->where('id', $winner->winner_id)->first();
                $clubMembership = $user->clubs()->where('club_id', $this->id)->first();

                $isActiveMember = $clubMembership ? $clubMembership->pivot->status === 'active' : false;

                $position->current_holder  = $isActiveMember ? $user : null;
                $position->votes_count     = $isActiveMember ? $winner->votes_count : null;
                $position->is_tie_resolved = $winner->is_tie_resolved;
            } else {
                $position->current_holder  = null;
                $position->votes_count     = null;
                $position->is_tie_resolved = null;
            }

            return $position;
        });
    }
}
