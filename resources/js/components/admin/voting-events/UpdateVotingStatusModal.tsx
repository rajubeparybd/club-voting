import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NominationApplication, VotingEvent } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import TiebreakModal from './TiebreakModal';

interface UpdateVotingStatusModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    votingEvent: VotingEvent | null;
    onSuccess?: () => void;
}

export default function UpdateVotingStatusModal({ isOpen, onOpenChange, votingEvent, onSuccess }: UpdateVotingStatusModalProps) {
    const [status, setStatus] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTiebreakModal, setShowTiebreakModal] = useState(false);
    const [showStatusWarning, setShowStatusWarning] = useState(false);
    const [tieData, setTieData] = useState<{
        ties: Record<string, NominationApplication[]>;
        winners: Record<string, number>;
    } | null>(null);

    // Reset status when modal opens with a new voting event
    useEffect(() => {
        if (votingEvent) {
            setStatus(votingEvent.status);
            setShowStatusWarning(false);
        }
    }, [votingEvent]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStatus('');
            setTieData(null);
            setShowStatusWarning(false);
        }
    }, [isOpen]);

    // Check if voting event is in a terminal state (closed or archived)
    const isTerminalState = votingEvent?.status === 'closed' || votingEvent?.status === 'archived';

    // Handle status change
    const handleStatusChange = (newStatus: string) => {
        // Show warning when trying to change from closed/archived to any other status
        if (isTerminalState && newStatus !== votingEvent?.status) {
            setShowStatusWarning(true);
        } else {
            setShowStatusWarning(false);
        }
        setStatus(newStatus);
    };

    // Check for tied votes in session
    useEffect(() => {
        const sessionData = window.sessionStorage.getItem('voting_ties');
        if (sessionData && votingEvent) {
            try {
                const { voting_event_id, ties, winners } = JSON.parse(sessionData);
                if (votingEvent.id === voting_event_id && Object.keys(ties).length > 0) {
                    setTieData({ ties, winners });
                }
            } catch (error) {
                console.error('Error parsing session data:', error);
            }
        }
    }, [votingEvent]);

    const handleSubmit = () => {
        if (!votingEvent || !status) return;

        // Prevent changing from closed/archived to any other status
        if (isTerminalState && status !== votingEvent.status) {
            return;
        }

        // If changing to closed status, check for ties first
        if (status === 'closed' && votingEvent.status !== 'closed') {
            // Make a request to check for ties
            setIsSubmitting(true);

            // Use axios to make a direct AJAX call
            axios
                .get(route('admin.voting-events.check-ties', votingEvent.id))
                .then((response) => {
                    setIsSubmitting(false);
                    const data = response.data;

                    // If ties are found, show tiebreak modal
                    if (data.needsManualSelection) {
                        setTieData({
                            ties: data.ties as Record<string, NominationApplication[]>,
                            winners: data.winners as Record<string, number>,
                        });
                        setShowTiebreakModal(true);
                    } else {
                        // No ties, proceed with status update
                        submitStatusUpdate();
                    }
                })
                .catch(() => {
                    setIsSubmitting(false);
                });
        } else {
            // For other status changes, proceed directly
            submitStatusUpdate();
        }
    };

    const submitStatusUpdate = () => {
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

    const handleTiebreakSuccess = () => {
        // Clear the tie data from session storage
        window.sessionStorage.removeItem('voting_ties');
        setTieData(null);
        setShowTiebreakModal(false);

        if (onSuccess) onSuccess();
        onOpenChange(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Voting Event Status</DialogTitle>
                        <DialogDescription>
                            Change the status of this voting event. This will affect its visibility and functionality.
                        </DialogDescription>
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
                                    Closed or archived voting events cannot be changed to any other status. Please create a new voting event instead.
                                </p>
                            </div>
                        )}

                        {isTerminalState && (
                            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                                <p className="text-sm">
                                    This voting event is {votingEvent?.status} and cannot be modified. Please create a new voting event if needed.
                                </p>
                            </div>
                        )}

                        {status === 'closed' && votingEvent?.status !== 'closed' && !isTerminalState && (
                            <div className="text-sm text-amber-600">
                                <p>Closing a voting event will finalize the results and update club positions based on the vote counts.</p>
                                <p>If there are tied votes, you will be prompted to manually select winners.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || !status || votingEvent?.status === status || isTerminalState}>
                            {isSubmitting ? 'Processing...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {tieData && (
                <TiebreakModal
                    isOpen={showTiebreakModal}
                    onOpenChange={setShowTiebreakModal}
                    ties={tieData.ties}
                    winners={tieData.winners}
                    votingEventId={votingEvent?.id || 0}
                    onSuccess={handleTiebreakSuccess}
                />
            )}
        </>
    );
}
