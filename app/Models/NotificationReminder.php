<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationReminder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'notifiable_type',
        'notifiable_id',
        'user_id',
        'email',
        'scheduled_time',
        'notification_type',
        'status',
        'reminder_data',
        'notes',
        'sent_at',
        'error_message',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_time' => 'datetime',
        'sent_at'        => 'datetime',
        'reminder_data'  => 'array',
    ];

    /**
     * Get the owning notifiable model (polymorphic relationship).
     */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user that this reminder belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get pending reminders that are due.
     */
    public function scopeDue($query)
    {
        return $query->where('status', 'pending')
            ->where('scheduled_time', '<=', now());
    }

    /**
     * Scope to filter by notifiable type.
     */
    public function scopeForNotifiableType($query, string $type)
    {
        return $query->where('notifiable_type', $type);
    }

    /**
     * Mark the reminder as sent.
     */
    public function markAsSent(): void
    {
        $this->update([
            'status'  => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark the reminder as failed.
     */
    public function markAsFailed(string $errorMessage = null): void
    {
        $this->update([
            'status'        => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Get the reminder data for a specific key.
     */
    public function getReminderData(string $key, mixed $default = null): mixed
    {
        return data_get($this->reminder_data, $key, $default);
    }

    /**
     * Set reminder data for a specific key.
     */
    public function setReminderData(string $key, mixed $value): void
    {
        $data = $this->reminder_data ?? [];
        data_set($data, $key, $value);
        $this->update(['reminder_data' => $data]);
    }

    /**
     * Get the human-readable notifiable type name.
     */
    public function getNotifiableTypeNameAttribute(): string
    {
        return match ($this->notifiable_type) {
            'App\\Models\\VotingEvent' => 'Voting Event',
            'App\\Models\\Nomination' => 'Nomination',
            'App\\Models\\Club' => 'Club',
            default => class_basename($this->notifiable_type),
        };
    }
}
