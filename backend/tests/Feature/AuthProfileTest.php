<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $karyawan;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'karyawan', 'guard_name' => 'web']);

        $this->karyawan = User::factory()->create([
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'password' => Hash::make('rahasia123'),
        ])->assignRole('karyawan');
    }

    public function test_wrong_credentials_return_an_indonesian_message(): void
    {
        $this->postJson('/api/login', ['email' => 'budi@example.com', 'password' => 'salah-sekali'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Kredensial yang diberikan salah.');
    }

    public function test_user_can_update_own_name_and_email(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->patchJson('/api/me', ['name' => 'Budi Santoso', 'email' => 'budi.s@example.com'])
            ->assertOk()
            ->assertJsonPath('user.name', 'Budi Santoso')
            ->assertJsonPath('user.email', 'budi.s@example.com');

        $this->assertDatabaseHas('users', ['id' => $this->karyawan->id, 'name' => 'Budi Santoso']);
    }

    public function test_email_must_be_unique_on_profile_update(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        Sanctum::actingAs($this->karyawan);

        $this->patchJson('/api/me', ['email' => 'taken@example.com'])->assertUnprocessable();
    }

    public function test_profile_update_cannot_change_role_or_password(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->patchJson('/api/me', ['name' => 'Budi', 'role' => 'admin', 'password' => 'hacked123'])
            ->assertOk();

        $this->assertFalse($this->karyawan->fresh()->hasRole('admin'));
        $this->assertTrue(Hash::check('rahasia123', $this->karyawan->fresh()->password));
    }

    public function test_password_change_requires_the_current_password(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->putJson('/api/me/password', [
            'current_password' => 'bukan-ini',
            'password' => 'baru-sekali',
            'password_confirmation' => 'baru-sekali',
        ])->assertUnprocessable()->assertJsonValidationErrors('current_password');
    }

    public function test_password_change_succeeds_and_signs_out_other_devices(): void
    {
        $current = $this->karyawan->createToken('mobile')->plainTextToken;
        $this->karyawan->createToken('laptop');
        $this->assertSame(2, $this->karyawan->tokens()->count());

        $this->withHeader('Authorization', 'Bearer ' . $current)
            ->putJson('/api/me/password', [
                'current_password' => 'rahasia123',
                'password' => 'baru-sekali',
                'password_confirmation' => 'baru-sekali',
            ])
            ->assertOk();

        $this->assertTrue(Hash::check('baru-sekali', $this->karyawan->fresh()->password));
        $this->assertSame(1, $this->karyawan->tokens()->count());
    }

    public function test_password_change_needs_confirmation(): void
    {
        Sanctum::actingAs($this->karyawan);

        $this->putJson('/api/me/password', [
            'current_password' => 'rahasia123',
            'password' => 'baru-sekali',
            'password_confirmation' => 'beda-sekali',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }
}
