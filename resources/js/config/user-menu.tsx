import { NavItem } from '@/types';
import { ActivitySquare, BookOpen, Folder, LayoutGrid, Settings } from 'lucide-react';

export const userSidebarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('user.dashboard'),
        icon: LayoutGrid,
    },
];

export const userFooterNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
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
