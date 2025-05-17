import { NavItem } from '@/types';
import { ActivitySquare, CreditCard, LayoutGrid, MailCheck, Settings, ShieldCheck, User2, Users } from 'lucide-react';

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
        title: 'Nominations Management',
        href: route('admin.nominations.index'),
        icon: MailCheck,
        permissions: ['view_nominations', 'create_nominations', 'edit_nominations', 'delete_nominations'],
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
    {
        title: 'Site Settings',
        href: route('admin.payment-methods.index'),
        icon: Settings,
        permissions: ['view_settings', 'edit_settings'],
        submenu: [
            {
                title: 'Payment Methods',
                href: route('admin.payment-methods.index'),
                icon: CreditCard,
                permissions: ['view_payment_methods', 'edit_payment_methods', 'delete_payment_methods', 'create_payment_methods'],
            },
        ],
    },
];

export const adminFooterNavItems: NavItem[] = [
    // Footer nav items
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
