<?php

namespace Tests\Feature;

use App\Models\Karyawan;
use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Guards against N+1 regressions: the number of queries must not grow with the number of rows.
 */
class QueryCountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media');
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);
    }

    private function queriesFor(callable $request): int
    {
        // Warm-up request: the last_seen middleware writes once per minute, which would skew the count
        $request();

        DB::flushQueryLog();
        DB::enableQueryLog();
        $request();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $count;
    }

    public function test_karyawan_list_query_count_does_not_grow_with_rows(): void
    {
        Sanctum::actingAs(User::factory()->create()->assignRole('admin'));

        $addKaryawan = function (int $i) {
            $k = Karyawan::create(['nama' => "K{$i}", 'jabatan' => 'Staf']);
            $k->addMedia(UploadedFile::fake()->image("f{$i}.jpg"))->toMediaCollection('foto');
        };

        foreach (range(1, 3) as $i) {
            $addKaryawan($i);
        }
        $small = $this->queriesFor(fn () => $this->getJson('/api/karyawans'));

        foreach (range(4, 15) as $i) {
            $addKaryawan($i);
        }
        $large = $this->queriesFor(fn () => $this->getJson('/api/karyawans'));

        $this->assertSame($small, $large, 'Karyawan list runs more queries as rows grow (N+1).');
    }

    public function test_kegiatan_list_query_count_does_not_grow_with_rows(): void
    {
        $user = User::factory()->create()->assignRole('karyawan');
        Sanctum::actingAs($user);

        $addKegiatan = function (int $i) use ($user) {
            $k = Kegiatan::create([
                'user_id' => $user->id, 'tanggal' => '2026-03-' . str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                'hari' => 'Senin', 'lokasi' => 'X', 'uraian_kegiatan' => 'U',
            ]);
            $k->addMedia(UploadedFile::fake()->image("k{$i}.jpg"))->toMediaCollection('dokumentasi');
        };

        foreach (range(1, 2) as $i) {
            $addKegiatan($i);
        }
        $small = $this->queriesFor(fn () => $this->getJson('/api/kegiatans?per_page=7'));

        foreach (range(3, 7) as $i) {
            $addKegiatan($i);
        }
        $large = $this->queriesFor(fn () => $this->getJson('/api/kegiatans?per_page=7'));

        $this->assertSame($small, $large, 'Kegiatan list runs more queries as rows grow (N+1).');
    }
}
