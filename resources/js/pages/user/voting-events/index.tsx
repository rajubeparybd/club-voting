import { Card } from '@/components/ui/card';
import VotingEventCard from '@/components/user/voting-events/VotingEventCard';
import UserAppLayout from '@/layouts/user/user-layout';
import { BreadcrumbItem, VotingEvent } from '@/types';
import { Head } from '@inertiajs/react';

interface Props {
    activeVotingEvents: VotingEvent[];
    upcomingVotingEvents: VotingEvent[];
}

export default function Index({ activeVotingEvents, upcomingVotingEvents }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Voting Events', href: route('user.voting-events.index') }];

    return (
        <UserAppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Head title="Voting Events" />
                <h1 className="mb-6 text-2xl font-bold">Voting Events</h1>

                {activeVotingEvents.length > 0 && (
                    <Card className="rounded-2xl p-4 lg:p-6">
                        <h2 className="text-xl font-semibold">Active Events</h2>
                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {activeVotingEvents.map((votingEvent) => (
                                <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} />
                            ))}
                        </div>
                    </Card>
                )}

                {upcomingVotingEvents.length > 0 && (
                    <Card className="rounded-2xl p-4 lg:p-6">
                        <h2 className="text-xl font-semibold">Upcoming Events</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingVotingEvents.map((votingEvent) => (
                                <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} />
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </UserAppLayout>
    );
}
