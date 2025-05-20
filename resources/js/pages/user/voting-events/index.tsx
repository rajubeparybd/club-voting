import { Card } from '@/components/ui/card';
import VotingEventCard from '@/components/user/voting-events/VotingEventCard';
import UserAppLayout from '@/layouts/user/user-layout';
import { BreadcrumbItem, VotingEvent } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Check, History, Info, Vote } from 'lucide-react';

interface Props {
    activeVotingEvents: VotingEvent[];
    upcomingVotingEvents: VotingEvent[];
    completedVotingEvents: VotingEvent[];
}

export default function Index({ activeVotingEvents, upcomingVotingEvents, completedVotingEvents }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Voting Events', href: route('user.voting-events.index') }];

    // Separate active events into those that need voting and those already voted
    const eventsNeedingVotes = activeVotingEvents.filter((event) => !event.has_voted_all);
    const activeCompletedVotes = activeVotingEvents.filter((event) => event.has_voted_all);

    // Filter completed events for those that user participated in
    const participatedEvents = completedVotingEvents.filter((event) => event.has_any_votes);

    // Check if there are any events in any section
    const hasAnyEvents =
        eventsNeedingVotes.length > 0 || activeCompletedVotes.length > 0 || upcomingVotingEvents.length > 0 || participatedEvents.length > 0;

    return (
        <UserAppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Head title="Voting Events" />
                <h1 className="mb-6 text-2xl font-bold">Voting Events</h1>

                {hasAnyEvents ? (
                    <>
                        {eventsNeedingVotes.length > 0 && (
                            <Card className="mb-8 rounded-2xl p-4 lg:p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <Vote className="h-5 w-5 text-blue-500" />
                                    <h2 className="text-xl font-semibold">Active Events</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {eventsNeedingVotes.map((votingEvent) => (
                                        <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} />
                                    ))}
                                </div>
                            </Card>
                        )}

                        {activeCompletedVotes.length > 0 && (
                            <Card className="mb-8 rounded-2xl p-4 lg:p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <h2 className="text-xl font-semibold">My Votes</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {activeCompletedVotes.map((votingEvent) => (
                                        <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} />
                                    ))}
                                </div>
                            </Card>
                        )}

                        {upcomingVotingEvents.length > 0 && (
                            <Card className="mb-8 rounded-2xl p-4 lg:p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-orange-500" />
                                    <h2 className="text-xl font-semibold">Upcoming Events</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {upcomingVotingEvents.map((votingEvent) => (
                                        <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} />
                                    ))}
                                </div>
                            </Card>
                        )}

                        {participatedEvents.length > 0 && (
                            <Card className="rounded-2xl p-4 lg:p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <History className="h-5 w-5 text-purple-500" />
                                    <h2 className="text-xl font-semibold">Past Elections</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {participatedEvents.map((votingEvent) => (
                                        <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} />
                                    ))}
                                </div>
                            </Card>
                        )}
                    </>
                ) : (
                    <Card className="rounded-2xl p-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Info className="mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium">No Voting Events Available</h3>
                            <p className="text-sm text-gray-500">There are no active, upcoming, or completed voting events for your clubs.</p>
                        </div>
                    </Card>
                )}
            </div>
        </UserAppLayout>
    );
}
