<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClubMemberStatusUpdated extends Notification implements ShouldQueue
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
    protected $status;

    /**
     * Create a new notification instance.
     */
    public function __construct($club, $user, $status)
    {
        $this->club   = $club;
        $this->user   = $user;
        $this->status = $status;
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
            ->subject('Club Member Status Updated')
            ->markdown('emails.club-member-status-updated', [
                'club'   => $this->club,
                'user'   => $this->user,
                'status' => $this->status,
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
