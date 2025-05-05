<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all department IDs for random assignment
        $departmentIds = Department::pluck('id')->toArray();

        $user = User::create([
            'name' => 'User',
            'email' => 'user@gmail.com',
            'student_id' => 'U0001',
            'department_id' => $departmentIds[array_rand($departmentIds)],
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('user');

        User::factory()->count(50)->create([
            'department_id' => fn() => $departmentIds[array_rand($departmentIds)],
        ])->each(function ($user) {
            $user->assignRole('user');
        });
    }
}
