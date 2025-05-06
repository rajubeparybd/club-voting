<?php

namespace App\Http\Resources\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Activitylog\Models\Activity;

/** @mixin Activity */
class ActivityResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $causer = NULL;
        if ($this->causer_type === User::class && $this->causer_id) {
            $causer = User::select('id', 'name', 'email')->find($this->causer_id);
        }

        return [
            'id'          => $this->id,
            'log_name'    => $this->log_name,
            'description' => $this->description,
            'causer'      => $causer,
            'event'       => $this->event,
            'created_at'  => $this->created_at->format('H:i:s A, d M, Y'),
        ];
    }

}
