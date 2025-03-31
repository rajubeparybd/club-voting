import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useInitials } from '@/hooks/use-initials';
import type { ClubPosition, NominationApplication, VotingEvent } from '@/types';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

interface VotingFormProps {
    votingEvent: VotingEvent;
    position: ClubPosition;
    candidates: NominationApplication[];
    userVotes: number[];
}

export function VotingForm({ votingEvent, position, candidates, userVotes }: VotingFormProps) {
    // Check if user has already voted for this position
    const hasVotedForPosition = candidates.some((candidate) => userVotes.includes(candidate.id));
    const selectedCandidate = hasVotedForPosition ? candidates.find((candidate) => userVotes.includes(candidate.id)) : null;
    const getInitials = useInitials();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const { data, setData, post, processing } = useForm({
        voting_event_id: votingEvent.id,
        nomination_application_id: selectedCandidate?.id || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmDialog(true);
    };

    const confirmVote = useCallback(() => {
        post(route('user.voting-events.vote'), {
            preserveScroll: true,
        });
        setShowConfirmDialog(false);
    }, [post]);

    const cancelVote = useCallback(() => {
        setShowConfirmDialog(false);
    }, []);

    const handleRadioChange = useCallback(
        (value: string) => {
            setData('nomination_application_id', value);
        },
        [setData],
    );

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">{position.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <RadioGroup
                            value={data.nomination_application_id.toString()}
                            onValueChange={handleRadioChange}
                            className="space-y-3"
                            disabled={hasVotedForPosition || processing}
                        >
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {candidates.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className={`flex items-center space-x-3 rounded-lg border p-4 transition-all ${
                                            userVotes.includes(candidate.id)
                                                ? 'border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                                                : data.nomination_application_id === candidate.id.toString()
                                                  ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <RadioGroupItem
                                            value={candidate.id.toString()}
                                            id={`candidate-${candidate.id}`}
                                            disabled={hasVotedForPosition || processing}
                                            className={!hasVotedForPosition && !processing ? 'cursor-pointer' : 'cursor-not-allowed'}
                                        />
                                        <div className="flex flex-1 items-center space-x-3">
                                            <Avatar className="size-10 overflow-hidden rounded-md">
                                                <AvatarImage src={candidate.user?.avatar || ''} alt={candidate.user?.name || ''} />
                                                <AvatarFallback className="rounded-md bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(candidate.user?.name || '')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <Label
                                                    htmlFor={`candidate-${candidate.id}`}
                                                    className={`font-medium ${!hasVotedForPosition && !processing ? 'cursor-pointer' : 'cursor-default'}`}
                                                >
                                                    {candidate.user?.name || 'Unknown Candidate'}
                                                </Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    ID: {candidate.user?.student_id || 'N/A'} &middot; Dept:{' '}
                                                    {candidate.user?.department?.name || 'No Department'}
                                                </p>
                                            </div>
                                            {userVotes.includes(candidate.id) && (
                                                <div className="ml-auto">
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Voted
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>

                        {!hasVotedForPosition ? (
                            <Button type="submit" className="mt-4 w-full transition-colors" disabled={!data.nomination_application_id || processing}>
                                {processing ? 'Submitting...' : 'Submit Vote'}
                            </Button>
                        ) : (
                            <div className="mt-4 flex items-center justify-center">
                                <div className="inline-flex items-center rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    You have already voted for this position
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="size-5 text-orange-500" />
                            Confirm Your Vote
                        </DialogTitle>
                        <DialogDescription>Are you sure you want to submit your vote? This action cannot be undone once submitted.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex sm:justify-end">
                        <Button variant="outline" onClick={cancelVote} className="mr-2">
                            Cancel
                        </Button>
                        <Button onClick={confirmVote} disabled={processing}>
                            {processing ? 'Submitting...' : 'Yes, Submit Vote'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
