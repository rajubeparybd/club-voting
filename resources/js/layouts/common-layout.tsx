import useAuthorization from '@/hooks/useAuthorization';
import { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import AdminAppLayout from './admin/admin-layout';
import UserAppLayout from './user/user-layout';
interface Props {
    breadcrumbs: BreadcrumbItem[];
    children: ReactNode;
}

export default function CommonLayout({ breadcrumbs, children }: Props) {
    const { hasRole } = useAuthorization();
    const path = usePage().url;

    if (hasRole('user') && path.includes('user')) {
        return <UserAppLayout breadcrumbs={breadcrumbs}>{children}</UserAppLayout>;
    }

    return <AdminAppLayout breadcrumbs={breadcrumbs}>{children}</AdminAppLayout>;
}
