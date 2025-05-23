import ManagementPageHeader from '@/components/admin/common/management-page-header';
import UpdateStatusModal from '@/components/admin/nominations/UpdateStatusModal';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import DataTable, { DataTableActions, DataTableActionType, DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { StatusBadge } from '@/components/ui/status-badge';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem, Nomination } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Activity, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

export default function NominationsIndex({ nominations }: { nominations: Nomination[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [nominationToDelete, setNominationToDelete] = useState<number | null>(null);
    const [statusDialog, setStatusDialog] = useState(false);
    const [nominationToUpdate, setNominationToUpdate] = useState<Nomination | null>(null);

    const handleDeleteClick = useCallback((id: number) => {
        setNominationToDelete(id);
        setDeleteDialog(true);
    }, []);

    const handleStatusClick = useCallback((nomination: Nomination) => {
        setNominationToUpdate(nomination);
        setStatusDialog(true);
    }, []);

    const columns: ColumnDef<Nomination>[] = useMemo(
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
                accessorKey: 'title',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
                cell: ({ row }) => {
                    return <span className="line-clamp-1">{row.getValue('title')}</span>;
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'description',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
                cell: ({ row }) => {
                    return <span className="line-clamp-1">{row.getValue('description')}</span>;
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'start_date',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('start_date'));
                    return formatDate(date, 'dd MMM, yyyy hh:mm a');
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'end_date',
                header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('end_date'));
                    return formatDate(date, 'dd MMM, yyyy hh:mm a');
                },
                enableSorting: true,
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
                accessorKey: 'created_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('created_at'));
                    return formatDate(date, 'dd MMM, yyyy');
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                id: 'actions',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
                enableHiding: false,
                enableSorting: false,
                cell: ({ row }) => {
                    const nomination = row.original;
                    const isNominationClosed = nomination.status === 'closed' || nomination.status === 'archived';

                    const actions: DataTableActionType[] = [
                        {
                            permission: 'view_nominations',
                            title: 'View Nomination',
                            icon: <Eye className="mr-2 size-4" />,
                            link: route('admin.nominations.show', nomination.id),
                        },
                    ];

                    if (!isNominationClosed) {
                        actions.push(
                            {
                                permission: 'edit_nominations',
                                title: 'Edit Nomination',
                                icon: <Pencil className="mr-2 size-4" />,
                                link: route('admin.nominations.edit', nomination.id),
                            },
                            {
                                permission: 'edit_nominations',
                                title: 'Change Status',
                                icon: <Activity className="mr-2 size-4" />,
                                onClick: () => handleStatusClick(nomination),
                                separatorAfter: true,
                            },
                            {
                                permission: 'delete_nominations',
                                title: 'Delete Nomination',
                                icon: <Trash2 className="mr-2 size-4" />,
                                onClick: () => handleDeleteClick(nomination.id),
                                danger: true,
                                disabled: isLoading,
                            },
                        );
                    }

                    return <DataTableActions actions={actions} />;
                },
            },
        ],
        [handleDeleteClick, handleStatusClick, isLoading],
    );

    const initialHiddenColumns: string[] = useMemo(() => ['description'], []);

    const data = useMemo(() => nominations ?? [], [nominations]);

    const filters: Record<string, DataTableFilter> = useMemo(
        () => ({
            club_name: {
                label: 'Search Club',
                placeholder: 'Search by club name...',
                type: 'input',
                columnId: 'club.name',
                className: 'flex-1',
            },
            status: {
                label: 'Status',
                type: 'select',
                columnId: 'status',
                options: [
                    { label: 'All', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Draft', value: 'draft' },
                    { label: 'Archived', value: 'archived' },
                ],
                className: 'flex-1',
            },
        }),
        [],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Nominations Management',
                href: route('admin.nominations.index'),
            },
        ],
        [],
    );

    const handleDelete = useCallback(() => {
        if (!nominationToDelete) return;

        setIsLoading(true);
        router.delete(route('admin.nominations.destroy', nominationToDelete), {
            onSuccess: () => {
                setIsLoading(false);
                setDeleteDialog(false);
                setNominationToDelete(null);
            },
            onError: () => {
                setIsLoading(false);
                setDeleteDialog(false);
            },
        });
    }, [nominationToDelete]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialog(false);
        setNominationToDelete(null);
    }, []);

    // Defensive rendering
    if (!nominations) {
        return (
            <AdminAppLayout breadcrumbs={breadcrumbs}>
                <Head title="Nominations Management" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading nominations data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminAppLayout>
        );
    }

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nominations Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <DeleteConfirmationDialog
                    isOpen={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                    isLoading={isLoading}
                />

                <UpdateStatusModal
                    isOpen={statusDialog}
                    onOpenChange={setStatusDialog}
                    nomination={nominationToUpdate}
                    onSuccess={() => {
                        setNominationToUpdate(null);
                    }}
                />

                <ManagementPageHeader title="Nominations" description="Manage all nominations.">
                    <CheckUserPermission permission="create_nominations">
                        <Button asChild>
                            <Link href={route('admin.nominations.create')}>
                                <Plus className="mr-2 size-4" /> New Nomination
                            </Link>
                        </Button>
                    </CheckUserPermission>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Nominations</CardTitle>
                        <CardDescription>A list of all nominations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={data} filters={filters} initialHiddenColumns={initialHiddenColumns} />
                    </CardContent>
                </Card>
            </div>
        </AdminAppLayout>
    );
}
