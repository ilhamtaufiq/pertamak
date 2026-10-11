<?php

namespace App\Support;

use Illuminate\Support\Facades\URL;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Builds signed, expiring URLs for private media. Clients get these instead of
 * direct storage paths, so every file request passes the signature check.
 */
class MediaUrl
{
    public const TTL_HOURS = 24;

    public static function for(Media $media, string $variant = 'original'): string
    {
        return URL::temporarySignedRoute(
            'media.file',
            now()->addHours(self::TTL_HOURS),
            ['media' => $media->id, 'variant' => $variant]
        );
    }
}
