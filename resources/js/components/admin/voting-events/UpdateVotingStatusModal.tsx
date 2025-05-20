import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VotingEvent } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface UpdateVotingStatusModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    votingEvent: VotingEvent | null;
    onSuccess?: () => void;
}

export default function UpdateVotingStatusModal({ isOpen, onOpenChange, votingEvent, onSuccess }: UpdateVotingStatusModalProps) {
    const [status, setStatus] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset status when modal opens with a new voting event
    useEffect(() => {
        if (votingEvent) {
            setStatus(votingEvent.status);
        }
    }, [votingEvent]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStatus('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!votingEvent || !status) return;

        setIsSubmitting(true);

        router.put(
            route('admin.voting-events.update-status', votingEvent.id),
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
                    <DialogTitle>Update Voting Event Status</DialogTitle>
                    <DialogDescription>Change the status of this voting event. This will affect its visibility and functionality.</DialogDescription>
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
                    <Button onClick={handleSubmit} disabled={isSubmitting || !status || votingEvent?.status === status}>
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
