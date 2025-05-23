import ManagementPageHeader from '@/components/admin/common/management-page-header';
import ViewNominationModal from '@/components/admin/nominations/ViewNominationModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import DataTable, { DataTableActions, DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { useInitials } from '@/hooks/use-initials';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { formatFilter } from '@/lib/utils';
import { BreadcrumbItem, Nomination, NominationApplication } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowLeft, Eye, Pencil } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

export default function NominationShow({ nomination, applications }: { nomination: Nomination; applications: NominationApplication[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [nominationToDelete, setNominationToDelete] = useState<number | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<NominationApplication | null>(null);
    const getInitials = useInitials();

    const clubNames = useMemo(() => [...new Set(applications.map((application) => application.club?.name))], [applications]);
    const clubPositions = useMemo(() => [...new Set(applications.map((application) => application.club_position?.name))], [applications]);

    const handleViewApplication = (application: NominationApplication) => {
        setSelectedApplication(application);
        setViewModalOpen(true);
    };

    const handleModalSuccess = () => {
        router.reload();
    };

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
                accessorKey: 'user.name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="User Info" />,
                cell: ({ row }) => {
                    const user = row.original.user;
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-8 rounded-md border">
                                <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? 'User'} />
                                <AvatarFallback>{user?.name ? getInitials(user.name) : '-'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.name ?? '-'}</span>
                                <span className="text-muted-foreground text-xs">{user?.email ?? '-'}</span>
                                <span className="text-muted-foreground text-xs">
                                    ID: {user?.student_id ?? '-'} | Dept:{user?.department?.name ?? '-'}
                                </span>
                            </div>
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
            {
                id: 'actions',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
                enableHiding: false,
                enableSorting: false,
                cell: ({ row }) => {
                    const application = row.original;
                    return (
                        <DataTableActions
                            actions={[
                                {
                                    permission: 'view_nomination_applications',
                                    title: 'View Application',
                                    icon: <Eye className="mr-2 size-4" />,
                                    onClick: () => handleViewApplication(application),
                                },
                            ]}
                        />
                    );
                },
            },
        ],
        [getInitials],
    );

    const initialHiddenColumns: string[] = useMemo(() => ['updated_at'], []);

    const data = useMemo(() => applications, [applications]);

    const filters: Record<string, DataTableFilter> = useMemo(
        () => ({
            user_name: {
                label: 'User',
                placeholder: 'Search...',
                type: 'global',
                className: 'flex-1',
            },
            club_name: {
                label: 'Club',
                type: 'select',
                columnId: 'club.name',
                options: formatFilter(clubNames as string[]),
                className: 'flex-1',
            },
            club_position_name: {
                label: 'Position',
                type: 'select',
                columnId: 'club_position.name',
                options: formatFilter(clubPositions as string[]),
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
        [clubNames, clubPositions],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Nominations Management',
                href: route('admin.nominations.index'),
            },
            {
                title: 'Applications',
                href: route('admin.nominations.show', nomination.id),
            },
        ],
        [nomination],
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
    if (!nomination) {
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
            <Head title={`Nomination - ${nomination.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <DeleteConfirmationDialog
                    isOpen={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                    isLoading={isLoading}
                />

                <ViewNominationModal
                    isOpen={viewModalOpen}
                    onOpenChange={setViewModalOpen}
                    application={selectedApplication}
                    onSuccess={handleModalSuccess}
                />

                <ManagementPageHeader title={`Applications for ${nomination.club?.name}`} description="Manage all applications.">
                    <div className="flex items-center gap-2">
                        {nomination.status !== 'closed' && (
                            <CheckUserPermission permission="edit_nominations">
                                <Button asChild>
                                    <Link href={route('admin.nominations.edit', nomination.id)}>
                                        <Pencil className="size-4" /> Edit Nomination
                                    </Link>
                                </Button>
                            </CheckUserPermission>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={route('admin.nominations.index')}>
                                <ArrowLeft className="size-4" />
                                Go Back
                            </Link>
                        </Button>
                    </div>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {nomination.club?.name} - {nomination.title}
                        </CardTitle>
                        <CardDescription>{nomination.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={data} filters={filters} initialHiddenColumns={initialHiddenColumns} />
                    </CardContent>
                </Card>
            </div>
        </AdminAppLayout>
    );
}
