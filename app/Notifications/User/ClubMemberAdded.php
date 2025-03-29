<?php
namespace App\Notifications\User;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClubMemberAdded extends Notification implements ShouldQueue
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
    protected $position;

    /**
     * Create a new notification instance.
     */
    public function __construct($club, $user)
    {
        $this->club = $club;
        $this->user = $user;
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
            ->subject('Club Member Added')
            ->markdown('emails.club.member-added', [
                'club' => $this->club,
                'user' => $this->user,
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
