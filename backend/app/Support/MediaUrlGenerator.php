<?php

namespace App\Support;

use DateTimeInterface;
use Spatie\MediaLibrary\Support\UrlGenerator\DefaultUrlGenerator;

/**
 * Every media URL Spatie produces (getUrl, original_url, thumb, optimized, webp) goes through the
 * signed file route. Spatie's default would return /storage/... paths, which no longer exist now
 * that files live on the private media disk.
 */
class MediaUrlGenerator extends DefaultUrlGenerator
{
    public function getUrl(): string
    {
        $variant = $this->conversion?->getName() ?? 'original';

        return MediaUrl::for($this->media, $variant);
    }

    public function getTemporaryUrl(DateTimeInterface $expiration, array $options = []): string
    {
        return $this->getUrl();
    }
}
