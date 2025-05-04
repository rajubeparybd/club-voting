<?php

namespace Database\Seeders;

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
        $user = User::create([
            'name' => 'User',
            'email' => 'user@gmail.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('user');

        User::factory()->count(50)->create()->each(function ($user) {
            $user->assignRole('user');
        });
    }
}
