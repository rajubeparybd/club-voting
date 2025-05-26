import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { ClubPosition, NominationApplication, NominationWinner } from '@/types';
import { BarChart2, Trophy, Users, Vote } from 'lucide-react';

interface VotingResultsProps {
    position: ClubPosition;
    candidates: NominationApplication[];
    userVotes: number[];
    winners?: NominationWinner[];
}

export function VotingResults({ position, candidates, userVotes, winners = [] }: VotingResultsProps) {
    const getInitials = useInitials();

    // Sort candidates by vote count (highest first)
    const sortedCandidates = [...candidates].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));

    // Calculate the total votes for this position
    const totalVotes = sortedCandidates.reduce((sum, candidate) => sum + (candidate.votes_count || 0), 0);

    // Check if a candidate is a winner
    const isWinner = (candidateId: number) => {
        // First check the winners array from props
        if (winners && winners.length > 0) {
            return winners.some((winner) => winner.nomination_application_id === candidateId && winner.club_position_id === position.id);
        }

        // Then check the is_winner property on the candidate as fallback
        return candidates.find((c) => c.id === candidateId)?.is_winner || false;
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <BarChart2 className="h-5 w-5 text-blue-500" />
                    {position.name} Results
                </CardTitle>
            </CardHeader>
            <CardContent>
                {candidates.length > 0 ? (
                    <div className="space-y-6">
                        {sortedCandidates.map((candidate) => {
                            const votePercentage = totalVotes ? Math.round(((candidate.votes_count || 0) / totalVotes) * 100) : 0;
                            const isUserVote = userVotes.includes(candidate.id);
                            const hasWon = isWinner(candidate.id);

                            return (
                                <div key={candidate.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10 overflow-hidden rounded-md">
                                                <AvatarImage src={candidate.user?.avatar || ''} alt={candidate.user?.name || ''} />
                                                <AvatarFallback className="rounded-md bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(candidate.user?.name || '')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-medium">{candidate.user?.name || 'Unknown Candidate'}</p>

                                                    {hasWon && (
                                                        <Badge className="ml-1 rounded-full bg-yellow-500 text-white">
                                                            <Trophy className="mr-1 h-3 w-3" />
                                                            Winner
                                                        </Badge>
                                                    )}
                                                    {hasWon &&
                                                        winners.find((w) => w.nomination_application_id === candidate.id)?.is_tie_resolved ==
                                                            true && (
                                                            <Badge className="rounded-full bg-amber-600 text-xs text-white">⚖️ Tie Resolved</Badge>
                                                        )}
                                                    {isUserVote && (
                                                        <Badge className="rounded-full bg-green-600 text-xs text-white">
                                                            <Vote className="mr-1 h-3 w-3" />
                                                            Your Vote
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    ID: {candidate.user?.student_id || 'N/A'} • Dept:{' '}
                                                    {candidate.user?.department?.name || 'No Department'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">{candidate.votes_count || 0}</p>
                                            <p className="text-xs text-gray-500">votes</p>
                                        </div>
                                    </div>
                                    <Progress
                                        value={votePercentage}
                                        className={cn(
                                            isUserVote ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900',
                                            '[&>div]:bg-blue-500',
                                            isUserVote && '[&>div]:bg-green-500',
                                            hasWon && '[&>div]:bg-yellow-500',
                                        )}
                                    />
                                    <p className="text-right text-xs text-gray-500">{votePercentage}% of votes</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Users className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium">No candidates available</h3>
                        <p className="text-sm text-gray-500">There are no candidates for this position.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
