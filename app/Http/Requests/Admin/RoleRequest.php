<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
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
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ];

        if ($this->isMethod('post')) {
            // Create operation
            $rules['name'][] = 'unique:roles,name';
        } else {
            // Update operation
            $role = $this->route('role');
            $rules['name'][] = 'unique:roles,name,' . $role?->id;
        }

        return $rules;
    }
}
