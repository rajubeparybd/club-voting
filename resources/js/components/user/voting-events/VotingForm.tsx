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
import { ethers } from 'ethers';
import contractABI from '@/components/admin/nominations/ClubVoting.abi.json';

interface VotingFormProps {
    votingEvent: VotingEvent;
    position: ClubPosition;
    candidates: NominationApplication[];
    userVotes: number[];
    positions: ClubPosition[];
}

const CONTRACT_ADDRESS = '0xb0fFa4201846969F5B5180aa3ECCBCBc8BBf875C';
const RPC_URL = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || 'https://testnet.skalenodes.com/v1/giant-half-dual-testnet';
const PRIVATE_KEY = import.meta.env.VITE_BLOCKCHAIN_PRIVATE_KEY;

async function castVoteOnBlockchain({
    eventId,
    positionIdx,
    candidateIdx,
}: {
    eventId: number;
    positionIdx: number;
    candidateIdx: number;
}) {
    if (!PRIVATE_KEY) {
        throw new Error('Blockchain private key is not set in environment variables.');
    }
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

    // Debug: Print eventId, positionIdx, candidateIdx
    console.log('Preparing to cast vote on blockchain:');
    console.log('  eventId:', eventId);
    console.log('  positionIdx:', positionIdx);
    console.log('  candidateIdx:', candidateIdx);

    // Print positions and candidates count and names
    try {
        const positionsCount = await contract.getPositionsCount(eventId);
        console.log('Positions count for event:', positionsCount.toString());
        for (let i = 0; i < Number(positionsCount); i++) {
            const positionName = await contract.getPositionName(eventId, i);
            console.log(`Position ${i} name:`, positionName);
            const candidatesCount = await contract.getCandidatesCount(eventId, i);
            console.log(`Candidates count for position ${i}:`, candidatesCount.toString());
            for (let j = 0; j < Number(candidatesCount); j++) {
                const candidateName = await contract.getCandidateName(eventId, i, j);
                console.log(`Candidate ${j} name for position ${i}:`, candidateName);
            }
        }
    } catch (err) {
        console.warn('Could not fetch positions/candidates info before voting:', err);
    }

    // Optional: Fetch and print event data from blockchain
    let eventData;
    try {
        eventData = await contract.votingEvents(eventId);
        console.log('Blockchain event data:', eventData);
        // Print event status and times
        console.log('Blockchain event status:', eventData[6]); // 0 = Active
        console.log('Blockchain event start:', Number(eventData[4]));
        console.log('Blockchain event end:', Number(eventData[5]));
        console.log('Current time:', Math.floor(Date.now() / 1000));
    } catch (err) {
        console.warn('Could not fetch event data from blockchain (may not exist yet):', err);
    }

    // Optionally, check if already voted (if hasUserVoted is in ABI)
    try {
        const alreadyVoted = await contract.hasUserVoted(eventId, positionIdx, wallet.address);
        console.log('Already voted for this position:', alreadyVoted);
    } catch (err) {
        console.warn('Could not check already voted:', err);
    }

    // Cast the vote
    const tx = await contract.castVote(eventId, positionIdx, candidateIdx);
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.transactionHash);
    return receipt;
}

export function VotingForm({ votingEvent, position, candidates, userVotes, positions }: VotingFormProps) {
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

    const confirmVote = useCallback(async () => {
        try {
            // Debug: Print arrays and IDs used for lookup
            console.log('Current position.id:', position.id);
            console.log('candidates:', candidates);
            console.log('Selected candidate id:', data.nomination_application_id);

            // Find the correct positionIdx in positions array
            const positionIdx = positions.findIndex((p) => p.id === position.id);
            if (positionIdx === -1) {
                throw new Error('Could not determine position index for blockchain voting');
            }
            console.log('Resolved positionIdx:', positionIdx, 'for position.id:', position.id);

            // Find the correct candidateIdx in candidates array
            const candidateIdx = candidates.findIndex((c) => c.id.toString() === data.nomination_application_id.toString());
            if (candidateIdx === -1) {
                throw new Error('Could not determine candidate index for blockchain voting');
            }
            console.log('Resolved candidateIdx:', candidateIdx, 'for candidate.id:', data.nomination_application_id);

            // Use blockchain_event_id for voting
            if (!votingEvent.blockchain_event_id) {
                throw new Error('Blockchain event ID is missing for this voting event. Please contact admin.');
            }

            // 1. Call blockchain
            await castVoteOnBlockchain({
                eventId: votingEvent.blockchain_event_id,
                positionIdx,
                candidateIdx,
            });
            // 2. Submit to backend
            post(route('user.voting-events.vote'), {
                preserveScroll: true,
            });
            setShowConfirmDialog(false);
        } catch (error: any) {
            alert('Blockchain voting failed: ' + (error?.message || error));
            console.error('Blockchain voting failed:', error);
            setShowConfirmDialog(false);
        }
    }, [post, votingEvent, position, candidates, data.nomination_application_id, positions]);

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
