<?php

namespace App\Support;

use Illuminate\Support\Facades\URL;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Builds signed, expiring URLs for private media.
 *
 * The signature covers only the path and query, not the host or scheme. Reverse proxies rewrite
 * those (Traefik and Cloudflare), so a host-bound signature fails in production even though the
 * URL is correct. The file route validates with `signed:relative` to match.
 */
class MediaUrl
{
    public const TTL_HOURS = 24;

    public static function for(Media $media, string $variant = 'original'): string
    {
        $relative = URL::temporarySignedRoute(
            'media.file',
            now()->addHours(self::TTL_HOURS),
            ['media' => $media->id, 'variant' => $variant],
            absolute: false,
        );

        return rtrim((string) config('app.url'), '/') . $relative;
    }
}
