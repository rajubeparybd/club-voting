<?php
namespace App\Notifications\User;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NominationWinnerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var mixed
     */
    protected $club;

    /**
     * @var mixed
     */
    protected $position;

    /**
     * @var mixed
     */
    protected $votingEvent;

    /**
     * @var int
     */
    protected $votesCount;

    /**
     * Create a new notification instance.
     */
    public function __construct($club, $position, $votingEvent, $votesCount)
    {
        $this->club        = $club;
        $this->position    = $position;
        $this->votingEvent = $votingEvent;
        $this->votesCount  = $votesCount;
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
            ->subject('Congratulations! You Have Been Elected')
            ->markdown('emails.club.nomination-winner', [
                'user'        => $notifiable,
                'club'        => $this->club,
                'position'    => $this->position,
                'votingEvent' => $this->votingEvent,
                'votesCount'  => $this->votesCount,
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
            'club_id'         => $this->club->id,
            'position_id'     => $this->position->id,
            'voting_event_id' => $this->votingEvent->id,
            'votes_count'     => $this->votesCount,
        ];
    }
}
