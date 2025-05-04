import { Button } from '@/components/ui/button';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { Lock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

interface RoleActionsProps {
    roleId: number;
    onDelete: (id: number) => void;
    disabled?: boolean;
}

export function RoleActions({ roleId, onDelete, disabled = false }: RoleActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <CheckUserPermission
                    permission={['edit_roles', 'delete_roles']}
                    fallback={
                        <DropdownMenuItem>
                            <Lock className="mr-2 size-4" />
                            Access Denied
                        </DropdownMenuItem>
                    }
                >
                    <CheckUserPermission permission="edit_roles">
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.roles.edit', roleId)} className="flex w-full items-center">
                                <Pencil className="mr-2 size-4" />
                                Edit Role
                            </Link>
                        </DropdownMenuItem>
                    </CheckUserPermission>
                    <CheckUserPermission permission="delete_roles">
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(roleId)} className="text-red-600 focus:text-red-600" disabled={disabled}>
                                <Trash2 className="mr-2 size-4" />
                                Delete Role
                            </DropdownMenuItem>
                        </>
                    </CheckUserPermission>
                </CheckUserPermission>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
