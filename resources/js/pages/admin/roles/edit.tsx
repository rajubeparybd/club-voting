import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { formatPatternToText, formatRoleToText, formatTextToRole } from '@/lib/utils';
import { Permission, Role } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const roleFormSchema = z.object({
    name: z.string().min(3, 'Role name must be at least 3 characters'),
    permissions: z.array(z.number()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface Props {
    role: Role & { permissions: Permission[] };
    permissions: Permission[];
}

export default function EditRole({ role, permissions }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const isDefaultRole = role.name === 'admin' || role.name === 'user';

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleFormSchema),
        defaultValues: {
            name: formatRoleToText(role.name),
            permissions: role.permissions.map((permission) => permission.id),
        },
    });

    function handleSubmit(data: RoleFormValues) {
        if (isDefaultRole) return;

        setIsSubmitting(true);

        router.post(
            route('admin.roles.update', role.id),
            {
                name: formatTextToRole(data.name),
                permissions: data.permissions,
                _method: 'PATCH',
            },
            {
                onSuccess: () => {
                    toast.success('Role updated successfully');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error('Submission errors:', errors);
                    toast.error('Failed to update role');
                    setIsSubmitting(false);
                },
            },
        );
    }

    const breadcrumbs = [
        { title: 'Users & Roles', href: route('admin.users.index') },
        { title: 'Role Management', href: route('admin.roles.index') },
        { title: 'Edit Role', href: '#' },
    ];

    const togglePermission = (permissionId: number) => {
        if (isDefaultRole) return;

        const currentPermissions = form.getValues('permissions');
        const isSelected = currentPermissions.includes(permissionId);

        const updatedPermissions = isSelected ? currentPermissions.filter((id) => id !== permissionId) : [...currentPermissions, permissionId];

        form.setValue('permissions', updatedPermissions);
    };

    const filteredPermissions = permissions.filter(
        (permission) =>
            formatPatternToText(permission.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (permission.description && permission.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role: ${formatRoleToText(role.name)}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ManagementPageHeader title={`Edit Role: ${formatRoleToText(role.name)}`} description="Update role name and permissions">
                    <Button variant="outline" asChild>
                        <Link href={route('admin.roles.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Link>
                    </Button>
                </ManagementPageHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Information</CardTitle>
                                <CardDescription>Update role name</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>Role Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter role name" {...field} disabled={isDefaultRole} />
                                            </FormControl>
                                            {isDefaultRole && (
                                                <p className="text-sm text-amber-500">
                                                    The {formatRoleToText(role.name)} role name cannot be modified
                                                </p>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Permissions</CardTitle>
                                <CardDescription>Assign permissions to this role</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative mb-4 ml-auto w-full md:w-1/3">
                                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                    <Input
                                        type="search"
                                        placeholder="Search permissions..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredPermissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className={`hover:bg-muted/50 flex items-center justify-between rounded-md border p-4 transition-colors ${isDefaultRole ? 'opacity-80' : ''}`}
                                        >
                                            <div className="space-y-0.5">
                                                <h3 className="text-sm font-medium">{formatPatternToText(permission.name)}</h3>
                                                <p className="text-muted-foreground text-xs">{permission.description}</p>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="permissions"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-y-0 space-x-2">
                                                        <FormControl>
                                                            <Switch
                                                                className="cursor-pointer"
                                                                checked={field.value.includes(permission.id)}
                                                                onCheckedChange={() => togglePermission(permission.id)}
                                                                disabled={isDefaultRole}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {filteredPermissions.length === 0 && (
                                    <p className="text-muted-foreground py-4 text-center text-sm">No permissions found matching your search.</p>
                                )}
                                {isDefaultRole && (
                                    <p className="mt-4 text-sm text-amber-500">
                                        The {formatRoleToText(role.name)} role permissions cannot be modified
                                    </p>
                                )}
                            </CardContent>
                            <div className="flex justify-end p-6 pt-0">
                                <Button type="submit" disabled={isSubmitting || isDefaultRole}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </form>
                </Form>
            </div>
        </AdminAppLayout>
    );
}
