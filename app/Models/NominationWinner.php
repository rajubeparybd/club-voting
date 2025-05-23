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
}
