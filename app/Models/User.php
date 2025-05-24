<?php
namespace App\Models;

use App\Notifications\User\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia, MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = ['id'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be appended to arrays.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'avatar',
    ];

    protected $with = [
        'department',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'birth_date'        => 'date',
        ];
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }

    /**
     * Get the default avatar URL.
     *
     * @return string
     */
    public function getAvatarAttribute(): string
    {
        return $this->getFirstMediaUrl('avatar');
    }

    /**
     * Register the media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile();
    }

    /**
     * Get the clubs that the user belongs to.
     */
    public function clubs(): BelongsToMany
    {
        return $this->belongsToMany(Club::class)
            ->withPivot('position_id', 'status', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get the positions that the user has.
     */
    public function positions(): BelongsToMany
    {
        return $this->belongsToMany(ClubPosition::class, 'club_position_user')
            ->withTimestamps()
            ->withPivot('joined_at');
    }

    /**
     * Get the department that the user belongs to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the nomination applications submitted by the user.
     */
    public function nominationApplications(): HasMany
    {
        return $this->hasMany(NominationApplication::class);
    }

    /**
     * Get the payment logs for the user.
     */
    public function paymentLogs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    /**
     * Get the votes cast by the user.
     */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}
