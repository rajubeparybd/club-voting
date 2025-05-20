import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useInitials } from '@/hooks/use-initials';
import { NominationApplication } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface TiebreakModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    ties: Record<string, NominationApplication[]>;
    votingEventId: number;
    winners: Record<string, number>;
    onSuccess?: () => void;
}

export default function TiebreakModal({ isOpen, onOpenChange, ties, votingEventId, winners, onSuccess }: TiebreakModalProps) {
    const getInitials = useInitials();
    const [selectedWinners, setSelectedWinners] = useState<Record<string, number>>(winners || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWinnerSelection = (positionId: string, applicationId: number) => {
        setSelectedWinners((prev) => ({
            ...prev,
            [positionId]: applicationId,
        }));
    };

    const handleSubmit = () => {
        // Ensure all ties have a selected winner
        const allTiesResolved = Object.keys(ties).every((positionId) => selectedWinners[positionId] !== undefined);

        if (!allTiesResolved) {
            alert('Please select a winner for all tied positions');
            return;
        }

        setIsSubmitting(true);

        router.put(
            route('admin.voting-events.update-status', votingEventId),
            {
                status: 'closed',
                winners: selectedWinners,
            },
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

    const hasUnresolvedTies = Object.keys(ties).some((positionId) => selectedWinners[positionId] === undefined);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-screen overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Resolve Tied Votes</DialogTitle>
                    <DialogDescription>
                        There are positions with tied votes. Please select a winner for each position to proceed with closing the voting event.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {Object.entries(ties).map(([positionId, candidates]) => (
                        <div key={positionId} className="rounded-lg border p-4">
                            <h3 className="text-lg font-semibold">Position: {candidates[0]?.club_position?.name}</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                {candidates.length} candidates tied with {candidates[0]?.votes_count} votes each
                            </p>

                            <RadioGroup
                                value={selectedWinners[positionId]?.toString()}
                                onValueChange={(value) => handleWinnerSelection(positionId, parseInt(value))}
                                className="space-y-2"
                            >
                                {candidates.map((candidate) => (
                                    <div key={candidate.id} className="hover:bg-accent flex items-center space-x-2 rounded-md border p-3">
                                        <RadioGroupItem value={candidate.id.toString()} id={`candidate-${candidate.id}`} />
                                        <label htmlFor={`candidate-${candidate.id}`} className="flex flex-1 cursor-pointer items-center gap-3">
                                            <Avatar className="size-10 rounded-lg border">
                                                <AvatarImage src={candidate.user?.avatar ?? undefined} alt={candidate.user?.name ?? ''} />
                                                <AvatarFallback>{getInitials(candidate.user?.name ?? '')}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{candidate.user?.name}</span>
                                                <span className="text-muted-foreground text-xs">{candidate.user?.student_id}</span>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || hasUnresolvedTies}>
                        {isSubmitting ? 'Updating...' : 'Confirm Winners'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
