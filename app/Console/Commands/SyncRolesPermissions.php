<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use App\Support\RolesPermissionsManager;

class SyncRolesPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:sync {--force : Force the operation to run even in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync roles and permissions into the database';

    /**
     * Array of permissions to sync
     */
    protected $permissions = [];

    /**
     * Array of roles with their assigned permissions
     */
    protected $roles = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Load data from JSON file
        $this->loadDataFromJson();

        // Check environment in production
        if (app()->environment('production') && !$this->option('force')) {
            if (!$this->confirm('You are in production environment. Do you wish to continue?')) {
                $this->info('Command canceled.');
                return;
            }
        }

        // Begin transaction
        DB::beginTransaction();

        try {
            // Sync permissions
            $this->syncPermissions();

            $this->newLine();
            // Sync roles and assign permissions
            $this->syncRoles();

            // Commit transaction
            DB::commit();
        } catch (\Exception $e) {
            // Rollback transaction in case of error
            DB::rollBack();
            $this->error('Error syncing roles and permissions: ' . $e->getMessage());
        }
    }

    /**
     * Load data from the JSON file
     */
    protected function loadDataFromJson()
    {
        $this->permissions = RolesPermissionsManager::getAllPermissions();

        if (empty($this->permissions)) {
            $this->error('No permissions found in JSON file or file not found.');
            exit(1);
        }

        $this->roles = RolesPermissionsManager::getAllRoles();

        if (empty($this->roles)) {
            $this->error('No roles found in JSON file or file not found.');
            exit(1);
        }
    }

    /**
     * Sync defined permissions to the database
     */
    protected function syncPermissions()
    {
        $this->info('Syncing permissions...');
        $progressBar = $this->output->createProgressBar(count($this->permissions));
        $progressBar->start();

        foreach ($this->permissions as $name => $description) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web', 'description' => $description]);
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info('Permissions synced successfully!');
    }

    /**
     * Sync defined roles and assign permissions
     */
    protected function syncRoles()
    {
        $this->info('Syncing roles with permissions...');
        $progressBar = $this->output->createProgressBar(count($this->roles));
        $progressBar->start();

        foreach ($this->roles as $name => $permissions) {
            // Create or retrieve the role
            $role = Role::findOrCreate($name);

            // Assign permissions to role
            if ($permissions === 'all') {
                // Give all permissions
                $role->syncPermissions(Permission::all());
            } else {
                // Give specific permissions
                $role->syncPermissions($permissions);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info('Roles with permissions synced successfully!');
    }
}
