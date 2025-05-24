<?php
namespace App\Notifications\User;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeleted extends Notification implements ShouldQueue
{
    use Queueable;

    protected User $user;
    protected string $deletedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $user, string $deletedBy)
    {
        $this->user      = $user;
        $this->deletedBy = $deletedBy;
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
        return (new MailMessage)
            ->subject('Your Account Has Been Deleted')
            ->markdown('emails.user.account-deleted', [
                'user'      => $this->user,
                'deletedBy' => $this->deletedBy,
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
            'user_id'    => $this->user->id,
            'deleted_by' => $this->deletedBy,
        ];
    }
}
