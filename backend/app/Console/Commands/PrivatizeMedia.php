<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PrivatizeMedia extends Command
{
    protected $signature = 'media:privatize {--dry-run : Report what would move without changing anything}';

    protected $description = 'Move media files from the public disk to the private media disk';

    public function handle(): int
    {
        $target = 'media';
        $dryRun = (bool) $this->option('dry-run');
        $moved = 0;

        Media::where('disk', 'public')->orWhere('conversions_disk', 'public')
            ->chunkById(100, function ($items) use ($target, $dryRun, &$moved) {
                foreach ($items as $media) {
                    $files = Storage::disk('public')->allFiles((string) $media->id);

                    if ($dryRun) {
                        $this->line("would move media {$media->id} (" . count($files) . ' files)');
                        $moved++;
                        continue;
                    }

                    foreach ($files as $file) {
                        if (!Storage::disk($target)->exists($file)) {
                            Storage::disk($target)->writeStream($file, Storage::disk('public')->readStream($file));
                        }
                    }

                    $media->forceFill([
                        'disk' => $media->disk === 'public' ? $target : $media->disk,
                        'conversions_disk' => $media->conversions_disk === 'public' ? $target : $media->conversions_disk,
                    ])->save();

                    Storage::disk('public')->deleteDirectory((string) $media->id);
                    $moved++;
                }
            });

        $this->info(($dryRun ? 'Dry run: ' : '') . "{$moved} media item(s) " . ($dryRun ? 'would be ' : '') . 'moved.');

        return self::SUCCESS;
    }
}
