<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['exists:roles,id'],
        ];

        if ($this->isMethod('post')) {
            // Create operation
            $rules['email'][] = 'unique:users,email';
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
        } else {
            // Update operation
            $rules['email'][] = 'unique:users,email,' . $this->user?->id;
            $rules['password'] = ['nullable', 'confirmed', Password::defaults()];
        }

        return $rules;
    }
}
