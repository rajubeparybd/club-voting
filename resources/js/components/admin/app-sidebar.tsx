import { NavFooter } from '@/components/admin/nav-footer';
import { NavMain } from '@/components/admin/nav-main';
import { NavUser } from '@/components/admin/nav-user';
import AppLogo from '@/components/app/app-logo';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { adminFooterNavItems, adminSidebarNavItems } from '@/config/admin-menu';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export function AppSidebar() {
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
                <NavMain items={adminSidebarNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={adminFooterNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
