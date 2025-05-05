<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'student_id' => 'A0001',
        ]);

        $admin->assignRole('admin');

        $clubManager = User::create([
            'name' => 'Club Manager',
            'email' => 'clubmanager@gmail.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
            'student_id' => 'A0002',
            'department_id' => 2,
        ]);

        $clubManager->assignRole('c_admin_club_manager');
    }
}
