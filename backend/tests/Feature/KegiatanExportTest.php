<?php

namespace Tests\Feature;

use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class KegiatanExportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $karyawan;
    private User $other;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);

        $this->admin = User::factory()->create()->assignRole('admin');
        $this->karyawan = User::factory()->create(['name' => 'Budi'])->assignRole('karyawan');
        $this->other = User::factory()->create(['name' => 'Siti'])->assignRole('karyawan');

        $this->kegiatan($this->karyawan, '2026-03-02', 'Survey Budi Maret');
        $this->kegiatan($this->karyawan, '2025-03-10', 'Survey Budi tahun lalu');
        $this->kegiatan($this->other, '2026-03-05', 'Survey Siti Maret');
    }

    private function kegiatan(User $user, string $tanggal, string $uraian): Kegiatan
    {
        return Kegiatan::create([
            'user_id' => $user->id,
            'tanggal' => $tanggal,
            'hari' => 'Senin',
            'lokasi' => 'Cianjur',
            'uraian_kegiatan' => $uraian,
        ]);
    }

    public function test_karyawan_pdf_export_only_contains_own_kegiatan(): void
    {
        Sanctum::actingAs($this->karyawan);

        $response = $this->get('/api/kegiatans/export/pdf?month=3&year=2026&user_id=' . $this->other->id);

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('filename="Laporan Kegiatan - Budi - Maret - 2026.pdf"', $response->headers->get('content-disposition'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_pdf_view_scopes_rows_to_requesting_karyawan(): void
    {
        Sanctum::actingAs($this->karyawan);

        // Render the HTML the PDF is built from to assert on its contents
        \Barryvdh\DomPDF\Facade\Pdf::shouldReceive('loadView')
            ->once()
            ->withArgs(function ($view, $data) {
                $uraian = collect($data['rows'])->pluck('uraian')->all();

                return $view === 'exports.kegiatan-pdf'
                    && $uraian === ['Survey Budi Maret']
                    && $data['periode'] === 'Maret 2026'
                    && $data['nama'] === 'Budi';
            })
            ->andReturnSelf();
        \Barryvdh\DomPDF\Facade\Pdf::shouldReceive('setPaper')->andReturnSelf();
        \Barryvdh\DomPDF\Facade\Pdf::shouldReceive('download')->andReturn(response('ok'));

        $this->get('/api/kegiatans/export/pdf?month=3&year=2026')->assertOk();
    }

    public function test_docx_export_works_for_karyawan(): void
    {
        Sanctum::actingAs($this->karyawan);

        $response = $this->get('/api/kegiatans/export/docx?month=3&year=2026');

        $response->assertOk();
        $this->assertStringContainsString('.docx', $response->headers->get('content-disposition'));
    }

    public function test_invalid_filters_are_rejected(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->getJson('/api/kegiatans/export/pdf?month=13')->assertUnprocessable();
        $this->getJson('/api/kegiatans/export/docx?year=abc')->assertUnprocessable();
        $this->getJson('/api/kegiatans?day=0')->assertUnprocessable();
    }

    public function test_empty_filters_are_ignored(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->getJson('/api/kegiatans?month=&year=')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_index_is_scoped_for_karyawan_and_filterable_for_admin(): void
    {
        Sanctum::actingAs($this->karyawan);
        $this->getJson('/api/kegiatans?year=2026')->assertOk()->assertJsonCount(1, 'data');

        Sanctum::actingAs($this->admin);
        $this->getJson('/api/kegiatans?month=3&year=2026')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/kegiatans?user_id=' . $this->other->id)->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_karyawan_cannot_view_other_users_kegiatan(): void
    {
        $foreign = Kegiatan::where('user_id', $this->other->id)->first();
        $own = Kegiatan::where('user_id', $this->karyawan->id)->first();

        Sanctum::actingAs($this->karyawan);
        $this->getJson("/api/kegiatans/{$foreign->id}")->assertForbidden();
        $this->getJson("/api/kegiatans/{$own->id}")->assertOk();

        Sanctum::actingAs($this->admin);
        $this->getJson("/api/kegiatans/{$foreign->id}")->assertOk();
    }
}
