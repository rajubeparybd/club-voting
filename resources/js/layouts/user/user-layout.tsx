import { Toaster } from '@/components/ui/sonner';
import UserSidebarLayout from '@/layouts/app/user-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface UserAppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function UserAppLayout({ children, breadcrumbs, ...props }: UserAppLayoutProps) {
    return (
        <UserSidebarLayout breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster />
        </UserSidebarLayout>
    );
}
