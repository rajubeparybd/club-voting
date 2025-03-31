import { ActivityFeed, EventStatusChart, StatsGrid, UserRolesChart, UserTrends } from '@/components/admin/dashboard';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
];

interface DashboardProps {
    stats: {
        totalUsers: number;
        totalClubs: number;
        totalVotingEvents: number;
        totalNominations: number;
        activeClubs: number;
        pendingClubs: number;
        activeVotingEvents: number;
        activeNominations: number;
        totalVotes: number;
        totalCandidates: number;
        lastClosedNominationVotes: number;
        lastClosedNominationCandidates: number;
        clubsWithClosedEvents: number;
        lastEventsEngagement: number;
        avgVotesPerClub: number;
        participationRate: number;
    };
    recentActivities: {
        description: string;
        event: string;
        causer: {
            id: number;
            name: string;
            avatar: string | null;
        } | null;
        created_at: string;
    }[];
    trends: {
        votes: { month: string; count: number }[];
        users: { month: string; count: number }[];
        clubs: { month: string; count: number }[];
    };
}

export default function Dashboard({ stats, recentActivities, trends }: DashboardProps) {
    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Top Stats Cards */}
                <StatsGrid stats={stats} />

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
                    {/* User Trends Chart */}
                    <UserTrends userTrends={trends.users} />

                    {/* User Roles Distribution */}
                    <UserRolesChart totalUsers={stats.totalUsers} />

                    {/* Recent Activity Feed */}
                    <ActivityFeed activities={recentActivities} />

                    {/* Event Status Chart */}
                    <EventStatusChart activeVotingEvents={stats.activeVotingEvents} totalVotingEvents={stats.totalVotingEvents} />
                </div>
            </div>
        </AdminAppLayout>
    );
}
