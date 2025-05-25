<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\SetNotificationReminderRequest;
use App\Models\Nomination;
use App\Models\NotificationReminder;
use App\Models\VotingEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class NotificationReminderController extends Controller
{
    /**
     * Set a reminder for any notifiable model.
     */
    public function store(SetNotificationReminderRequest $request, string $type, int $id)
    {
        // Map type to model class
        $modelClass = $this->getModelClass($type);

        if (! $modelClass) {
            return back()->with('error', 'Invalid model type provided.');
        }

        // Find the notifiable model
        $notifiable = $modelClass::find($id);

        if (! $notifiable) {
            return back()->with('error', 'The requested item was not found.');
        }

        // Validate the notifiable model has required fields
        $validationResult = $this->validateNotifiable($notifiable, $type);
        if ($validationResult) {
            return $validationResult;
        }

        // Calculate scheduled time based on model type
        $scheduledTime = $this->calculateScheduledTime($notifiable, $request->getReminderTime(), $type);

        if ($scheduledTime <= now()) {
            return back()->with('error', 'The calculated reminder time is in the past. Please choose a different reminder time.');
        }

        // Check for existing reminder
        $existingReminder = NotificationReminder::where('notifiable_type', $modelClass)
            ->where('notifiable_id', $id)
            ->where('email', $request->getEmail())
            ->where('status', 'pending')
            ->first();

        if ($existingReminder) {
            return back()->with('error', sprintf('A reminder for this item (%s) is already set for this email address at %s.', $notifiable->title, $existingReminder->scheduled_time->format('d M, Y h:i:s A')));
        }

        // Create the reminder
        $reminder = NotificationReminder::create([
            'notifiable_type'   => $modelClass,
            'notifiable_id'     => $id,
            'user_id'           => Auth::id(),
            'email'             => $request->getEmail(),
            'scheduled_time'    => $scheduledTime,
            'notification_type' => $request->getNotificationType(),
            'status'            => 'pending',
            'notes'             => $request->getNotes(),
            'reminder_data'     => $this->buildReminderData($notifiable, $type),
        ]);

        return back()->with('success', 'Reminder set successfully.');
    }

    /**
     * Get user's reminders.
     */
    public function index()
    {
        $user = Auth::user();

        if (! $user) {
            return back()->with('error', 'Authentication required.');
        }

        $reminders = NotificationReminder::with('notifiable')
            ->where('user_id', $user->id)
            ->orderBy('scheduled_time', 'desc')
            ->get()
            ->map(function ($reminder) {
                return [
                    'id'                => $reminder->id,
                    'email'             => $reminder->email,
                    'scheduled_time'    => $reminder->scheduled_time->format('Y-m-d H:i:s'),
                    'status'            => $reminder->status,
                    'notification_type' => $reminder->notification_type,
                    'notifiable_type'   => $reminder->notifiable_type_name,
                    'notifiable'        => $this->formatNotifiableData($reminder->notifiable, class_basename($reminder->notifiable_type)),
                ];
            });

        return back()->with('reminders', $reminders);
    }

    /**
     * Cancel a reminder.
     */
    public function destroy(NotificationReminder $reminder)
    {
        // Check if user owns the reminder
        $user = Auth::user();
        if ($user && $reminder->user_id !== $user->id) {
            return back()->with('error', 'You can only cancel your own reminders.');
        }

        // Check if reminder can be cancelled
        if ($reminder->status !== 'pending') {
            return back()->with('error', 'Only pending reminders can be cancelled.');
        }

        $reminder->update(['status' => 'cancelled']);

        return back()->with('success', 'Reminder cancelled successfully.');
    }

    /**
     * Map type string to model class.
     */
    private function getModelClass(string $type): ?string
    {
        return match ($type) {
            'voting-event' => VotingEvent::class,
            'nomination' => Nomination::class,
            default => null,
        };
    }

    /**
     * Validate that the notifiable model has required fields.
     */
    private function validateNotifiable($notifiable, string $type)
    {
        switch ($type) {
            case 'voting-event':
                if ($notifiable->start_date <= now()) {
                    return back()->with('error', 'Cannot set reminder for a voting event that has already started.');
                }
                break;
            case 'nomination':
                if ($notifiable->start_date <= now()) {
                    return back()->with('error', 'Cannot set reminder for a nomination that has already started.');
                }
                break;
        }

        return null;
    }

    /**
     * Calculate scheduled time based on model type.
     */
    private function calculateScheduledTime($notifiable, int $reminderHours, string $type): Carbon
    {
        switch ($type) {
            case 'voting-event':
            case 'nomination':
                return $notifiable->start_date->copy()->subHours($reminderHours);
            default:
                return now()->addHours($reminderHours);
        }
    }

    /**
     * Build reminder data specific to the model type.
     */
    private function buildReminderData($notifiable, string $type): array
    {
        $baseData = [
            'type'  => $type,
            'title' => $notifiable->title ?? $notifiable->name ?? 'Notification',
        ];

        switch ($type) {
            case 'voting-event':
                return array_merge($baseData, [
                    'club_name'  => $notifiable->club->name ?? 'Unknown Club',
                    'start_date' => $notifiable->start_date->toISOString(),
                    'end_date'   => $notifiable->end_date->toISOString(),
                ]);
            case 'nomination':
                return array_merge($baseData, [
                    'club_name'  => $notifiable->club->name ?? 'Unknown Club',
                    'start_date' => $notifiable->start_date->toISOString(),
                    'end_date'   => $notifiable->end_date->toISOString(),
                ]);
            default:
                return $baseData;
        }
    }

    /**
     * Format notifiable data for API response.
     */
    private function formatNotifiableData($notifiable, string $type): array
    {
        if (! $notifiable) {
            return [];
        }

        $baseData = [
            'id'    => $notifiable->id,
            'title' => $notifiable->title ?? $notifiable->name ?? 'Unknown',
        ];

        switch ($type) {
            case 'VotingEvent':
            case 'voting-event':
                return array_merge($baseData, [
                    'description' => $notifiable->description ?? '',
                    'start_date'  => $notifiable->start_date->format('Y-m-d H:i:s'),
                    'end_date'    => $notifiable->end_date->format('Y-m-d H:i:s'),
                    'club_name'   => $notifiable->club->name ?? 'Unknown Club',
                ]);
            case 'Nomination':
            case 'nomination':
                return array_merge($baseData, [
                    'description' => $notifiable->description ?? '',
                    'start_date'  => $notifiable->start_date->format('Y-m-d H:i:s'),
                    'end_date'    => $notifiable->end_date->format('Y-m-d H:i:s'),
                    'club_name'   => $notifiable->club->name ?? 'Unknown Club',
                ]);
            default:
                return $baseData;
        }
    }
}
