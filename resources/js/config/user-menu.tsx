import { NavItem } from '@/types';
import { ActivitySquare, Award, Globe, LayoutGrid, Link, Receipt, Settings, Users, Vote } from 'lucide-react';

export const userSidebarNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('user.dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Clubs',
        href: route('user.clubs.index'),
        icon: Users,
    },
    {
        title: 'Nominations',
        href: route('user.nominations.index'),
        icon: Award,
    },
    {
        title: 'Voting Events',
        href: route('user.voting-events.index'),
        icon: Vote,
    },
    {
        title: 'Payment Logs',
        href: route('user.payment-logs.index'),
        icon: Receipt,
    },
];

export const userFooterNavItems: NavItem[] = [
    {
        title: 'Visit Admin Dashboard',
        permissions: ['view_admin_dashboard'],
        href: route('admin.dashboard'),
        icon: Link,
    },
    {
        title: 'Visit Website',
        href: '/',
        icon: Globe,
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
