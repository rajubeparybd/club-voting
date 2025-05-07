<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @see \App\Models\User */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'department' => $this->department?->name,
            'avatar' => $this->avatar,
            'intake' => $this->intake,
            'roles' => $this->roles,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
