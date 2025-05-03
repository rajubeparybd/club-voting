<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Support\RolesPermissionsManager;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = RolesPermissionsManager::getAllRoles();

        if (empty($roles)) {
            $this->command->error('No roles found in JSON file or file not found.');
            return;
        }

        foreach ($roles as $name => $permissions) {
            $role = Role::create(['name' => $name]);

            if ($permissions === 'all') {
                $role->syncPermissions(Permission::all());
            } else {
                $role->syncPermissions($permissions);
            }
        }
    }
}
