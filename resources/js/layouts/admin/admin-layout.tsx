import { Toaster } from '@/components/ui/sonner';
import useFlashNotifications from '@/hooks/use-flash-notifications';
import AppLayoutTemplate from '@/layouts/app/admin/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
interface AdminAppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminAppLayout({ children, breadcrumbs, ...props }: AdminAppLayoutProps) {
    useFlashNotifications();
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster />
        </AppLayoutTemplate>
    );
}
