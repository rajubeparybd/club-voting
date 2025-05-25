<?php
namespace App\Jobs;

use App\Models\NotificationReminder;
use App\Notifications\User\NotificationReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendNotificationReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public NotificationReminder $reminder
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Check if reminder is still pending
            if ($this->reminder->status !== 'pending') {
                Log::info('Skipping reminder - status is not pending', [
                    'reminder_id' => $this->reminder->id,
                    'status'      => $this->reminder->status,
                ]);
                return;
            }

            // Load the notifiable model
            $notifiableModel = $this->reminder->notifiable;

            if (! $notifiableModel) {
                Log::error('Notifiable model not found for reminder', [
                    'reminder_id'     => $this->reminder->id,
                    'notifiable_type' => $this->reminder->notifiable_type,
                    'notifiable_id'   => $this->reminder->notifiable_id,
                ]);
                $this->reminder->markAsFailed('Notifiable model not found');
                return;
            }

            // Check if the event hasn't started yet (for time-based events)
            if ($this->shouldSkipBasedOnTiming($notifiableModel)) {
                return;
            }

            // Create a mock notifiable object for the email
            $notifiable = new class($this->reminder->email)
            {
                public function __construct(public string $email)
                {}

                public function routeNotificationForMail(): string
                {
                    return $this->email;
                }
            };

            // Send the notification
            Notification::send($notifiable, new NotificationReminderNotification($this->reminder));

            // Mark as sent
            $this->reminder->markAsSent();

            Log::info('Notification reminder sent successfully', [
                'reminder_id'     => $this->reminder->id,
                'email'           => $this->reminder->email,
                'notifiable_type' => $this->reminder->notifiable_type,
                'notifiable_id'   => $this->reminder->notifiable_id,
            ]);

        } catch (\Exception $exception) {
            Log::error('Failed to send notification reminder', [
                'reminder_id' => $this->reminder->id,
                'error'       => $exception->getMessage(),
                'trace'       => $exception->getTraceAsString(),
            ]);

            $this->reminder->markAsFailed($exception->getMessage());

            // Re-throw the exception to trigger job retry
            throw $exception;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Notification reminder job failed permanently', [
            'reminder_id' => $this->reminder->id,
            'error'       => $exception->getMessage(),
        ]);

        $this->reminder->markAsFailed('Job failed after all retry attempts: ' . $exception->getMessage());
    }

    /**
     * Check if we should skip sending based on timing.
     */
    private function shouldSkipBasedOnTiming($notifiableModel): bool
    {
        // Check for models that have start_date
        if (method_exists($notifiableModel, 'getAttribute') && $notifiableModel->getAttribute('start_date')) {
            $startDate = $notifiableModel->start_date;

            if ($startDate <= now()) {
                Log::info('Event has already started - skipping reminder', [
                    'reminder_id'     => $this->reminder->id,
                    'notifiable_type' => $this->reminder->notifiable_type,
                    'notifiable_id'   => $this->reminder->notifiable_id,
                    'start_date'      => $startDate,
                ]);
                $this->reminder->markAsFailed('Event has already started');
                return true;
            }
        }

        return false;
    }
}
