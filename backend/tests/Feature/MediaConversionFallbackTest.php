<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use App\Support\MediaUrl;
use Tests\TestCase;

class MediaConversionFallbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_thumb_falls_back_to_original_while_conversion_is_pending(): void
    {
        Storage::fake('media');
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);
        $user = User::factory()->create()->assignRole('karyawan');
        $kegiatan = Kegiatan::create([
            'user_id' => $user->id, 'tanggal' => '2026-03-02', 'hari' => 'Senin', 'lokasi' => 'X', 'uraian_kegiatan' => 'U',
        ]);
        $media = $kegiatan->addMedia(UploadedFile::fake()->image('foto.jpg', 800, 600))->toMediaCollection('dokumentasi');

        // Simulate the queued job not having run yet
        Storage::disk('media')->delete($media->id . '/conversions/foto-thumb.jpg');
        $media->forceFill(['generated_conversions' => ['thumb' => false]])->save();
        $this->assertFalse($media->fresh()->hasGeneratedConversion('thumb'));

        $this->get(MediaUrl::for($media, 'thumb'))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg');
    }
}
