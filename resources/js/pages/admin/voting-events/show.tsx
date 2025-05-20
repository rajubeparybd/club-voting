import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { StatusBadge } from '@/components/ui/status-badge';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem, Club, Nomination, VotingEvent } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, BarChart3, Calendar, ClipboardList, Clock, Edit, Users } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
    votingEvent: VotingEvent;
    club: Club;
    lastNomination: Nomination | null;
}

export default function VotingEventShow({ votingEvent, club, lastNomination }: Props) {
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
        [votingEvent],
    );

    // Helper function to safely format dates
    const formatDate = (dateString: string | undefined, formatString: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return format(date, formatString);
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Voting Event - ${votingEvent.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ManagementPageHeader title={votingEvent.title} description={`Voting event for ${club?.name || 'Unknown Club'}`}>
                    <div className="flex items-center gap-2">
                        <CheckUserPermission permission="edit_voting_events">
                            <Button asChild>
                                <Link href={route('admin.voting-events.edit', votingEvent.id)}>
                                    <Edit className="mr-2 size-4" /> Edit Voting Event
                                </Link>
                            </Button>
                        </CheckUserPermission>
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

                {/* Candidates and voting stats would go here in future enhancements */}

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
                            {lastNomination ? (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <div className="bg-muted/50 flex items-center justify-between p-3 text-sm font-medium">
                                            <div className="text-muted-foreground w-12">#</div>
                                            <div className="flex-1">Candidate</div>
                                            <div className="w-24 text-right">Position</div>
                                            <div className="w-24 text-right">Votes</div>
                                        </div>
                                        <div className="divide-y">
                                            {/* Mock candidate data - this would come from the API in a real implementation */}
                                            {[
                                                { id: 1, name: 'John Smith', avatar: undefined, position: 'President', votes: 45 },
                                                { id: 2, name: 'Sarah Johnson', avatar: undefined, position: 'Vice President', votes: 32 },
                                                { id: 3, name: 'Michael Chen', avatar: undefined, position: 'Secretary', votes: 28 },
                                                { id: 4, name: 'Jessica Williams', avatar: undefined, position: 'Treasurer', votes: 21 },
                                            ].map((candidate) => (
                                                <div key={candidate.id} className="flex items-center justify-between p-3 text-sm">
                                                    <div className="text-muted-foreground w-12">#{candidate.id}</div>
                                                    <div className="flex flex-1 items-center gap-2">
                                                        <Avatar className="size-8 rounded-md border">
                                                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                                                            <AvatarFallback>
                                                                {candidate.name
                                                                    .split(' ')
                                                                    .map((n) => n[0])
                                                                    .join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{candidate.name}</span>
                                                    </div>
                                                    <div className="w-24 text-right font-medium">{candidate.position}</div>
                                                    <div className="w-24 text-right font-medium">{candidate.votes}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        <p>
                                            * This is simulated data for preview purposes. In the future, this will show actual candidates and vote
                                            counts.
                                        </p>
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
                            {lastNomination ? (
                                <div className="space-y-6">
                                    {/* Vote progress bar */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Total Votes Cast</span>
                                            <span className="font-medium">126 / 250</span>
                                        </div>
                                        <div className="bg-muted h-2.5 w-full rounded-full">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: '50.4%' }}></div>
                                        </div>
                                        <div className="text-muted-foreground flex justify-between text-xs">
                                            <span>50.4% Participation</span>
                                            <span>2 days remaining</span>
                                        </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border p-3">
                                            <div className="text-xl font-bold">126</div>
                                            <div className="text-muted-foreground text-xs">Total Votes</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-xl font-bold">250</div>
                                            <div className="text-muted-foreground text-xs">Eligible Voters</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-xl font-bold">8</div>
                                            <div className="text-muted-foreground text-xs">Candidates</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-xl font-bold">4</div>
                                            <div className="text-muted-foreground text-xs">Positions</div>
                                        </div>
                                    </div>

                                    {/* Last voted users */}
                                    <div>
                                        <h3 className="mb-2 text-sm font-medium">Recent Voters</h3>
                                        <div className="space-y-2">
                                            {/* Mock recent voters - this would come from the API in a real implementation */}
                                            {[
                                                { id: 1, name: 'Emma Thompson', timestamp: '2 minutes ago' },
                                                { id: 2, name: 'James Wilson', timestamp: '15 minutes ago' },
                                                { id: 3, name: 'Olivia Martinez', timestamp: '47 minutes ago' },
                                            ].map((voter) => (
                                                <div key={voter.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                                    <span className="font-medium">{voter.name}</span>
                                                    <span className="text-muted-foreground text-xs">{voter.timestamp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-muted-foreground text-xs">
                                        <p>* This is simulated data for preview purposes. In the future, this will show actual voting statistics.</p>
                                    </div>
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
