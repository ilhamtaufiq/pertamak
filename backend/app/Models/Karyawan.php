<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use App\Traits\HasCompressedMedia;

class Karyawan extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasCompressedMedia;

    /**
     * Disable queued media conversions - process synchronously
     */
    public bool $shouldQueueMediaConversions = false;

    protected $fillable = [
        'user_id',
        'nama',
        'jabatan',
        'nip',
        'no_hp',
    ];

    protected $appends = ['foto'];

    /**
     * Register media collections for foto
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('foto')
            ->singleFile()
            ->useFallbackUrl('/images/avatar-placeholder.jpg');
    }

    /**
     * Get foto URL
     */
    public function getFotoAttribute(): ?array
    {
        $media = $this->getFirstMedia('foto');
        
        if (!$media) {
            return null;
        }

        return [
            'id' => $media->id,
            'url' => $media->getUrl('optimized'),
            'original_url' => $media->getUrl(),
            'thumb' => $media->getUrl('thumb'),
        ];
    }

    /**
     * Jadwal piket relation
     */
    public function jadwalPikets(): HasMany
    {
        return $this->hasMany(JadwalPiket::class);
    }

    /**
     * User relation
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
