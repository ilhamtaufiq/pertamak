<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use App\Traits\HasCompressedMedia;

class Kegiatan extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasCompressedMedia {
        HasCompressedMedia::registerMediaConversions insteadof InteractsWithMedia;
    }

    /**
     * Disable queued media conversions - process synchronously
     */
    public bool $shouldQueueMediaConversions = false;

    protected $fillable = [
        'user_id',
        'tanggal',
        'hari',
        'lokasi',
        'latitude',
        'longitude',
        'uraian_kegiatan',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected $appends = ['dokumentasi', 'user_name'];

    /**
     * Register media collections for dokumentasi photos
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('dokumentasi')
            ->useFallbackUrl('/images/placeholder.jpg');
    }

    /**
     * Get dokumentasi URLs
     */
    public function getDokumentasiAttribute(): array
    {
        return $this->getMedia('dokumentasi')->map(function ($media) {
            return [
                'id' => $media->id,
                'url' => $media->getUrl('optimized'),
                'original_url' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'name' => $media->name,
                'size' => $media->human_readable_size,
            ];
        })->toArray();
    }
    /**
     * Get user relationship
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get user name attribute
     */
    public function getUserNameAttribute(): ?string
    {
        return $this->user ? $this->user->name : null;
    }
}
