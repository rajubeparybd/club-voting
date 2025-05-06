import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable, { DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import useFlashNotifications from '@/hooks/use-flash-notifications';
import AppLayout from '@/layouts/admin/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface Activity {
    id: number;
    log_name: string;
    causer: User | null;
    description: string;
    event: string | null;
    created_at: string;
}

interface Props {
    activities: { data: Activity[] };
    events: string[];
}

export default function ActivitiesIndex({ activities, events }: Props) {
    useFlashNotifications();
    const personalData = useMemo(() => activities.data, [activities.data]);
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
        // {
        //     id: 'actions',
        //     header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
        //     enableHiding: false,
        //     enableSorting: false,
        //     cell: ({ row }) => {
        //         const activity = row.original;
        //         return (
        //             <DataTableActions
        //                 actions={[
        //                     {
        //                         permission: 'view_activity_details',
        //                         title: 'View Details',
        //                         icon: <Eye className="mr-2 size-4" />,
        //                         onClick: () => console.log('View activity details', activity.id),
        //                     },
        //                 ]}
        //             />
        //         );
        //     },
        // },
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
                <ManagementPageHeader title="Activity Logs" description="View all activities in the system.">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Refresh
                    </Button>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Activities</CardTitle>
                        <CardDescription>A record of all activities performed in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={personalData} filters={personalFilters} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
