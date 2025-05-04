import useAuthorization from '@/hooks/useAuthorization';
import React from 'react'

interface CheckUserRoleProps {
    role: string | string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const CheckUserRole = ({ role, children, fallback }: CheckUserRoleProps) => {
    const { hasRole, hasAnyRole } = useAuthorization();

    if (Array.isArray(role)) {
        if (hasAnyRole(role)) return children;
    } else {
        if (hasRole(role)) return children;
    }

    return fallback || null;
}

export default CheckUserRole;
