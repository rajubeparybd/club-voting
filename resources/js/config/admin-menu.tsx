import { NavItem } from '@/types';
import { ActivitySquare, BookOpen, Folder, LayoutGrid, Settings, ShieldCheck, User2, Users } from 'lucide-react';

export const adminSidebarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: LayoutGrid,
        permissions: ['view_dashboard'],
    },
    {
        title: 'Clubs Management',
        href: route('admin.clubs.index'),
        icon: Users,
        permissions: ['view_clubs', 'create_clubs', 'edit_clubs', 'delete_clubs'],
    },
    {
        title: 'Users & Roles',
        href: route('admin.users.index'),
        icon: Users,
        permissions: ['view_users', 'create_users', 'edit_users', 'delete_users', 'view_roles', 'create_roles', 'edit_roles', 'delete_roles'],
        submenu: [
            {
                title: 'User Management',
                href: route('admin.users.index'),
                icon: User2,
                permissions: ['view_users', 'create_users', 'edit_users', 'delete_users'],
            },
            {
                title: 'Role Management',
                href: route('admin.roles.index'),
                icon: ShieldCheck,
                permissions: ['view_roles', 'create_roles', 'edit_roles', 'delete_roles'],
            },
        ],
    },
];

export const adminFooterNavItems: NavItem[] = [
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
        href: route('admin.settings.profile.edit'),
        icon: Settings,
    },
    {
        title: 'Activity Logs',
        href: route('admin.activities.index'),
        icon: ActivitySquare,
    },
];
