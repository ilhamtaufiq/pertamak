<?php

namespace App\Traits;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait HasCompressedMedia
{
    /**
     * Register common media conversions with compression.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        // Thumbnail conversion
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->sharpen(10)
            ->nonQueued();

        // Optimized conversion for general display (compressed)
        $this->addMediaConversion('optimized')
            ->width(1200)
            ->height(1200)
            ->fit('max', 1200, 1200)
            ->quality(60)
            ->sharpen(10)
            ->nonQueued();
            
        // WebP conversion for even better compression
        $this->addMediaConversion('webp')
            ->format('webp')
            ->quality(60)
            ->nonQueued();
    }
}
