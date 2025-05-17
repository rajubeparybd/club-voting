<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class PaymentMethod extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = ['id'];

    protected $casts = [
        'metadata' => 'json',
    ];

    protected $appends = [
        'logo',
    ];

    public function getStatusAttribute()
    {
        return $this->is_active ? 'Active' : 'Inactive';
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('payment_methods')
            ->singleFile();
    }

    public function getLogoAttribute()
    {
        return $this->getFirstMediaUrl('payment_methods');
    }
}
