import { NavItem } from '@/types';
import { BookOpen, Folder, LayoutGrid, Users } from 'lucide-react';

export const adminSidebarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Clubs Management',
        href: route('admin.clubs.index'),
        icon: Users,
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
