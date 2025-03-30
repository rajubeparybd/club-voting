<?php
namespace App\Notifications\User;

use App\Models\Club;
use App\Models\ClubPosition;
use App\Models\Nomination;
use App\Models\NominationApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NominationApplicationStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var NominationApplication
     */
    protected $application;

    /**
     * @var Club
     */
    protected $club;

    /**
     * @var ClubPosition
     */
    protected $position;

    /**
     * @var Nomination
     */
    protected $nomination;

    /**
     * @var string
     */
    protected $status;

    /**
     * Create a new notification instance.
     */
    public function __construct(NominationApplication $application, string $status)
    {
        $this->application = $application;
        $this->club        = $application->club;
        $this->position    = $application->clubPosition;
        $this->nomination  = $application->nomination;
        $this->status      = $status;
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
        $subject = $this->status === 'pending' ? 'Your Nomination Application is Under Review' : sprintf('Your Nomination Application Status Has Been %s', ucfirst($this->status));

        return (new MailMessage)
            ->subject($subject)
            ->markdown('emails.club.nomination-application-status', [
                'user'        => $notifiable,
                'application' => $this->application,
                'club'        => $this->club,
                'position'    => $this->position,
                'nomination'  => $this->nomination,
                'status'      => $this->status,
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
            'application_id' => $this->application->id,
            'club_id'        => $this->club->id,
            'position_id'    => $this->position->id,
            'nomination_id'  => $this->nomination->id,
            'status'         => $this->status,
        ];
    }
}
