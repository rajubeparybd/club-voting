<?php
namespace App\Notifications\Admin;

use App\Models\ClubPosition;
use App\Models\VotingEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VotingEventTiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var VotingEvent
     */
    protected $votingEvent;

    /**
     * @var ClubPosition
     */
    protected $position;

    /**
     * @var array
     */
    protected $tiedCandidates;

    /**
     * @var int
     */
    protected $voteCount;

    /**
     * Create a new notification instance.
     */
    public function __construct(VotingEvent $votingEvent, ClubPosition $position, array $tiedCandidates, int $voteCount)
    {
        $this->votingEvent    = $votingEvent;
        $this->position       = $position;
        $this->tiedCandidates = $tiedCandidates;
        $this->voteCount      = $voteCount;
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
            ->subject('Action Required: Tie Detected in Voting Event - ' . $this->votingEvent->title)
            ->markdown('emails.admin.voting-event-tied', [
                'user'           => $notifiable,
                'votingEvent'    => $this->votingEvent,
                'position'       => $this->position,
                'tiedCandidates' => $this->tiedCandidates,
                'voteCount'      => $this->voteCount,
                'club'           => $this->votingEvent->club,
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
            'position_id'     => $this->position->id,
            'tied_candidates' => $this->tiedCandidates,
            'vote_count'      => $this->voteCount,
            'club_id'         => $this->votingEvent->club->id,
        ];
    }
}
