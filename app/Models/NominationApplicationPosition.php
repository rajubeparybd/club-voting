<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class NominationApplicationPosition extends Pivot
{
    // protected $table = 'nomination_application_positions';

    protected $guarded = ['id'];

    /**
     * Get the nomination application this pivot belongs to.
     */
    public function nominationApplication(): BelongsTo
    {
        return $this->belongsTo(NominationApplication::class);
    }

    /**
     * Get the club position this pivot belongs to.
     */
    public function clubPosition(): BelongsTo
    {
        return $this->belongsTo(ClubPosition::class);
    }
}
