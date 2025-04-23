import AppLogo from '@/components/app/app-logo';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavFooter } from '@/components/user/nav-footer';
import { NavMain } from '@/components/user/nav-main';
import { NavUser } from '@/components/user/nav-user';
import { userFooterNavItems, userSidebarNavItems } from '@/config/user-menu';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('user.dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={userSidebarNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={userFooterNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
