import { Toaster } from '@/components/ui/sonner';
import UserSidebarLayout from '@/layouts/app/user-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <UserSidebarLayout breadcrumbs={breadcrumbs} {...props}>
        {children}
        <Toaster />
    </UserSidebarLayout>
);
