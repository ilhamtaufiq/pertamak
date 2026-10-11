<?php

namespace App\Http\Controllers\Media;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpFoundation\Response;

class MediaFileController extends Controller
{
    /** Image types that may be shown inline. Everything else is forced to download. */
    private const INLINE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    public function show(Media $media, string $variant): Response
    {
        $disk = Storage::disk($media->disk);

        // A derived image may not exist yet (queued job still running): fall back to the original
        $relative = $variant !== 'original' && $media->hasGeneratedConversion($variant)
            ? $media->getPathRelativeToRoot($variant)
            : $media->getPathRelativeToRoot();

        abort_unless($relative && $disk->exists($relative), 404);

        $inline = in_array($media->mime_type, self::INLINE_TYPES, true);

        return response()->file($disk->path($relative), [
            'Content-Type' => $inline ? $media->mime_type : 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=3600',
        ])->setContentDisposition($inline ? 'inline' : 'attachment', $media->file_name);
    }
}
