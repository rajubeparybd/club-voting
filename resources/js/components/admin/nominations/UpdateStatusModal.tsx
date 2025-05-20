import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Nomination } from '@/types';
import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
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
    const [showStatusWarning, setShowStatusWarning] = useState(false);

    // Reset status when modal opens with a new nomination
    useEffect(() => {
        if (nomination) {
            setStatus(nomination.status);
            setShowStatusWarning(false);
        }
    }, [nomination]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStatus('');
            setShowStatusWarning(false);
        }
    }, [isOpen]);

    // Check if nomination is in a terminal state (closed or archived)
    const isTerminalState = nomination?.status === 'closed' || nomination?.status === 'archived';

    // Handle status change
    const handleStatusChange = (newStatus: string) => {
        // Show warning when trying to change from closed/archived to any other status
        if (isTerminalState && newStatus !== nomination?.status) {
            setShowStatusWarning(true);
        } else {
            setShowStatusWarning(false);
        }
        setStatus(newStatus);
    };

    const handleSubmit = () => {
        if (!nomination || !status) return;

        // Prevent changing from closed/archived to any other status
        if (isTerminalState && status !== nomination.status) {
            return;
        }

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
                        <Select value={status} onValueChange={handleStatusChange} disabled={isSubmitting || isTerminalState}>
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

                    {showStatusWarning && (
                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                            <p className="text-sm">
                                Closed or archived nominations cannot be changed to any other status. Please create a new nomination instead.
                            </p>
                        </div>
                    )}

                    {isTerminalState && (
                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                            <p className="text-sm">
                                This nomination is {nomination?.status} and cannot be modified. Please create a new nomination if needed.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !status || nomination?.status === status || isTerminalState}>
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
