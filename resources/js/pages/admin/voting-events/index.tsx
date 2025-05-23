import ManagementPageHeader from '@/components/admin/common/management-page-header';
import VotingEventForm from '@/components/admin/nominations/voting-event-form';
import UpdateVotingStatusModal from '@/components/admin/voting-events/UpdateVotingStatusModal';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import DataTable, { DataTableActions, DataTableActionType, DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem, Club, VotingEvent } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Activity, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface Props {
    votingEvents: VotingEvent[];
    clubs: Club[];
}

export default function VotingEventsIndex({ votingEvents, clubs }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<number | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<VotingEvent | null>(null);
    const [statusDialog, setStatusDialog] = useState(false);
    const [eventToUpdate, setEventToUpdate] = useState<VotingEvent | null>(null);

    const handleDeleteClick = useCallback((id: number) => {
        setEventToDelete(id);
        setDeleteDialog(true);
    }, []);

    const handleEditClick = useCallback((event: VotingEvent) => {
        setSelectedEvent(event);
        setEditDialogOpen(true);
    }, []);

    const handleStatusClick = useCallback((event: VotingEvent) => {
        setEventToUpdate(event);
        setStatusDialog(true);
    }, []);

    const columns: ColumnDef<VotingEvent>[] = useMemo(
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
                    const event = row.original;
                    const isEventClosed = event.status === 'closed' || event.status === 'archived';

                    const actions: DataTableActionType[] = [
                        {
                            permission: 'view_voting_events',
                            title: 'View Event',
                            icon: <Eye className="mr-2 size-4" />,
                            link: route('admin.voting-events.show', event.id),
                        },
                    ];

                    // Only add edit, status change and delete actions if event is not closed
                    if (!isEventClosed) {
                        actions.push(
                            {
                                permission: 'edit_voting_events',
                                title: 'Edit Event',
                                icon: <Pencil className="mr-2 size-4" />,
                                onClick: () => handleEditClick(event),
                            },
                            {
                                permission: 'edit_voting_events',
                                title: 'Change Status',
                                icon: <Activity className="mr-2 size-4" />,
                                onClick: () => handleStatusClick(event),
                                separatorAfter: true,
                            },
                            {
                                permission: 'delete_voting_events',
                                title: 'Delete Event',
                                icon: <Trash2 className="mr-2 size-4" />,
                                onClick: () => handleDeleteClick(event.id),
                                danger: true,
                                disabled: isLoading,
                            },
                        );
                    }

                    return <DataTableActions actions={actions} />;
                },
            },
        ],
        [handleDeleteClick, handleEditClick, handleStatusClick, isLoading],
    );

    const initialHiddenColumns: string[] = useMemo(() => ['description'], []);

    const data = useMemo(() => votingEvents ?? [], [votingEvents]);

    const filters: Record<string, DataTableFilter> = useMemo(
        () => ({
            club_name: {
                label: 'Search',
                placeholder: 'Search...',
                type: 'global',
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
                    { label: 'Closed', value: 'closed' },
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
                title: 'Voting Events',
                href: route('admin.voting-events.index'),
            },
        ],
        [],
    );

    const handleDelete = useCallback(() => {
        if (!eventToDelete) return;

        setIsLoading(true);
        router.delete(route('admin.voting-events.destroy', eventToDelete), {
            onSuccess: () => {
                setIsLoading(false);
                setDeleteDialog(false);
                setEventToDelete(null);
            },
            onError: () => {
                setIsLoading(false);
                setDeleteDialog(false);
            },
        });
    }, [eventToDelete]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialog(false);
        setEventToDelete(null);
    }, []);

    // Defensive rendering
    if (!votingEvents) {
        return (
            <AdminAppLayout breadcrumbs={breadcrumbs}>
                <Head title="Voting Events Management" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading voting events data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminAppLayout>
        );
    }

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voting Events Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <DeleteConfirmationDialog
                    isOpen={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                    isLoading={isLoading}
                />

                <UpdateVotingStatusModal
                    isOpen={statusDialog}
                    onOpenChange={setStatusDialog}
                    votingEvent={eventToUpdate}
                    onSuccess={() => {
                        setEventToUpdate(null);
                    }}
                />

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="min-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Create Voting Event</DialogTitle>
                            <DialogDescription>Fill in the details to create a new voting event.</DialogDescription>
                        </DialogHeader>
                        <VotingEventForm clubs={clubs} onSuccess={() => setCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="min-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Edit Voting Event</DialogTitle>
                            <DialogDescription>Update the details of this voting event.</DialogDescription>
                        </DialogHeader>
                        {selectedEvent && <VotingEventForm clubs={clubs} votingEvent={selectedEvent} onSuccess={() => setEditDialogOpen(false)} />}
                    </DialogContent>
                </Dialog>

                <ManagementPageHeader title="Voting Events" description="Manage all voting events.">
                    <CheckUserPermission permission="create_voting_events">
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="mr-2 size-4" /> New Voting Event
                        </Button>
                    </CheckUserPermission>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Voting Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={data} filters={filters} initialHiddenColumns={initialHiddenColumns} />
                    </CardContent>
                </Card>
            </div>
        </AdminAppLayout>
    );
}
