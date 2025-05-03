import useAuthorization from '@/hooks/useAuthorization';
import React from 'react'

interface CheckUserRoleProps {
    role: string | string[];
    children: React.ReactNode;
}

const CheckUserRole = ({ role, children }: CheckUserRoleProps) => {
    const { hasRole, hasAnyRole } = useAuthorization();

    if (Array.isArray(role)) {
        if (hasAnyRole(role)) return children;
    } else {
        if (hasRole(role)) return children;
    }

    return null;
}

export default CheckUserRole;
