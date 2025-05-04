import useAuthorization from '@/hooks/useAuthorization';
import React from 'react'

interface CheckUserPermissionProps {
    permission: string | string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const CheckUserPermission = ({ permission, children, fallback }: CheckUserPermissionProps) => {
    const { hasPermission, hasAnyPermission } = useAuthorization();


    if (Array.isArray(permission)) {
        if (hasAnyPermission(permission)) return children;
    } else {
        if (hasPermission(permission)) return children;
    }

    return fallback || null;
}

export default CheckUserPermission;
