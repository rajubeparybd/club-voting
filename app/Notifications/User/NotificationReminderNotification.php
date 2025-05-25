<?php
namespace App\Notifications\User;

use App\Models\NotificationReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotificationReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public NotificationReminder $reminder
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $reminderData    = $this->reminder->reminder_data;
        $notifiableModel = $this->reminder->notifiable;
        $type            = $reminderData['type'] ?? 'notification';

        $subject    = $this->getSubject($type, $reminderData);
        $greeting   = $this->getGreeting($type);
        $content    = $this->getContent($type, $reminderData, $notifiableModel);
        $actionUrl  = $this->getActionUrl($type, $notifiableModel);
        $actionText = $this->getActionText($type);

        $mailMessage = (new MailMessage)
            ->subject($subject)
            ->greeting($greeting);

        // Add content lines
        foreach ($content as $line) {
            $mailMessage->line($line);
        }

        // Add action button if URL is available
        if ($actionUrl) {
            $mailMessage->action($actionText, $actionUrl);
        }

        $mailMessage
            ->line('If you have any questions, please contact the administrators.')
            ->line('Thank you for staying engaged!');

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'reminder_id'     => $this->reminder->id,
            'notifiable_type' => $this->reminder->notifiable_type,
            'notifiable_id'   => $this->reminder->notifiable_id,
            'reminder_data'   => $this->reminder->reminder_data,
        ];
    }

    /**
     * Get the email subject based on type.
     */
    private function getSubject(string $type, array $reminderData): string
    {
        $title = $reminderData['title'] ?? 'Event';

        return match ($type) {
            'voting-event' => '🗳️ Voting Event Reminder: ' . $title,
            'nomination' => '📝 Nomination Reminder: ' . $title,
            default => '🔔 Reminder: ' . $title,
        };
    }

    /**
     * Get the greeting based on type.
     */
    private function getGreeting(string $type): string
    {
        return match ($type) {
            'voting-event' => 'Hello! Time to vote!',
            'nomination' => 'Hello! Nomination period is starting!',
            default => 'Hello!',
        };
    }

    /**
     * Get the content lines based on type.
     */
    private function getContent(string $type, array $reminderData, $notifiableModel): array
    {
        $baseContent = [
            'This is a friendly reminder about the upcoming event you asked to be notified about.',
            '**Event:** ' . ($reminderData['title'] ?? 'Unknown Event'),
        ];

        if (isset($reminderData['club_name'])) {
            $baseContent[] = '**Club:** ' . $reminderData['club_name'];
        }

        if ($notifiableModel && isset($notifiableModel->description)) {
            $baseContent[] = '**Description:** ' . $notifiableModel->description;
        }

        // Add type-specific content
        $typeSpecificContent = match ($type) {
            'voting-event' => $this->getVotingEventContent($reminderData, $notifiableModel),
            'nomination' => $this->getNominationContent($reminderData, $notifiableModel),
            default => [],
        };

        return array_merge($baseContent, $typeSpecificContent);
    }

    /**
     * Get voting event specific content.
     */
    private function getVotingEventContent(array $reminderData, $notifiableModel): array
    {
        $content = [];

        if (isset($reminderData['start_date'])) {
            $startDate  = \Carbon\Carbon::parse($reminderData['start_date']);
            $hoursUntil = now()->diffInHours($startDate);
            $daysUntil  = now()->diffInDays($startDate);

            $timeUntil = $daysUntil > 0
            ? $daysUntil . ' day' . ($daysUntil > 1 ? 's' : '')
            : $hoursUntil . ' hour' . ($hoursUntil > 1 ? 's' : '');

            $content[] = '**Voting starts in:** ' . $timeUntil;
            $content[] = '**Start Date:** ' . $startDate->format('F j, Y \a\t g:i A');
        }

        if (isset($reminderData['end_date'])) {
            $endDate   = \Carbon\Carbon::parse($reminderData['end_date']);
            $content[] = '**End Date:** ' . $endDate->format('F j, Y \a\t g:i A');
        }

        $content[] = 'Don\'t miss your chance to participate in this important voting event!';

        return $content;
    }

    /**
     * Get nomination specific content.
     */
    private function getNominationContent(array $reminderData, $notifiableModel): array
    {
        $content = [];

        if (isset($reminderData['start_date'])) {
            $startDate  = \Carbon\Carbon::parse($reminderData['start_date']);
            $hoursUntil = now()->diffInHours($startDate);
            $daysUntil  = now()->diffInDays($startDate);

            $timeUntil = $daysUntil > 0
            ? $daysUntil . ' day' . ($daysUntil > 1 ? 's' : '')
            : $hoursUntil . ' hour' . ($hoursUntil > 1 ? 's' : '');

            $content[] = '**Nomination starts in:** ' . $timeUntil;
            $content[] = '**Start Date:** ' . $startDate->format('F j, Y \a\t g:i A');
        }

        if (isset($reminderData['end_date'])) {
            $endDate   = \Carbon\Carbon::parse($reminderData['end_date']);
            $content[] = '**End Date:** ' . $endDate->format('F j, Y \a\t g:i A');
        }

        $content[] = 'Don\'t miss your chance to apply for positions in this nomination!';

        return $content;
    }

    /**
     * Get the action URL based on type.
     */
    private function getActionUrl(string $type, $notifiableModel): ?string
    {
        if (! $notifiableModel) {
            return null;
        }

        return match ($type) {
            'voting-event' => route('user.voting-events.show', $notifiableModel->id),
            'nomination' => route('user.nominations.index'), // Adjust based on your routes
            default => null,
        };
    }

    /**
     * Get the action button text based on type.
     */
    private function getActionText(string $type): string
    {
        return match ($type) {
            'voting-event' => 'View Voting Event',
            'nomination' => 'View Nominations',
            default => 'View Details',
        };
    }
}
