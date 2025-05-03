<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

class RolesPermissionsManager
{
    /**
     * Default path to the JSON file
     */
    public static $jsonPath = 'database/data/roles_permissions.json';

    /**
     * Load the JSON data from file
     *
     * @return array|null The JSON data as an array, or null if there was an error
     */
    public static function loadJson()
    {
        if (!File::exists(base_path(self::$jsonPath))) {
            return null;
        }

        $json = File::get(base_path(self::$jsonPath));
        $data = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return $data;
    }

    /**
     * Get all permissions from the JSON file
     *
     * @return array The permissions as a flat array
     */
    public static function getAllPermissions()
    {
        $data = self::loadJson();

        if (!$data || !isset($data['permissions'])) {
            return [];
        }

        $permissionsData = $data['permissions'];
        $allPermissions = [];

        // Handle flat or categorized permissions
        if (is_array($permissionsData)) {
            if (isset($permissionsData[0])) {
                // Flat array format
                $allPermissions = $permissionsData;
            } else {
                // Categorized format
                foreach ($permissionsData as $category => $permissions) {
                    foreach ($permissions as $permission) {
                        $allPermissions[] = $permission;
                    }
                }
            }
        }

        return $allPermissions;
    }

    /**
     * Get all roles and their permissions from the JSON file
     *
     * @return array The roles and their permissions
     */
    public static function getAllRoles()
    {
        $data = self::loadJson();

        if (!$data || !isset($data['roles'])) {
            return [];
        }

        return $data['roles'];
    }
}
