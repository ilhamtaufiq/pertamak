<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MediaAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $karyawan;
    private Kegiatan $kegiatan;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('media');
        Storage::fake('public');

        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);

        $this->admin = User::factory()->create()->assignRole('admin');
        $this->karyawan = User::factory()->create()->assignRole('karyawan');

        $this->kegiatan = Kegiatan::create([
            'user_id' => $this->karyawan->id,
            'tanggal' => '2026-03-02',
            'hari' => 'Senin',
            'lokasi' => 'Cianjur',
            'uraian_kegiatan' => 'Survey',
        ]);
        $this->kegiatan->addMedia(UploadedFile::fake()->image('foto.jpg', 800, 600))
            ->toMediaCollection('dokumentasi');
    }

    public function test_dokumentasi_is_stored_on_private_media_disk(): void
    {
        $media = $this->kegiatan->getFirstMedia('dokumentasi');

        $this->assertSame('media', $media->disk);
        Storage::disk('media')->assertExists($media->id . '/foto.jpg');
    }

    public function test_dokumentasi_urls_are_signed_api_urls_not_public_storage(): void
    {
        $item = $this->kegiatan->dokumentasi[0];

        foreach (['url', 'original_url', 'thumb'] as $key) {
            $this->assertStringNotContainsString('/storage/', $item[$key]);
            $this->assertStringContainsString('/api/media/', $item[$key]);
            $this->assertStringContainsString('signature=', $item[$key]);
        }
    }

    public function test_signed_media_url_serves_image_without_auth(): void
    {
        $response = $this->get($this->kegiatan->dokumentasi[0]['original_url'])->assertOk();

        $response->assertHeader('Content-Type', 'image/jpeg');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringStartsWith('inline', $response->headers->get('Content-Disposition'));
    }

    public function test_thumb_and_optimized_variants_are_served(): void
    {
        $item = $this->kegiatan->dokumentasi[0];

        $this->get($item['thumb'])->assertOk()->assertHeader('Content-Type', 'image/jpeg');
        $this->get($item['url'])->assertOk()->assertHeader('Content-Type', 'image/jpeg');
    }

    public function test_media_urls_expire_after_24_hours(): void
    {
        parse_str((string) parse_url($this->kegiatan->dokumentasi[0]['url'], PHP_URL_QUERY), $query);

        $this->assertEqualsWithDelta(now()->addHours(24)->timestamp, (int) $query['expires'], 60);
    }

    public function test_unsigned_or_tampered_media_urls_are_rejected(): void
    {
        $url = $this->kegiatan->dokumentasi[0]['original_url'];

        $this->get(strtok($url, '?'))->assertForbidden();
        $this->get(str_replace('signature=', 'signature=tampered', $url))->assertForbidden();
    }

    public function test_expired_media_url_is_rejected(): void
    {
        $media = $this->kegiatan->getFirstMedia('dokumentasi');
        $url = URL::temporarySignedRoute('media.file', now()->subMinute(), ['media' => $media->id, 'variant' => 'original'], absolute: false);

        $this->get($url)->assertForbidden();
    }

    public function test_non_image_media_is_served_as_attachment_with_nosniff(): void
    {
        $html = UploadedFile::fake()->createWithContent('halaman.html', '<script>alert(document.cookie)</script>');
        $media = $this->karyawan->addMedia($html)->toMediaCollection('library');
        $url = URL::temporarySignedRoute('media.file', now()->addHour(), ['media' => $media->id, 'variant' => 'original'], absolute: false);

        $response = $this->get($url)->assertOk();

        $this->assertStringStartsWith('attachment', $response->headers->get('Content-Disposition'));
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringStartsWith('application/octet-stream', $response->headers->get('Content-Type'));
    }

    public function test_media_upload_rejects_html_and_svg_files(): void
    {
        Sanctum::actingAs($this->karyawan);

        $html = UploadedFile::fake()->createWithContent('x.html', '<script>alert(1)</script>');
        $svg = UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

        $this->post('/api/v1/media/upload', ['file' => $html], ['Accept' => 'application/json'])->assertUnprocessable();
        $this->post('/api/v1/media/upload', ['file' => $svg], ['Accept' => 'application/json'])->assertUnprocessable();

        $this->assertSame(1, Media::count()); // only the kegiatan photo from setUp
    }

    public function test_media_upload_accepts_allowed_image_types(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->post('/api/v1/media/upload', ['file' => UploadedFile::fake()->image('ok.png', 100, 100)], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('mime_type', 'image/png');
    }

    public function test_legacy_public_media_can_be_moved_to_private_disk(): void
    {
        $legacy = $this->karyawan->addMedia(UploadedFile::fake()->image('lama.jpg', 400, 300))
            ->toMediaCollection('library', 'public');

        Artisan::call('media:privatize');

        $legacy->refresh();
        $this->assertSame('media', $legacy->disk);
        Storage::disk('media')->assertExists($legacy->id . '/lama.jpg');
        Storage::disk('media')->assertExists($legacy->id . '/conversions/lama-thumb.jpg');
        Storage::disk('public')->assertMissing($legacy->id . '/lama.jpg');

        $url = URL::temporarySignedRoute('media.file', now()->addHour(), ['media' => $legacy->id, 'variant' => 'original'], absolute: false);
        $this->get($url)->assertOk();
    }
}
