<?php

namespace App\Support;

trait RoleManager
{

    /**
     * Format a text to role name
     *
     * @param  string  $text  The text to format
     *
     * @return string The formatted role name
     */
    public function formatTextToRole(string $text): string
    {
        $underscored = strtolower(preg_replace('/\s+/', '_', $text));

        return "c_admin_$underscored";
    }

    /**
     * Format a role name to text
     *
     * @param  string  $role  The role name to format
     *
     * @return string The formatted role name
     */
    public function formatRoleToText(string $role): string
    {
        $prefix = 'c_admin_';
        if (str_starts_with($role, $prefix)) {
            $role = substr($role, strlen($prefix));
        }

        return ucwords(str_replace('_', ' ', $role));
    }

}
