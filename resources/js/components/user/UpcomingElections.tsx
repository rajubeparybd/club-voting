import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VotingEvent } from '@/types';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { route } from 'ziggy-js';
import VotingEventCard from './voting-events/VotingEventCard';

interface UpcomingElectionsProps {
    votingEvents: VotingEvent[];
}

export default function UpcomingElections({ votingEvents }: UpcomingElectionsProps) {
    if (!votingEvents.length) {
        return null;
    }

    return (
        <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Upcoming Elections</CardTitle>
                    <CardDescription>Elections starting soon</CardDescription>
                </div>
                <Link
                    href={route('user.voting-events.index')}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
                >
                    View all <ExternalLink className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {votingEvents.map((votingEvent) => (
                        <VotingEventCard key={votingEvent.id} votingEvent={votingEvent} className="h-fit" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
