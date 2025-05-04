<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use App\Support\RolesPermissionsManager;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = RolesPermissionsManager::getAllPermissions();

        if (empty($permissions)) {
            $this->command->error('No permissions found in JSON file or file not found.');
            return;
        }

        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web', 'description' => $description]);
        }

    }
}
