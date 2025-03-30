<?php
namespace App\Notifications\User;

use App\Models\Club;
use App\Models\PaymentLog;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @var Club
     */
    protected $club;

    /**
     * @var User
     */
    protected $user;

    /**
     * @var PaymentLog
     */
    protected $payment;

    /**
     * @var string
     */
    protected $status;

    /**
     * Create a new notification instance.
     */
    public function __construct(Club $club, User $user, PaymentLog $payment, string $status)
    {
        $this->club    = $club;
        $this->user    = $user;
        $this->payment = $payment;
        $this->status  = $status;
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
            ->subject(sprintf('Your Club Payment Status Has Been %s', ucfirst($this->status)))
            ->markdown('emails.club.payment-status-updated', [
                'club'    => $this->club,
                'user'    => $this->user,
                'payment' => $this->payment,
                'status'  => $this->status,
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
