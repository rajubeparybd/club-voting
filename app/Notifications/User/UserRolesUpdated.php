<?php
namespace App\Notifications\User;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserRolesUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var mixed
     */
    protected $club;

    /**
     * @var mixed
     */
    protected $user;

    /**
     * @var string
     */
    protected $roles;

    /**
     * Create a new notification instance.
     */
    public function __construct($user, $roles)
    {
        $this->user  = $user;
        $this->roles = $roles;
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
            ->subject('Your Roles Have Been Updated')
            ->markdown('emails.user.user-roles-updated', [
                'user'  => $this->user,
                'roles' => $this->roles,
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
            //
        ];
    }
}
