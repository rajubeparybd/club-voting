import { ClubsSearchFilters } from '@/components/admin/clubs/ClubsSearchFilters';
import { ClubsTable } from '@/components/admin/clubs/ClubsTable';
import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import useFlashNotifications from '@/hooks/use-flash-notifications';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

interface ClubPosition {
    id: number;
    club_id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Club {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'pending';
    image: string;
    open_date: string | null;
    created_at: string;
    updated_at: string;
    users_count: number;
    positions_count: number;
    positions?: ClubPosition[];
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Props {
    clubs: PaginatedData<Club>;
}

export default function ClubsIndex({ clubs }: Props) {
    useFlashNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [perPage, setPerPage] = useState<string>('10');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [clubToDelete, setClubToDelete] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Clubs Management',
                href: route('admin.clubs.index'),
            },
        ],
        [],
    );

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('admin.clubs.index'),
                {
                    search: searchTerm,
                    status: statusFilter,
                    per_page: perPage,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, perPage]);

    const handleDeleteClick = useCallback((id: number) => {
        setClubToDelete(id);
        setDeleteDialog(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (!clubToDelete) return;

        setIsLoading(true);
        router.delete(route('admin.clubs.destroy', clubToDelete), {
            onSuccess: () => {
                setIsLoading(false);
                setDeleteDialog(false);
                setClubToDelete(null);
            },
            onError: () => {
                setIsLoading(false);
                setDeleteDialog(false);
            },
        });
    }, [clubToDelete]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialog(false);
        setClubToDelete(null);
    }, []);

    const handlePerPageChange = useCallback((value: string) => {
        setPerPage(value);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
    }, []);

    // Defensive rendering
    if (!clubs || !clubs.data) {
        return (
            <AdminAppLayout breadcrumbs={breadcrumbs}>
                <Head title="Clubs Management" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading clubs data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminAppLayout>
        );
    }

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clubs Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <DeleteConfirmationDialog
                    isOpen={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                    isLoading={isLoading}
                />

                <ManagementPageHeader title="Clubs" description="A list of all clubs with their positions.">
                    <CheckUserPermission permission="create_clubs">
                        <Button asChild>
                            <Link href={route('admin.clubs.create')}>
                                <Plus className="mr-2 size-4" /> Create Club
                            </Link>
                        </Button>
                    </CheckUserPermission>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Clubs</CardTitle>
                        <CardDescription>A list of all clubs with their positions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClubsSearchFilters
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                            statusFilter={statusFilter}
                            onStatusFilterChange={handleStatusFilterChange}
                        />

                        <ClubsTable clubs={clubs.data} onDeleteClick={handleDeleteClick} isLoading={isLoading} />

                        <DataTablePagination
                            data={clubs}
                            routeName="admin.clubs.index"
                            params={{
                                search: searchTerm,
                                status: statusFilter,
                                per_page: perPage,
                            }}
                            onPerPageChange={handlePerPageChange}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminAppLayout>
    );
}
