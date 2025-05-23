<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NominationWinner extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = ['id'];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-set winner_id if not provided but we have nomination_application_id
        static::creating(function (NominationWinner $winner) {
            if (empty($winner->winner_id) && ! empty($winner->nomination_application_id)) {
                $application = NominationApplication::find($winner->nomination_application_id);
                if ($application) {
                    $winner->winner_id = $application->user_id;
                }
            }
        });
    }

    /**
     * Get the nomination that this winner belongs to.
     */
    public function nomination(): BelongsTo
    {
        return $this->belongsTo(Nomination::class);
    }

    /**
     * Get the voting event this winner belongs to.
     */
    public function votingEvent(): BelongsTo
    {
        return $this->belongsTo(VotingEvent::class);
    }

    /**
     * Get the nomination application (candidate) that won.
     */
    public function nominationApplication(): BelongsTo
    {
        return $this->belongsTo(NominationApplication::class);
    }

    /**
     * Get the club position this winner is for.
     */
    public function clubPosition(): BelongsTo
    {
        return $this->belongsTo(ClubPosition::class);
    }

    /**
     * Get the user who won.
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }
}
