import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { VotingForm } from '@/components/user/voting-events/VotingForm';
import { VotingResults } from '@/components/user/voting-events/VotingResults';
import { VotingStats } from '@/components/user/voting-events/VotingStats';
import UserAppLayout from '@/layouts/user/user-layout';
import { formatTimeRemaining } from '@/lib/utils';
import { ClubPosition, NominationApplication, NominationWinner, VotingEvent } from '@/types';
import { Head } from '@inertiajs/react';
import { formatDate } from 'date-fns';
import { Clock, Info, PieChart, Trophy, Users, Vote } from 'lucide-react';
import { useEffect, useState } from 'react';

import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface VotingEventShowProps {
    votingEvent: VotingEvent;
    positions: ClubPosition[];
    candidatesByPosition: Record<number, NominationApplication[]>;
    userVotes: number[];
    isVotingClosed: boolean;
    winners: NominationWinner[];
    votingStats: {
        totalVotes: number;
        totalEligibleVoters: number;
        votingPercentage: number;
    };
}

export default function VotingEventShow({
    votingEvent,
    positions,
    candidatesByPosition,
    userVotes,
    isVotingClosed,
    votingStats,
    winners,
}: VotingEventShowProps) {
    const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(votingEvent.end_date));
    const [activeTab, setActiveTab] = useState<string>(isVotingClosed ? 'results' : 'voting');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(formatTimeRemaining(votingEvent.end_date));
        }, 1000);

        return () => clearInterval(timer);
    }, [votingEvent.end_date]);

    const hasVotedForAll = Object.keys(candidatesByPosition).every((positionId) =>
        candidatesByPosition[Number(positionId)].some((candidate) => userVotes.includes(candidate.id)),
    );

    // Set page title based on voting status
    const pageTitle = isVotingClosed ? 'Election Results' : 'Vote Now';
    const pageDescription = isVotingClosed
        ? `View results for ${votingEvent.club?.name} club's election`
        : `Attend and vote for ${votingEvent.club?.name} club's positions`;

    return (
        <UserAppLayout
            breadcrumbs={[
                { title: 'Voting Events', href: route('user.voting-events.index') },
                { title: votingEvent.title, href: route('user.voting-events.show', votingEvent.id) },
            ]}
        >
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Head title={`${isVotingClosed ? 'Results' : 'Vote'}: ${votingEvent.title}`} />
                <ManagementPageHeader title={pageTitle} description={pageDescription}>
                    <Button variant="outline" asChild>
                        <Link href={route('user.voting-events.index')}>
                            <ArrowLeft className="size-4" />
                            Go Back
                        </Link>
                    </Button>
                </ManagementPageHeader>

                <div className="mb-8 grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{votingEvent.title}</CardTitle>
                                <CardDescription>{votingEvent.club?.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                    {votingEvent.description || 'No description provided for this voting event.'}
                                </p>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-2 rounded-lg border p-3">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Club</p>
                                            <p className="font-medium">{votingEvent.club?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border p-3">
                                        <Clock className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">End Date</p>
                                            <p className="font-medium">{formatDate(votingEvent.end_date, 'MMM d, yyyy h:mm a')}</p>
                                        </div>
                                    </div>
                                </div>

                                {timeRemaining.isExpired ? (
                                    <Alert className="mt-4 border-gray-500 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-300">
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>Voting has ended</AlertTitle>
                                        <AlertDescription>The voting period for this election has ended.</AlertDescription>
                                    </Alert>
                                ) : hasVotedForAll ? (
                                    <Alert className="mt-4 border-green-500 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
                                        <Vote className="h-4 w-4" />
                                        <AlertTitle>Thank you for voting</AlertTitle>
                                        <AlertDescription className="text-green-600 dark:text-green-300/80">
                                            You have successfully voted for all available positions in this election.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert className="mt-4 border-gray-500 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-300">
                                        <Vote className="h-4 w-4" />
                                        <AlertTitle>Voting is open</AlertTitle>
                                        <AlertDescription>
                                            Cast your vote for each position below. Time remaining: {timeRemaining.days}d {timeRemaining.hours}h{' '}
                                            {timeRemaining.minutes}m
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Voting Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Time Remaining</p>
                                    {timeRemaining.isExpired ? (
                                        <p className="font-medium text-red-600">Voting Ended</p>
                                    ) : (
                                        <div className="mt-2 grid grid-cols-4 gap-2">
                                            <div className="flex flex-col rounded-md bg-slate-100 p-2 text-center dark:bg-gray-800">
                                                <span className="text-lg font-bold">{timeRemaining.days}</span>
                                                <span className="text-xs text-gray-500">Days</span>
                                            </div>
                                            <div className="flex flex-col rounded-md bg-slate-100 p-2 text-center dark:bg-gray-800">
                                                <span className="text-lg font-bold">{timeRemaining.hours}</span>
                                                <span className="text-xs text-gray-500">Hours</span>
                                            </div>
                                            <div className="flex flex-col rounded-md bg-slate-100 p-2 text-center dark:bg-gray-800">
                                                <span className="text-lg font-bold">{timeRemaining.minutes}</span>
                                                <span className="text-xs text-gray-500">Mins</span>
                                            </div>
                                            <div className="flex flex-col rounded-md bg-slate-100 p-2 text-center dark:bg-gray-800">
                                                <span className="text-lg font-bold">{timeRemaining.seconds}</span>
                                                <span className="text-xs text-gray-500">Secs</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Your Voting Status</p>
                                    <div className="mt-1">
                                        {hasVotedForAll ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <Vote className="h-5 w-5" />
                                                <span className="font-medium">All votes submitted</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <Vote className="h-5 w-5" />
                                                <span className="font-medium">Voting in progress</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Number of Positions</p>
                                    <p className="mt-1 font-medium">{positions.length} Positions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-6">
                    <h2 className="mb-4 text-xl font-semibold">{isVotingClosed ? 'Election Results' : 'Cast Your Vote'}</h2>

                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        {!isVotingClosed && (
                            <TabsContent value="voting" className="space-y-6">
                                {positions.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                            <Vote className="mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium">No Positions Available</h3>
                                            <p className="text-sm text-gray-500">There are no positions defined for this club's election.</p>
                                        </CardContent>
                                    </Card>
                                ) : Object.keys(candidatesByPosition).length > 0 ? (
                                    Object.keys(candidatesByPosition).map((positionId) => {
                                        const position = positions.find((p) => p.id === Number(positionId));
                                        const candidates = candidatesByPosition[Number(positionId)];

                                        if (!position || candidates.length === 0) return null;

                                        return (
                                            <VotingForm
                                                key={position.id}
                                                votingEvent={votingEvent}
                                                position={position}
                                                candidates={candidates}
                                                userVotes={userVotes}
                                            />
                                        );
                                    })
                                ) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                            <Vote className="mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium">No candidates available</h3>
                                            <p className="text-sm text-gray-500">There are no candidates to vote for in this election.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        )}

                        <TabsContent value="results" className="space-y-6">
                            <VotingStats
                                totalVotes={votingStats.totalVotes}
                                totalEligibleVoters={votingStats.totalEligibleVoters}
                                votingPercentage={votingStats.votingPercentage}
                            />

                            {positions.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <PieChart className="mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-medium">No Results Available</h3>
                                        <p className="text-sm text-gray-500">There are no positions defined for this club's election.</p>
                                    </CardContent>
                                </Card>
                            ) : Object.keys(candidatesByPosition).length > 0 ? (
                                Object.keys(candidatesByPosition).map((positionId) => {
                                    const position = positions.find((p) => p.id === Number(positionId));
                                    const candidates = candidatesByPosition[Number(positionId)];

                                    if (!position || candidates.length === 0) return null;

                                    return (
                                        <VotingResults
                                            key={position.id}
                                            position={position}
                                            candidates={candidates}
                                            userVotes={userVotes}
                                            winners={winners}
                                        />
                                    );
                                })
                            ) : (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <Trophy className="mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-medium">No candidates available</h3>
                                        <p className="text-sm text-gray-500">There are no candidates in this election to show results for.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </UserAppLayout>
    );
}
