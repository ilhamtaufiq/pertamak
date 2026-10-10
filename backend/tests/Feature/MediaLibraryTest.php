<?php

namespace Tests\Feature;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $karyawan;
    private User $other;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('media');
        Storage::fake('public');

        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);

        $this->admin = User::factory()->create()->assignRole('admin');
        $this->karyawan = User::factory()->create()->assignRole('karyawan');
        $this->other = User::factory()->create()->assignRole('karyawan');
    }

    private function folder(User $owner, string $name, ?Folder $parent = null): Folder
    {
        return Folder::create(['name' => $name, 'user_id' => $owner->id, 'parent_id' => $parent?->id]);
    }

    public function test_folder_cannot_be_moved_into_itself(): void
    {
        $folder = $this->folder($this->karyawan, 'Laporan');
        Sanctum::actingAs($this->karyawan);

        $this->patchJson("/api/v1/media/folder/{$folder->id}", ['parent_id' => $folder->id])->assertUnprocessable();
        $this->assertNull($folder->fresh()->parent_id);
    }

    public function test_folder_cannot_be_moved_into_its_descendant(): void
    {
        $parent = $this->folder($this->karyawan, 'Induk');
        $child = $this->folder($this->karyawan, 'Anak', $parent);
        $grandchild = $this->folder($this->karyawan, 'Cucu', $child);
        Sanctum::actingAs($this->karyawan);

        $this->patchJson("/api/v1/media/folder/{$parent->id}", ['parent_id' => $child->id])->assertUnprocessable();
        $this->patchJson("/api/v1/media/folder/{$parent->id}", ['parent_id' => $grandchild->id])->assertUnprocessable();
        $this->assertNull($parent->fresh()->parent_id);
    }

    public function test_breadcrumbs_stop_on_a_parent_cycle(): void
    {
        $a = $this->folder($this->karyawan, 'A');
        $b = $this->folder($this->karyawan, 'B', $a);
        // Force a cycle directly in the database (the controller must survive it)
        $a->update(['parent_id' => $b->id]);
        Sanctum::actingAs($this->karyawan);

        $response = $this->getJson("/api/v1/media?parent_id={$a->id}")->assertOk();

        $this->assertLessThanOrEqual(50, count($response->json('breadcrumbs')));
    }

    public function test_breadcrumbs_do_not_reveal_ancestors_owned_by_others(): void
    {
        $secret = $this->folder($this->admin, 'Rahasia Admin');
        $mine = $this->folder($this->karyawan, 'Milik Budi', $secret);
        Sanctum::actingAs($this->karyawan);

        $response = $this->getJson("/api/v1/media?parent_id={$mine->id}")->assertOk();

        $this->assertSame(['Milik Budi'], array_column($response->json('breadcrumbs'), 'name'));
    }

    public function test_folder_delete_is_refused_when_subtree_has_other_users_content(): void
    {
        $folder = $this->folder($this->karyawan, 'Karyawan');
        $adminSub = $this->folder($this->admin, 'Sub Admin', $folder);
        Sanctum::actingAs($this->karyawan);

        $this->deleteJson("/api/v1/media/folder/{$folder->id}")
            ->assertStatus(409)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('folders', ['id' => $folder->id]);
        $this->assertDatabaseHas('folders', ['id' => $adminSub->id]);
    }

    public function test_folder_delete_is_refused_when_other_users_file_is_inside(): void
    {
        $folder = $this->folder($this->karyawan, 'Karyawan');
        $media = $this->admin->addMedia(UploadedFile::fake()->image('admin.jpg'))->toMediaCollection('library');
        $media->update(['folder_id' => $folder->id]);
        Sanctum::actingAs($this->karyawan);

        $this->deleteJson("/api/v1/media/folder/{$folder->id}")->assertStatus(409);

        $this->assertDatabaseHas('media', ['id' => $media->id]);
    }

    public function test_same_owner_folder_delete_removes_subtree_and_files(): void
    {
        $folder = $this->folder($this->karyawan, 'Karyawan');
        $sub = $this->folder($this->karyawan, 'Sub', $folder);
        Sanctum::actingAs($this->karyawan);

        $this->post('/api/v1/media/upload', ['file' => UploadedFile::fake()->image('a.jpg'), 'folder_id' => $sub->id], ['Accept' => 'application/json'])
            ->assertOk();
        $media = Media::firstOrFail();

        $this->deleteJson("/api/v1/media/folder/{$folder->id}")->assertOk();

        $this->assertDatabaseMissing('folders', ['id' => $folder->id]);
        $this->assertDatabaseMissing('folders', ['id' => $sub->id]);
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
        Storage::disk('media')->assertMissing($media->id . '/a.jpg');
    }

    public function test_deleting_a_file_removes_its_stored_files(): void
    {
        Sanctum::actingAs($this->karyawan);
        $this->post('/api/v1/media/upload', ['file' => UploadedFile::fake()->image('hapus.jpg')], ['Accept' => 'application/json'])
            ->assertOk();
        $media = Media::firstOrFail();
        Storage::disk('media')->assertExists($media->id . '/hapus.jpg');

        $this->deleteJson("/api/v1/media/file/{$media->id}")->assertOk();

        Storage::disk('media')->assertMissing($media->id . '/hapus.jpg');
    }

    public function test_file_rename_rejects_path_separators_and_traversal(): void
    {
        $media = $this->karyawan->addMedia(UploadedFile::fake()->image('asli.jpg'))->toMediaCollection('library');
        Sanctum::actingAs($this->karyawan);

        $this->patchJson("/api/v1/media/file/{$media->id}", ['name' => '../../etc/passwd'])->assertUnprocessable();
        $this->patchJson("/api/v1/media/file/{$media->id}", ['name' => 'sub/dir.jpg'])->assertUnprocessable();
        $this->patchJson("/api/v1/media/file/{$media->id}", ['name' => 'sub\\dir.jpg'])->assertUnprocessable();
        $this->patchJson("/api/v1/media/file/{$media->id}", ['name' => "nul\0.jpg"])->assertUnprocessable();

        $this->assertSame('asli.jpg', $media->fresh()->file_name);

        $this->patchJson("/api/v1/media/file/{$media->id}", ['name' => 'laporan-baru.jpg'])
            ->assertOk()
            ->assertJsonPath('file_name', 'laporan-baru.jpg');
    }

    public function test_index_rejects_array_parent_id(): void
    {
        $folder = $this->folder($this->karyawan, 'Milik Budi');
        $this->folder($this->other, 'Milik Siti');
        Sanctum::actingAs($this->karyawan);

        $this->getJson("/api/v1/media?parent_id[]={$folder->id}")->assertUnprocessable();
        $this->getJson('/api/v1/media?parent_id=abc')->assertUnprocessable();
    }

    public function test_create_folder_and_rename_reject_array_parent_id(): void
    {
        $folder = $this->folder($this->karyawan, 'Milik Budi');
        Sanctum::actingAs($this->karyawan);

        $this->postJson('/api/v1/media/folders', ['name' => 'Baru', 'parent_id' => [$folder->id]])->assertUnprocessable();
        $this->patchJson("/api/v1/media/folder/{$folder->id}", ['parent_id' => [$folder->id]])->assertUnprocessable();
    }

    public function test_unknown_type_returns_404_on_rename_and_destroy(): void
    {
        $media = $this->karyawan->addMedia(UploadedFile::fake()->image('a.jpg'))->toMediaCollection('library');
        Sanctum::actingAs($this->karyawan);

        $this->patchJson("/api/v1/media/bogus/{$media->id}", ['name' => 'diubah.jpg'])->assertNotFound();
        $this->deleteJson("/api/v1/media/bogus/{$media->id}")->assertNotFound();

        $this->assertDatabaseHas('media', ['id' => $media->id, 'file_name' => 'a.jpg']);
    }
}
