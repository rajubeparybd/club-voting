import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatRoleToText } from '@/lib/utils';
import { Role, User } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RoleAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    roles: Role[];
}

export function RoleAssignmentDialog({ open, onOpenChange, user, roles }: RoleAssignmentDialogProps) {
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize selectedRoles when dialog opens or user changes
    useEffect(() => {
        if (open && user && user.roles) {
            const userRoleIds = user.roles.map((role) => role.id);
            setSelectedRoles(userRoleIds);
        }
    }, [open, user]);

    const handleRoleToggle = (roleId: number) => {
        setSelectedRoles((prev) => {
            if (prev.includes(roleId)) {
                return prev.filter((id) => id !== roleId);
            } else {
                return [...prev, roleId];
            }
        });
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        router.post(
            route('admin.users.roles.update', user.id),
            {
                roles: selectedRoles,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onOpenChange(false);
                    toast.success('User roles updated successfully');
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    toast.error('Failed to update user roles');
                    console.error(errors);
                },
            },
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!isSubmitting) {
                    onOpenChange(newOpen);
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Roles to {user?.name}</DialogTitle>
                    <DialogDescription>Select the roles you want to assign to this user. Changes will take effect immediately.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    {roles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`role-${role.id}`}
                                checked={selectedRoles.includes(role.id)}
                                onCheckedChange={() => handleRoleToggle(role.id)}
                                disabled={isSubmitting}
                            />
                            <label
                                htmlFor={`role-${role.id}`}
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {formatRoleToText(role.name)}
                            </label>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
