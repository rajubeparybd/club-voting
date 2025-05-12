import { NavItem } from '@/types';
import { ActivitySquare, LayoutGrid, Settings } from 'lucide-react';

export const userSidebarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('user.dashboard'),
        icon: LayoutGrid,
    },
];

export const userFooterNavItems: NavItem[] = [
    // Footer Nav Items
];

export const userContextMenuItems: NavItem[] = [
    {
        title: 'Settings',
        href: route('user.settings.profile.edit'),
        icon: Settings,
    },
    {
        title: 'Activity Logs',
        href: route('user.activities.index'),
        icon: ActivitySquare,
    },
];
