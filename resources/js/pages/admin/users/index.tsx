import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { CreateUserDialog } from '@/components/admin/users/CreateUserDialog';
import { RoleAssignmentDialog } from '@/components/admin/users/RoleAssignmentDialog';
import UpdateUserStatusDialog from '@/components/admin/users/UpdateUserStatusDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import DataTable, { DataTableActions, DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { StatusBadge } from '@/components/ui/status-badge';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { formatRoleToText } from '@/lib/utils';
import { BreadcrumbItem, Department, Role, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { Plus, Shield, Trash2, UserCog } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface Props {
    users: { data: User[] };
    roles: Role[];
    departments: Department[];
}

export default function UsersIndex({ users, roles = [], departments = [] }: Props) {
    const usersData = users.data;

    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    // State for role assignment dialog
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // State for status update dialog
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [userToUpdateStatus, setUserToUpdateStatus] = useState<User | null>(null);

    // State for create user dialog
    const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);

    const handleAssignRoleClick = useCallback((user: User) => {
        setSelectedUser(user);
        setRoleDialogOpen(true);
    }, []);

    const handleUpdateStatusClick = useCallback((user: User) => {
        setUserToUpdateStatus(user);
        setStatusDialogOpen(true);
    }, []);

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'student_id',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student ID" />,
        },
        // {
        //     accessorKey: 'user_info',
        //     id: 'user_info',
        //     header: ({ column }) => <DataTableColumnHeader column={column} title="User Info" />,
        //     cell: ({ row }) => {
        //         const user = row.original;
        //         return (
        //             <div className="flex items-center gap-2">
        //                 <Avatar className="h-8 w-8 rounded-lg border border-gray-300">
        //                     <AvatarImage src={user.avatar || ''} alt={user.name || ''} />
        //                     <AvatarFallback>{user?.name?.charAt(0) || ''}</AvatarFallback>
        //                 </Avatar>
        //                 <div className="flex flex-col">
        //                     <span className="font-medium">{user.name}</span>
        //                     <span className="text-sm text-gray-500">{user.email}</span>
        //                 </div>
        //             </div>
        //         );
        //     },
        //     enableSorting: true,
        //     enableHiding: true,
        // },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'avatar',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Avatar" />,
            cell: ({ row }) => (
                <Avatar className="border-primary size-8 rounded-md border">
                    <AvatarImage src={row.getValue('avatar')} alt={row.getValue('name')} />
                    <AvatarFallback className="rounded-md">{row.getValue('name')?.toString()?.charAt(0)}</AvatarFallback>
                </Avatar>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'phone',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
            cell: ({ row }) => <div>{row.getValue('phone')}</div>,
            enableHiding: true,
        },
        {
            accessorKey: 'gender',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
            cell: ({ row }) => {
                const gender = row.getValue('gender') as string;
                switch (gender) {
                    case 'M':
                        return <div className="text-center">Male</div>;
                    case 'F':
                        return <div className="text-center">Female</div>;
                    default:
                        return <div className="text-center">Other</div>;
                }
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
            cell: ({ row }) => <div>{row.getValue('department')}</div>,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'intake',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Intake" />,
            cell: ({ row }) => <div>{row.getValue('intake')}</div>,
            enableSorting: true,
            enableHiding: true,
        },
        {
            accessorKey: 'roles',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Roles" />,
            cell: ({ row }) => {
                const roles = row.original.roles;
                return (
                    <div className="flex flex-wrap gap-1">
                        {roles
                            ? roles.map((role, index) => (
                                  <Badge variant="outline" key={index}>
                                      {formatRoleToText(role.name || '')}
                                  </Badge>
                              ))
                            : '-'}
                    </div>
                );
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
                const user = row.original;
                return (
                    <DataTableActions
                        actions={[
                            ...(user.status === 'active'
                                ? [
                                      {
                                          permission: 'edit_users',
                                          title: 'Assign Roles',
                                          icon: <UserCog className="mr-2 size-4" />,
                                          onClick: () => handleAssignRoleClick(user),
                                      },
                                  ]
                                : []),
                            // Show Update Status action only if user is not a super_admin
                            ...(!user.roles?.some((role) => role.name === 'admin')
                                ? [
                                      {
                                          permission: 'edit_users',
                                          title: 'Update Status',
                                          icon: <Shield className="mr-2 size-4" />,
                                          onClick: () => handleUpdateStatusClick(user),
                                          separatorAfter: true,
                                      },
                                  ]
                                : []),
                            ...(!user.roles?.some((role) => role.name === 'admin')
                                ? [
                                      {
                                          permission: 'delete_users',
                                          title: 'Delete User',
                                          icon: <Trash2 className="mr-2 size-4" />,
                                          onClick: () => handleDeleteClick(user.id),
                                          danger: true,
                                          disabled: isLoading,
                                      },
                                  ]
                                : []),
                        ]}
                    />
                );
            },
        },
    ];

    const initialHiddenColumns = ['gender', 'intake', 'created_at'];

    const data = useMemo(() => usersData, [usersData]);

    const filters: Record<string, DataTableFilter> = {
        email: {
            label: 'Search',
            placeholder: 'Search by name, email, or student ID',
            type: 'global',
            className: 'flex-1',
        },
        roles: {
            label: 'Role',
            type: 'select',
            options: [
                { label: 'All', value: 'all' },
                ...roles.map((item) => ({
                    label: formatRoleToText(item.name),
                    value: item.id.toString(),
                })),
            ],
        },
        department: {
            label: 'Department',
            type: 'select',
            options: [
                { label: 'All', value: 'all' },
                ...departments.map((item) => ({
                    label: item.name,
                    value: item.id.toString(),
                })),
            ],
        },
        status: {
            label: 'Status',
            type: 'select',
            options: [
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Banned', value: 'banned' },
            ],
        },
    };

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Users Management',
                href: route('admin.users.index'),
            },
        ],
        [],
    );

    const handleDeleteClick = useCallback((id: number) => {
        setUserToDelete(id);
        setDeleteDialog(true);
    }, []);

    const handleDelete = useCallback(() => {
        if (!userToDelete) return;

        setIsLoading(true);
        router.delete(route('admin.users.destroy', userToDelete), {
            onSuccess: () => {
                setIsLoading(false);
                setDeleteDialog(false);
                setUserToDelete(null);
            },
            onError: () => {
                setIsLoading(false);
                setDeleteDialog(false);
            },
        });
    }, [userToDelete]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialog(false);
        setUserToDelete(null);
    }, []);

    // Defensive rendering
    if (!users || !users.data) {
        return (
            <AdminAppLayout breadcrumbs={breadcrumbs}>
                <Head title="Users Management" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading users data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminAppLayout>
        );
    }

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <DeleteConfirmationDialog
                    isOpen={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                    isLoading={isLoading}
                />

                {/* Role Assignment Dialog */}
                {selectedUser && <RoleAssignmentDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen} user={selectedUser} roles={roles} />}

                {/* Status Update Dialog */}
                {userToUpdateStatus && (
                    <UpdateUserStatusDialog isOpen={statusDialogOpen} onOpenChange={setStatusDialogOpen} user={userToUpdateStatus} />
                )}

                {/* Create User Dialog */}
                <CreateUserDialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen} />

                <ManagementPageHeader title="Users" description="Manage all users and their roles.">
                    <CheckUserPermission permission="create_users">
                        <Button onClick={() => setCreateUserDialogOpen(true)}>
                            <Plus className="mr-2 size-4" /> Add New User
                        </Button>
                    </CheckUserPermission>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>A list of all users with their roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={data} filters={filters} initialHiddenColumns={initialHiddenColumns} />
                    </CardContent>
                </Card>
            </div>
        </AdminAppLayout>
    );
}
