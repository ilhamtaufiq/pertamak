<?php

namespace Tests\Feature;

use App\Models\Karyawan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class KaryawanAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $karyawan;
    private Karyawan $budi;
    private Karyawan $siti;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);

        $this->admin = User::factory()->create()->assignRole('admin');
        $this->karyawan = User::factory()->create()->assignRole('karyawan');
        $other = User::factory()->create()->assignRole('karyawan');

        $this->budi = Karyawan::create([
            'user_id' => $this->karyawan->id,
            'nama' => 'Budi',
            'jabatan' => 'Staf',
            'nip' => '198001012000011001',
            'no_hp' => '081234567890',
        ]);
        $this->siti = Karyawan::create([
            'user_id' => $other->id,
            'nama' => 'Siti',
            'jabatan' => 'Staf',
            'nip' => '199002022010022002',
            'no_hp' => '081298765432',
        ]);
    }

    public function test_karyawan_listing_hides_nip_and_no_hp(): void
    {
        Sanctum::actingAs($this->karyawan);

        $rows = $this->getJson('/api/karyawans')->assertOk()->json('data');

        $this->assertCount(2, $rows);
        foreach ($rows as $row) {
            $this->assertArrayNotHasKey('nip', $row);
            $this->assertArrayNotHasKey('no_hp', $row);
        }
        $this->assertSame('Budi', $rows[0]['nama']);
    }

    public function test_karyawan_show_hides_nip_and_no_hp(): void
    {
        Sanctum::actingAs($this->karyawan);

        $data = $this->getJson("/api/karyawans/{$this->siti->id}")->assertOk()->json('data');

        $this->assertSame('Siti', $data['nama']);
        $this->assertArrayNotHasKey('nip', $data);
        $this->assertArrayNotHasKey('no_hp', $data);
    }

    public function test_admin_listing_and_show_include_contact_fields(): void
    {
        Sanctum::actingAs($this->admin);

        $this->getJson('/api/karyawans')
            ->assertOk()
            ->assertJsonPath('data.0.nip', '198001012000011001')
            ->assertJsonPath('data.0.no_hp', '081234567890');

        $this->getJson("/api/karyawans/{$this->siti->id}")
            ->assertOk()
            ->assertJsonPath('data.no_hp', '081298765432');
    }

    public function test_karyawan_cannot_create_update_or_delete_karyawan(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->postJson('/api/karyawans', ['nama' => 'Baru', 'jabatan' => 'Staf'])->assertForbidden();
        $this->putJson("/api/karyawans/{$this->siti->id}", ['nama' => 'Diubah'])->assertForbidden();
        $this->patchJson("/api/karyawans/{$this->siti->id}", ['nama' => 'Diubah'])->assertForbidden();
        $this->deleteJson("/api/karyawans/{$this->siti->id}")->assertForbidden();

        $this->assertDatabaseMissing('karyawans', ['nama' => 'Baru']);
        $this->assertDatabaseHas('karyawans', ['id' => $this->siti->id, 'nama' => 'Siti']);
    }

    public function test_admin_can_create_update_and_delete_karyawan(): void
    {
        Sanctum::actingAs($this->admin);

        $this->postJson('/api/karyawans', ['nama' => 'Baru', 'jabatan' => 'Staf'])->assertCreated();
        $this->putJson("/api/karyawans/{$this->siti->id}", ['nama' => 'Siti Aminah'])->assertOk();
        $this->deleteJson("/api/karyawans/{$this->budi->id}")->assertOk();

        $this->assertDatabaseHas('karyawans', ['nama' => 'Baru']);
        $this->assertDatabaseHas('karyawans', ['id' => $this->siti->id, 'nama' => 'Siti Aminah']);
        $this->assertDatabaseMissing('karyawans', ['id' => $this->budi->id]);
    }

    public function test_karyawan_photo_rejects_svg_uploads(): void
    {
        Sanctum::actingAs($this->admin);

        $svg = UploadedFile::fake()->createWithContent(
            'logo.svg',
            '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script></svg>'
        );

        $this->post('/api/karyawans', ['nama' => 'Baru', 'jabatan' => 'Staf', 'foto' => $svg], ['Accept' => 'application/json'])
            ->assertUnprocessable();
        $this->assertDatabaseMissing('karyawans', ['nama' => 'Baru']);
    }
}
