<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\User;
use App\Support\MediaUrl;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Production runs behind Traefik and Cloudflare, which terminate HTTPS. Signed URLs are built
 * with https, but the app receives plain http unless it trusts the proxy headers.
 */
class SignedUrlBehindProxyTest extends TestCase
{
    use RefreshDatabase;

    private function signedMediaUrl(): string
    {
        Storage::fake('media');
        config(['app.url' => 'https://pertamak.cianjur.space']);
        URL::forceRootUrl('https://pertamak.cianjur.space');
        URL::forceScheme('https');
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);
        $user = User::factory()->create()->assignRole('karyawan');
        $kegiatan = Kegiatan::create([
            'user_id' => $user->id, 'tanggal' => '2026-03-02', 'hari' => 'Senin', 'lokasi' => 'X', 'uraian_kegiatan' => 'U',
        ]);
        $media = $kegiatan->addMedia(UploadedFile::fake()->image('foto.jpg'))->toMediaCollection('dokumentasi');

        return MediaUrl::for($media, 'optimized');
    }

    public function test_signed_media_url_is_accepted_when_the_request_came_through_https_proxy(): void
    {
        $url = $this->signedMediaUrl();

        // Traefik forwards over plain http and reports the original scheme and host
        $this->get(str_replace('https://', 'http://', $url), [
            'X-Forwarded-Proto' => 'https',
            'X-Forwarded-Host' => 'pertamak.cianjur.space',
        ])->assertOk();
    }

    public function test_signed_url_is_accepted_when_the_proxy_overwrites_the_scheme_with_http(): void
    {
        // Production case: APP_URL is https, but Traefik rewrites X-Forwarded-Proto to http
        $url = $this->signedMediaUrl();

        $this->get(str_replace('https://', 'http://', $url), [
            'X-Forwarded-Proto' => 'http',
            'X-Forwarded-Host' => 'pertamak.cianjur.space',
        ])->assertOk();
    }

    public function test_tampered_signature_is_still_rejected_behind_the_proxy(): void
    {
        $url = $this->signedMediaUrl();

        $this->get(str_replace('signature=', 'signature=x', str_replace('https://', 'http://', $url)), [
            'X-Forwarded-Proto' => 'https',
            'X-Forwarded-Host' => 'pertamak.cianjur.space',
        ])->assertForbidden();
    }
}
