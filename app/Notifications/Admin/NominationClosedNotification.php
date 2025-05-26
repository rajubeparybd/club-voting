<?php
namespace App\Notifications\Admin;

use App\Models\Nomination;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NominationClosedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var Nomination
     */
    protected $nomination;

    /**
     * Create a new notification instance.
     */
    public function __construct(Nomination $nomination)
    {
        $this->nomination = $nomination;
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
            ->subject('Nomination Period Closed: ' . $this->nomination->title)
            ->markdown('emails.club.nomination-closed', [
                'user'       => $notifiable,
                'nomination' => $this->nomination,
                'club'       => $this->nomination->club,
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
            'nomination_id' => $this->nomination->id,
            'club_id'       => $this->nomination->club->id,
            'title'         => $this->nomination->title,
            'status'        => $this->nomination->status,
        ];
    }
}
