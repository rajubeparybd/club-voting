<?php

namespace App\Http\Requests\User\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar' => ['nullable', 'string'],
            'avatar_file' => ['nullable', 'image', 'max:2048'], // 2MB max
            'gender' => ['nullable', 'string', 'in:M,F,O'],
            'intake' => ['nullable', 'string', 'max:50'],
            'department_id' => ['nullable', 'exists:departments,id'],
        ];
    }
}
