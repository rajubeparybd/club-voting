<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vote extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = ['id'];

    /**
     * Get the user who cast this vote.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the voting event this vote belongs to.
     */
    public function votingEvent(): BelongsTo
    {
        return $this->belongsTo(VotingEvent::class);
    }

    /**
     * Get the nomination application (candidate) this vote is for.
     */
    public function nominationApplication(): BelongsTo
    {
        return $this->belongsTo(NominationApplication::class);
    }
}
