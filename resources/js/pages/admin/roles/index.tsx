import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { RolesSearchFilters } from '@/components/admin/roles/RolesSearchFilters';
import { RolesTable } from '@/components/admin/roles/RolesTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import useFlashNotifications from '@/hooks/use-flash-notifications';
import AppLayout from '@/layouts/admin/app-layout';
import { BreadcrumbItem, PaginatedData, Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
    roles: PaginatedData<Role>;
}

export default function RolesIndex({ roles }: Props) {
    useFlashNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [perPage, setPerPage] = useState<string>('10');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Roles Management',
                href: route('admin.roles.index'),
            },
        ],
        [],
    );

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('admin.roles.index'),
                {
                    search: searchTerm,
                    per_page: perPage,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, perPage]);

    const handleDeleteClick = useCallback((id: number) => {
        setRoleToDelete(id);
        setDeleteDialog(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (!roleToDelete) return;

        setIsLoading(true);
        router.delete(route('admin.roles.destroy', roleToDelete), {
            onSuccess: () => {
                setIsLoading(false);
                setDeleteDialog(false);
                setRoleToDelete(null);
            },
            onError: () => {
                setIsLoading(false);
                setDeleteDialog(false);
            },
        });
    }, [roleToDelete]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialog(false);
        setRoleToDelete(null);
    }, []);

    const handlePerPageChange = useCallback((value: string) => {
        setPerPage(value);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    // Defensive rendering
    if (!roles || !roles.data) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Roles Management" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading roles data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <DeleteConfirmationDialog
                    isOpen={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                    isLoading={isLoading}
                />

                <ManagementPageHeader title="Roles" description="A list of all roles with their permissions.">
                    <CheckUserPermission permission="create_roles">
                        <Button asChild>
                            <Link href={route('admin.roles.create')}>
                                <Plus className="mr-2 size-4" /> Create Role
                            </Link>
                        </Button>
                    </CheckUserPermission>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>A list of all roles with their permissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RolesSearchFilters searchTerm={searchTerm} onSearchChange={handleSearchChange} />

                        <RolesTable roles={roles.data} onDeleteClick={handleDeleteClick} isLoading={isLoading} />

                        <DataTablePagination
                            data={roles}
                            routeName="admin.roles.index"
                            params={{
                                search: searchTerm,
                                per_page: perPage,
                            }}
                            onPerPageChange={handlePerPageChange}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
