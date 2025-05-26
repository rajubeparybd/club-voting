<?php
namespace App\Notifications\Admin;

use App\Models\VotingEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VotingEventClosedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var VotingEvent
     */
    protected $votingEvent;

    /**
     * @var array
     */
    protected $winners;

    /**
     * Create a new notification instance.
     */
    public function __construct(VotingEvent $votingEvent, array $winners = [])
    {
        $this->votingEvent = $votingEvent;
        $this->winners     = $winners;
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
            ->subject('Voting Event Closed: ' . $this->votingEvent->title)
            ->markdown('emails.admin.voting-event-closed', [
                'user'        => $notifiable,
                'votingEvent' => $this->votingEvent,
                'winners'     => $this->winners,
                'club'        => $this->votingEvent->club,
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
            'voting_event_id' => $this->votingEvent->id,
            'club_id'         => $this->votingEvent->club->id,
            'title'           => $this->votingEvent->title,
            'status'          => $this->votingEvent->status,
        ];
    }
}
