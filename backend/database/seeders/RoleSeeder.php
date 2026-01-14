<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $karyawanRole = Role::firstOrCreate(['name' => 'karyawan', 'guard_name' => 'web']);

        // 2. Assign Admin Role to Administrator
        $admin = User::where('email', 'admin@pertamak.com')->first();
        if ($admin) {
            $admin->assignRole($adminRole);
        }

        // 3. Create Sample Karyawan User & Profile
        $userKaryawan = User::updateOrCreate(
            ['email' => 'karyawan@pertamak.com'],
            [
                'name' => 'Karyawan Pertamak',
                'password' => Hash::make('password'),
            ]
        );
        $userKaryawan->assignRole($karyawanRole);

        \App\Models\Karyawan::updateOrCreate(
            ['user_id' => $userKaryawan->id],
            [
                'nama' => 'Karyawan Pertamak',
                'jabatan' => 'Staff Administrasi',
                'nip' => '199001012020011001',
                'no_hp' => '08123456789',
            ]
        );
    }
}
