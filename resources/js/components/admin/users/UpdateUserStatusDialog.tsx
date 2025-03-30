import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UpdateUserStatusDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: User | null;
    onSuccess?: () => void;
}

export default function UpdateUserStatusDialog({ isOpen, onOpenChange, user, onSuccess }: UpdateUserStatusDialogProps) {
    const [status, setStatus] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset status when dialog opens with a new user
    useEffect(() => {
        if (user) {
            setStatus(user.status);
        }
    }, [user]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setStatus('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!user || !status) return;

        setIsSubmitting(true);

        router.put(
            route('admin.users.update-status', user.id),
            { status },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast.success('User status updated successfully');
                    if (onSuccess) onSuccess();
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    toast.error(errors.status || 'Failed to update user status');
                },
            },
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update User Status</DialogTitle>
                    <DialogDescription>Change the status of this user. This will affect their access to the system.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="banned">Banned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !status || user?.status === status}>
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
