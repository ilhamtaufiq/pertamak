<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class KegiatanExportLimitTest extends TestCase
{
    use RefreshDatabase;

    private User $karyawan;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('media');
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);

        $this->karyawan = User::factory()->create()->assignRole('karyawan');

        foreach (range(1, 3) as $day) {
            $kegiatan = Kegiatan::create([
                'user_id' => $this->karyawan->id,
                'tanggal' => "2026-03-0{$day}",
                'hari' => 'Senin',
                'lokasi' => 'Cianjur',
                'uraian_kegiatan' => "Kegiatan {$day}",
            ]);
            $kegiatan->addMedia(UploadedFile::fake()->image("foto{$day}.jpg", 600, 400))
                ->toMediaCollection('dokumentasi');
        }
    }

    public function test_pdf_export_caps_embedded_images_and_reports_the_limit(): void
    {
        config(['kegiatan.pdf_max_images' => 2]);
        Sanctum::actingAs($this->karyawan);

        $response = $this->get('/api/kegiatans/export/pdf?month=3&year=2026');

        $response->assertOk();
        $response->assertHeader('X-Export-Images-Limit', '2');
        $response->assertHeader('X-Export-Images-Skipped', '1');
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_docx_export_caps_embedded_images_and_reports_the_limit(): void
    {
        config(['kegiatan.pdf_max_images' => 2]);
        Sanctum::actingAs($this->karyawan);

        $response = $this->get('/api/kegiatans/export/docx?month=3&year=2026');

        $response->assertOk();
        $response->assertHeader('X-Export-Images-Limit', '2');
        $response->assertHeader('X-Export-Images-Skipped', '1');
    }

    public function test_pdf_export_reports_zero_skipped_under_the_default_limit(): void
    {
        Sanctum::actingAs($this->karyawan);

        $response = $this->get('/api/kegiatans/export/pdf?month=3&year=2026');

        $response->assertOk();
        $response->assertHeader('X-Export-Images-Limit', '150');
        $response->assertHeader('X-Export-Images-Skipped', '0');
    }
}
