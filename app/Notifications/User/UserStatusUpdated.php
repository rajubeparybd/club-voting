<?php
namespace App\Notifications\User;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected User $user;
    protected string $newStatus;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $user, string $newStatus)
    {
        $this->user      = $user;
        $this->newStatus = $newStatus;
    }

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
        switch ($this->newStatus) {
            case 'active':
                $subject = 'Your Account Has Been Activated';
                break;
            case 'inactive':
                $subject = 'Your Account Has Been Deactivated';
                break;
            case 'banned':
                $subject = 'Your Account Has Been Banned';
                break;
            default:
                $subject = 'Your Account Status Has Been Updated';
                break;
        }
        return (new MailMessage)
            ->subject($subject)
            ->markdown('emails.user.user-status-updated', [
                'user'   => $this->user,
                'status' => $this->newStatus,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'user_id' => $this->user->id,
            'status'  => $this->newStatus,
        ];
    }
}
