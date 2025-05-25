<?php
namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class SetNotificationReminderRequest extends FormRequest
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
        return [
            'email'             => [
                'required',
                'email:rfc,dns',
                'max:255',
            ],
            'reminder_time'     => [
                'nullable',
                'integer',
                'min:1',
                'max:168',
            ],
            'notification_type' => [
                'nullable',
                'string',
                'in:email,sms,push',
            ],
            'notes'             => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required'       => 'An email address is required to set up the reminder.',
            'email.email'          => 'Please provide a valid email address.',
            'reminder_time.min'    => 'Reminder must be at least 1 hour before the event.',
            'reminder_time.max'    => 'Reminder cannot be set more than 7 days in advance.',
            'notification_type.in' => 'Notification type must be email, sms, or push.',
        ];
    }

    /**
     * Get the validated email.
     */
    public function getEmail(): string
    {
        return $this->validated('email');
    }

    /**
     * Get the reminder time in hours (default: 24 hours before).
     */
    public function getReminderTime(): int
    {
        return $this->validated('reminder_time', 24);
    }

    /**
     * Get the notification type (default: email).
     */
    public function getNotificationType(): string
    {
        return $this->validated('notification_type', 'email');
    }

    /**
     * Get the optional notes.
     */
    public function getNotes(): ?string
    {
        return $this->validated('notes');
    }
}
