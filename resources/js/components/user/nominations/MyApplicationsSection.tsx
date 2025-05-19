import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable, { DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import UserAppLayout from '@/layouts/user/user-layout';
import type { NominationApplication } from '@/types';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import React, { useMemo } from 'react';
interface MyApplicationsSectionProps {
    applications: NominationApplication[];
}

const MyApplicationsSection: React.FC<MyApplicationsSectionProps> = ({ applications }) => {
    const columns: ColumnDef<NominationApplication>[] = useMemo(
        () => [
            {
                accessorKey: 'club.name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Club" />,
                cell: ({ row }) => {
                    const club = row.original.club;
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-8 rounded-md border">
                                <AvatarImage src={club?.image ?? undefined} alt={club?.name ?? 'Club'} />
                            </Avatar>
                            <span>{club?.name ?? '-'}</span>
                        </div>
                    );
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'club_position.name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Position" />,
            },
            {
                accessorKey: 'statement',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Statement" />,
                cell: ({ row }) => {
                    const statement = row.getValue('statement') as string;
                    if (statement.length > 50) {
                        return `${statement.substring(0, 50)}...`;
                    }
                    return statement;
                },
            },
            {
                accessorKey: 'cv_url',
                header: ({ column }) => <DataTableColumnHeader column={column} title="CV" />,
                cell: ({ row }) => {
                    const cvUrl = row.getValue('cv_url') as string;
                    return cvUrl ? (
                        <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                            <Eye className="mr-1 size-4" /> View
                        </a>
                    ) : (
                        <span className="text-gray-400">No CV</span>
                    );
                },
                enableSorting: false,
                enableHiding: true,
            },
            {
                accessorKey: 'status',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
                cell: ({ row }) => {
                    const status = row.getValue('status') as string;
                    return <StatusBadge status={status} />;
                },
                enableSorting: true,
                enableHiding: true,
                filterFn: (row, id, value) => {
                    return value === 'all' || row.getValue(id) === value;
                },
            },
            {
                accessorKey: 'admin_notes',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Admin Notes" />,
                cell: ({ row }) => {
                    const adminNotes = row.getValue('admin_notes') as string;
                    return adminNotes ? adminNotes : 'N/A';
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('created_at'));
                    return format(date, 'dd MMM, yyyy hh:mm a');
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'updated_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('updated_at'));
                    return format(date, 'dd MMM, yyyy hh:mm a');
                },
                enableSorting: true,
                enableHiding: true,
            },
        ],
        [],
    );

    const initialHiddenColumns: string[] = useMemo(() => ['updated_at'], []);

    const data = useMemo(() => applications ?? [], [applications]);

    const filters: Record<string, DataTableFilter> = useMemo(
        () => ({
            club_name: {
                label: 'Search Club',
                placeholder: 'Search by club name...',
                type: 'global',
                className: 'flex-1',
            },
            status: {
                label: 'Status',
                type: 'select',
                columnId: 'status',
                options: [
                    { label: 'All', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                ],
                className: 'flex-1',
            },
        }),
        [],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'My Applications',
                href: route('user.nominations.index'),
            },
        ],
        [],
    );

    // Defensive rendering
    if (!applications) {
        return (
            <UserAppLayout breadcrumbs={breadcrumbs}>
                <Head title="My Applications" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading applications...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </UserAppLayout>
        );
    }
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>A list of all your applications.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={data} filters={filters} initialHiddenColumns={initialHiddenColumns} />
            </CardContent>
        </Card>
    );
};

export default React.memo(MyApplicationsSection);
