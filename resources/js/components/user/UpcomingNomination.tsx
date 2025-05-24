import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Nomination } from '@/types';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { route } from 'ziggy-js';
import NominationCard from './nominations/NominationCard';

interface UpcomingNominationsProps {
    nominations: Nomination[];
}

export default function UpcomingNominations({ nominations }: UpcomingNominationsProps) {
    if (!nominations.length) {
        return null;
    }

    return (
        <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Upcoming Nominations</CardTitle>
                    <CardDescription>Nominations starting soon</CardDescription>
                </div>
                <Link
                    href={route('user.nominations.index')}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
                >
                    View all <ExternalLink className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {nominations.map((nomination) => (
                        <NominationCard key={nomination.id} nomination={nomination} className="h-fit" applications={[]} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
