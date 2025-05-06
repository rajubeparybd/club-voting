import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import DataTable, { DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFlashNotifications from '@/hooks/use-flash-notifications';
import AppLayout from '@/layouts/admin/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface Activity {
    id: number;
    log_name: string;
    causer: User | null;
    description: string;
    event: string | null;
    created_at: string;
}

interface Props {
    personalActivities: { data: Activity[] };
    allUsersActivities: { data: Activity[] } | null;
    events: string[];
    canViewOtherActivities: boolean;
}

export default function ActivitiesIndex({ personalActivities, allUsersActivities, events, canViewOtherActivities }: Props) {
    useFlashNotifications();
    const [activeTab, setActiveTab] = useState<string>('personal');

    const personalData = useMemo(() => personalActivities.data, [personalActivities.data]);
    const allData = useMemo(() => allUsersActivities?.data || [], [allUsersActivities?.data]);

    const eventsFilter = useMemo(
        () =>
            events.map((item) => {
                if (!item) item = 'all';
                const formattedItem = item?.slice(0, 1).toUpperCase() + item?.slice(1);
                return { label: formattedItem, value: item };
            }),
        [events],
    );

    const columns: ColumnDef<Activity>[] = [
        {
            accessorKey: 'log_name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Log Name" />,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'event',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'causer',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Causer" />,
            cell: ({ row }) => {
                const causer = row.getValue('causer');
                return <div>{causer ? (causer as User).name : 'System'}</div>;
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
            enableSorting: true,
            enableHiding: true,
        },
    ];

    const personalFilters: Record<string, DataTableFilter> = {
        description: {
            label: 'Search',
            placeholder: 'Search your activities...',
            type: 'global',
            className: 'flex-1',
        },
        event: {
            label: 'Event',
            type: 'select',
            options: eventsFilter,
            className: 'md:w-64',
        },
    };

    const allFilters: Record<string, DataTableFilter> = {
        description: {
            label: 'Search',
            placeholder: 'Search all activities...',
            type: 'global',
            className: 'flex-1',
        },
        event: {
            label: 'Event',
            type: 'select',
            options: eventsFilter,
            className: 'md:w-64',
        },
    };

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Activity Logs',
                href: route('admin.activities.index'),
            },
        ],
        [],
    );

    // Defensive rendering
    if (!personalData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Activity Logs" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading activity data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ManagementPageHeader title="Activity Logs" description="View activity logs in the system.">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Refresh
                    </Button>
                </ManagementPageHeader>

                <CheckUserPermission
                    permission={['view_other_activities', 'view_other_activity_details']}
                    fallback={
                        <Card>
                            <CardHeader>
                                <CardTitle>Activities</CardTitle>
                                <CardDescription>A record of activities performed by you in the system.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable columns={columns} data={personalData} filters={personalFilters} />
                            </CardContent>
                        </Card>
                    }
                >
                    <Tabs defaultValue="personal" onValueChange={setActiveTab} value={activeTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="personal">Personal Activities</TabsTrigger>
                            {canViewOtherActivities && <TabsTrigger value="all">All Users Activities</TabsTrigger>}
                        </TabsList>
                        <TabsContent value="personal">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activities</CardTitle>
                                    <CardDescription>A record of activities performed by you in the system.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable columns={columns} data={personalData} filters={personalFilters} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        {canViewOtherActivities && (
                            <TabsContent value="all">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Activities</CardTitle>
                                        <CardDescription>A record of activities performed by all users in the system.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <DataTable columns={columns} data={allData} filters={allFilters} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </CheckUserPermission>
            </div>
        </AppLayout>
    );
}
