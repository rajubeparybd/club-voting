import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { StatusBadge } from '@/components/ui/status-badge';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { formatTimeRemaining } from '@/lib/utils';
import { BreadcrumbItem, Club, Nomination, NominationApplication, VotingEvent } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, BarChart3, BriefcaseIcon, Calendar, ClipboardList, Clock, Edit, UserCogIcon, Users, Users2Icon, VoteIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface VotingStats {
    totalVotes: number;
    totalEligibleVoters: number;
    totalCandidates: number;
    totalPositions: number;
    votingPercentage: number;
    daysRemaining: string;
    recentVoters: Array<{
        id: number;
        name: string;
        student_id: string;
        avatar: string;
        timestamp: string;
    }>;
    isExpired: boolean;
}

interface Props {
    votingEvent: VotingEvent;
    club: Club;
    lastNomination: Nomination | null;
    candidates: NominationApplication[];
    votingStats: VotingStats;
}

// Define a type for the detailed time breakdown
interface TimeDetails {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
}

// Helper function to safely format dates (moved outside component to prevent recreation)
const formatDate = (dateString: string | undefined, formatString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return format(date, formatString);
    } catch {
        return 'Invalid Date';
    }
};

export default function VotingEventShow({ votingEvent, club, lastNomination, candidates, votingStats }: Props) {
    const [timeDetails, setTimeDetails] = useState<TimeDetails>({ days: '0', hours: '0', minutes: '0', seconds: '0', isExpired: false });
    const [timerLabel, setTimerLabel] = useState<string>('');

    // Memoize the calculation function to avoid recreating it on each render
    const calculateTime = useCallback(() => {
        const now = new Date();
        const startDate = new Date(votingEvent.start_date);
        const endDate = new Date(votingEvent.end_date);
        let targetDate: Date;
        let currentLabel = '';

        if (now < startDate) {
            targetDate = startDate;
            currentLabel = 'Event Starts In:';
        } else if (now < endDate) {
            targetDate = endDate;
            currentLabel = 'Event Ends In:';
        } else {
            setTimeDetails({ days: '0', hours: '0', minutes: '0', seconds: '0', isExpired: true });
            setTimerLabel('Event Has Ended');
            return;
        }

        const remaining = formatTimeRemaining(targetDate.toISOString());
        setTimeDetails({
            days: String(remaining.days),
            hours: String(remaining.hours),
            minutes: String(remaining.minutes),
            seconds: String(remaining.seconds),
            isExpired: remaining.isExpired,
        });
        setTimerLabel(currentLabel);
    }, [votingEvent.start_date, votingEvent.end_date]);

    // Timer effect
    useEffect(() => {
        calculateTime(); // Initial calculation
        const intervalId = setInterval(calculateTime, 1000);

        return () => clearInterval(intervalId);
    }, [calculateTime]);

    // Polling for real-time updates with a longer interval for better performance
    useEffect(() => {
        const intervalId = setInterval(() => {
            router.reload({
                only: ['votingEvent', 'club', 'lastNomination', 'candidates', 'votingStats'],
            });
        }, 60000); // Poll every 60 seconds instead of 30 for better performance

        return () => clearInterval(intervalId);
    }, []);

    // Memoize breadcrumbs to prevent recreation on each render
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Voting Events',
                href: route('admin.voting-events.index'),
            },
            {
                title: votingEvent.title,
                href: route('admin.voting-events.show', votingEvent.id),
            },
        ],
        [votingEvent.id, votingEvent.title],
    );

    // Memoized time display components to prevent recreation on each render
    const timeDisplayBlocks = useMemo(() => {
        return [
            { label: 'Days', value: timeDetails.days },
            { label: 'Hours', value: timeDetails.hours },
            { label: 'Mins', value: timeDetails.minutes },
            { label: 'Secs', value: timeDetails.seconds },
        ];
    }, [timeDetails.days, timeDetails.hours, timeDetails.minutes, timeDetails.seconds]);

    // Memoized stats blocks to prevent recreation on each render
    const statsBlocks = useMemo(() => {
        return [
            {
                icon: <VoteIcon className="size-4" />,
                label: 'Total Votes',
                value: votingStats.totalVotes,
            },
            {
                icon: <Users2Icon className="size-4" />,
                label: 'Eligible Voters',
                value: votingStats.totalEligibleVoters,
            },
            {
                icon: <UserCogIcon className="size-4" />,
                label: 'Candidates',
                value: votingStats.totalCandidates,
            },
            {
                icon: <BriefcaseIcon className="size-4" />,
                label: 'Positions',
                value: votingStats.totalPositions,
            },
        ];
    }, [votingStats.totalVotes, votingStats.totalEligibleVoters, votingStats.totalCandidates, votingStats.totalPositions]);

    // Memoized recent voters to prevent recreation on each render
    const recentVotersSection = useMemo(
        () => (
            <div>
                <h3 className="mb-2 text-sm font-medium">Recent Voters</h3>
                <div className="space-y-2">
                    {votingStats.recentVoters.map((voter) => (
                        <div key={voter.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Avatar className="size-10 rounded-md border">
                                    <AvatarImage src={voter.avatar} alt={voter.name} />
                                    <AvatarFallback>
                                        {voter.name
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{voter.name}</span>
                                    <span className="text-muted-foreground text-xs">ID: {voter.student_id}</span>
                                </div>
                            </div>
                            <span className="text-muted-foreground text-xs">{voter.timestamp}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        [votingStats.recentVoters],
    );

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Voting Event - ${votingEvent.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ManagementPageHeader title={votingEvent.title} description={`Voting event for ${club?.name || 'Unknown Club'}`}>
                    <div className="flex items-center gap-2">
                        {votingEvent.status !== 'closed' && (
                            <CheckUserPermission permission="edit_voting_events">
                                <Button asChild>
                                    <Link href={route('admin.voting-events.edit', votingEvent.id)}>
                                        <Edit className="mr-2 size-4" /> Edit Voting Event
                                    </Link>
                                </Button>
                            </CheckUserPermission>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={route('admin.voting-events.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Go Back
                            </Link>
                        </Button>
                    </div>
                </ManagementPageHeader>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Voting Event Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Voting Event Details</CardTitle>
                            <CardDescription>Information about this voting event</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10 rounded-md border">
                                        <AvatarImage src={club?.image || undefined} alt={club?.name || 'Club'} />
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">{club?.name || 'Unknown Club'}</h3>
                                        <p className="text-muted-foreground text-sm">Club Member Count: {club?.members_count || 'N/A'}</p>
                                    </div>
                                </div>
                                <StatusBadge status={votingEvent.status} className="text-sm" />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="text-muted-foreground size-4" />
                                    <span className="text-muted-foreground">Start Date:</span>
                                    <span className="font-medium">{formatDate(votingEvent.start_date, 'MMMM dd, yyyy h:mm a')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="text-muted-foreground size-4" />
                                    <span className="text-muted-foreground">End Date:</span>
                                    <span className="font-medium">{formatDate(votingEvent.end_date, 'MMMM dd, yyyy h:mm a')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="text-muted-foreground size-4" />
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="font-medium">{formatDate(votingEvent.created_at, 'MMMM dd, yyyy h:mm a')}</span>
                                </div>
                                {votingEvent.updated_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="text-muted-foreground size-4" />
                                        <span className="text-muted-foreground">Last Updated:</span>
                                        <span className="font-medium">{formatDate(votingEvent.updated_at, 'MMMM dd, yyyy h:mm a')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <h3 className="text-sm font-medium">Description</h3>
                                <p className="text-muted-foreground mt-1 text-sm">{votingEvent.description || 'No description provided.'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Last Nomination Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="size-5" />
                                <span>Last Nomination</span>
                            </CardTitle>
                            <CardDescription>Details from the most recent nomination for this club</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lastNomination ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-medium">{lastNomination.title}</h3>
                                        <div className="flex items-center gap-2 text-sm">
                                            <StatusBadge status={lastNomination.status} />
                                            <span className="text-muted-foreground text-sm">
                                                {formatDate(lastNomination.created_at, 'MMMM dd, yyyy h:mm a')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-muted-foreground text-sm">{lastNomination.description || 'No description provided.'}</p>
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="text-muted-foreground size-4" />
                                            <span className="text-muted-foreground">Start Date:</span>
                                            <span className="font-medium">{formatDate(lastNomination.start_date, 'MMMM dd, yyyy h:mm a')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="text-muted-foreground size-4" />
                                            <span className="text-muted-foreground">End Date:</span>
                                            <span className="font-medium">{formatDate(lastNomination.end_date, 'MMMM dd, yyyy h:mm a')}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button variant="outline" size="sm" asChild className="mt-2">
                                            <Link href={route('admin.nominations.show', lastNomination.id)}>
                                                <Users className="mr-2 size-4" /> View Candidates
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <ClipboardList className="text-muted-foreground size-10" />
                                    <h3 className="mt-4 font-medium">No nomination data available</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">This club doesn't have any previous nominations.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {/* Candidates Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="size-5" />
                                <span>Candidates</span>
                            </CardTitle>
                            <CardDescription>Candidates participating in this voting event</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {candidates && candidates.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <div className="bg-muted/50 flex items-center justify-between p-3 text-sm font-medium">
                                            <div className="text-muted-foreground w-12">#</div>
                                            <div className="flex-1">Candidate</div>
                                            <div className="w-24 text-right">Position</div>
                                            <div className="w-24 text-right">Votes</div>
                                        </div>
                                        <div className="divide-y">
                                            {candidates.map((candidate, index) => (
                                                <div key={candidate.id} className="flex items-center justify-between p-3 text-sm">
                                                    <div className="text-muted-foreground w-12">{index + 1}</div>
                                                    <div className="flex flex-1 items-center gap-2">
                                                        <Avatar className="size-10 rounded-md border">
                                                            <AvatarImage src={candidate.user?.avatar || undefined} alt={candidate.user?.name || ''} />
                                                            <AvatarFallback>
                                                                {candidate.user?.name
                                                                    ? candidate.user.name
                                                                          .split(' ')
                                                                          .map((n: string) => n[0])
                                                                          .join('')
                                                                    : ''}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span>{candidate.user?.name}</span>
                                                            <span className="text-muted-foreground text-xs">ID: {candidate.user?.student_id}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-24 text-right font-medium">{candidate.club_position?.name || '-'}</div>
                                                    <div className="w-24 text-right font-medium">{candidate.votes_count || 0}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Users className="text-muted-foreground size-10" />
                                    <h3 className="mt-4 font-medium">No candidates available</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">This club doesn't have any candidates registered yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Voting Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="size-5" />
                                <span>Voting Statistics</span>
                            </CardTitle>
                            <CardDescription>Overview of voting activity and statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {votingStats && votingStats.totalVotes > 0 ? (
                                <div className="space-y-6">
                                    {/* Vote progress bar */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Total Votes Cast</span>
                                            <span className="font-medium">
                                                {votingStats.totalVotes} / {votingStats.totalEligibleVoters}
                                            </span>
                                        </div>
                                        <div className="bg-muted h-2.5 w-full rounded-full">
                                            <div
                                                className="bg-primary h-2.5 rounded-full"
                                                style={{ width: `${votingStats.votingPercentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-muted-foreground flex justify-between text-xs">
                                            <span>{votingStats.votingPercentage}% Participation</span>
                                            <span>{votingStats.daysRemaining}</span>
                                        </div>
                                    </div>

                                    {/* Live Countdown Timer */}
                                    {!timeDetails.isExpired && (
                                        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Clock className="text-primary h-5 w-5" />
                                                <span className="text-primary font-medium">{timerLabel}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-center">
                                                {timeDisplayBlocks.map((item) => (
                                                    <div key={item.label} className="bg-background flex flex-col rounded-md p-2 shadow-sm">
                                                        <span className="text-primary text-xl font-bold">{item.value}</span>
                                                        <span className="text-muted-foreground text-xs">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {timeDetails.isExpired && timerLabel === 'Event Has Ended' && (
                                        <div className="bg-card text-card-foreground rounded-lg border p-4 text-center shadow-sm">
                                            <Clock className="text-destructive mx-auto mb-2 h-8 w-8" />
                                            <p className="text-destructive font-medium">{timerLabel}</p>
                                        </div>
                                    )}

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {statsBlocks.map((block, index) => (
                                            <div key={index} className="rounded-lg border p-3">
                                                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                                                    {block.icon}
                                                    <span>{block.label}</span>
                                                </div>
                                                <div className="text-2xl font-bold">{block.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Last voted users */}
                                    {recentVotersSection}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <BarChart3 className="text-muted-foreground size-10" />
                                    <h3 className="mt-4 font-medium">No voting data available</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">Voting hasn't started yet for this event.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminAppLayout>
    );
}
