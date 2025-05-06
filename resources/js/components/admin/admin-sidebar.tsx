import { AdminNavFooter } from '@/components/admin/admin-nav-footer';
import { AdminNavMain } from '@/components/admin/admin-nav-main';
import { NavAdmin } from '@/components/admin/nav-admin';
import AppLogo from '@/components/app/app-logo';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { adminFooterNavItems, adminSidebarNavItems } from '@/config/admin-menu';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('admin.dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <AdminNavMain items={adminSidebarNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <AdminNavFooter items={adminFooterNavItems} className="mt-auto" />
                <NavAdmin />
            </SidebarFooter>
        </Sidebar>
    );
}
