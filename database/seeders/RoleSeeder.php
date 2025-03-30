<?php
namespace Database\Seeders;

use App\Support\RolesPermissionsManager;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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

        foreach ($roles as $name => $permissionNames) {
            $role = Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);

            if ($permissionNames === 'all') {
                $role->syncPermissions(Permission::where('name', '!=', 'normal_user')->get());
            } else {
                $role->syncPermissions($permissionNames);
            }
        }

    }
}
