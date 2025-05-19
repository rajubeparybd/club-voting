import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Nomination } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface UpdateStatusModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    nomination: Nomination | null;
    onSuccess?: () => void;
}

export default function UpdateStatusModal({ isOpen, onOpenChange, nomination, onSuccess }: UpdateStatusModalProps) {
    const [status, setStatus] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset status when modal opens with a new nomination
    useEffect(() => {
        if (nomination) {
            setStatus(nomination.status);
        }
    }, [nomination]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStatus('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!nomination || !status) return;

        setIsSubmitting(true);

        router.put(
            route('admin.nominations.update-status', nomination.id),
            { status },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    if (onSuccess) onSuccess();
                    onOpenChange(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Nomination Status</DialogTitle>
                    <DialogDescription>Change the status of this nomination. This will affect its visibility and functionality.</DialogDescription>
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
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !status || nomination?.status === status}>
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
