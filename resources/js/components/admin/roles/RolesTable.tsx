import { RoleActions } from '@/components/admin/roles/role-actions';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPatternToText, formatRoleToText } from '@/lib/utils';
import { Permission, Role } from '@/types';
import { format } from 'date-fns';

interface RolesTableProps {
    roles: Role[];
    onDeleteClick: (id: number) => void;
    isLoading: boolean;
}

export function RolesTable({ roles, onDeleteClick, isLoading }: RolesTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Users Count</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.length > 0 ? (
                        roles.map((role: Role) => (
                            <TableRow key={role.id}>
                                <TableCell>{formatRoleToText(role.name)}</TableCell>
                                <TableCell>
                                    <div className="flex max-w-md flex-wrap gap-1">
                                        {role.permissions && role.permissions.length > 0 ? (
                                            role.permissions.map((permission: Permission) => (
                                                <TooltipProvider key={permission.id}>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge variant="secondary">{formatPatternToText(permission.name)}</Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{permission.description}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">No permissions</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{role.users_count}</TableCell>
                                <TableCell>{format(new Date(role.created_at), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <RoleActions roleId={role.id} onDelete={onDeleteClick} disabled={isLoading} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No roles found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
