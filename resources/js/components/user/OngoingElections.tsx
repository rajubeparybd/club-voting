import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VotingEventCard from '@/components/user/voting-events/VotingEventCard';
import { VotingEvent } from '@/types';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { route } from 'ziggy-js';

interface OngoingElectionsProps {
    votingEvents: VotingEvent[];
    numberOfItems: number;
    hasUpcoming: boolean;
}

export default function OngoingElections({ votingEvents, numberOfItems, hasUpcoming }: OngoingElectionsProps) {
    if (!votingEvents.length) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Active Elections</CardTitle>
                    <CardDescription>Elections you can vote in right now</CardDescription>
                </div>
                <Link
                    href={route('user.voting-events.index')}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
                >
                    View all <ExternalLink className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 ${hasUpcoming ? 'xl:grid-cols-2' : 'xl:grid-cols-3'}`}>
                    {votingEvents.slice(0, numberOfItems).map((votingEvent) => (
                        <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
