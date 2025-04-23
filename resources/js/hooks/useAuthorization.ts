import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Hook for checking user authorization (roles and permissions)
 * @returns Object containing authorization check functions
 */
const useAuthorization = () => {
    const { auth } = usePage<SharedData>().props;

    /**
     * Check if user has a specific role
     * @param role - Role name to check
     * @returns True if user has the role, false otherwise
     */
    const hasRole = (role: string) => {
        return auth?.roles?.includes(role);
    };

    /**
     * Check if user has any of the specified roles
     * @param roles - Array of role names to check
     * @returns True if user has any of the roles, false otherwise
     */
    const hasAnyRole = (roles: string[]) => {
        return roles.some((role) => auth?.roles?.includes(role));
    };

    /**
     * Check if user has a specific permission
     * @param permission - Permission name to check
     * @returns True if user has the permission, false otherwise
     */
    const hasPermission = (permission: string) => {
        return auth?.permissions?.includes(permission);
    };

    /**
     * Check if user has any of the specified permissions
     * @param permissions - Array of permission names to check
     * @returns True if user has any of the permissions, false otherwise
     */
    const hasAnyPermission = (permissions: string[]) => {
        return permissions.some((permission) => auth?.permissions?.includes(permission));
    };

    return { hasRole, hasAnyRole, hasPermission, hasAnyPermission };
};

export default useAuthorization;
