import NominationCard from '@/components/user/nominations/NominationCard';
import { Nomination, NominationApplication } from '@/types';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function ClubNomination({
    nominations,
    applications,
    numberOfItems,
    hasUpcoming,
}: {
    nominations: Nomination[];
    applications: NominationApplication[];
    numberOfItems: number;
    hasUpcoming: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Club Active Nominations</CardTitle>
                    <CardDescription>Nominations you can vote in right now</CardDescription>
                </div>
                <Link
                    href={route('user.nominations.index')}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
                >
                    View all <ExternalLink className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 ${hasUpcoming ? 'xl:grid-cols-2' : 'xl:grid-cols-3'}`}>
                    {nominations.slice(0, numberOfItems).map((nomination) => (
                        <NominationCard key={nomination.id} nomination={nomination} applications={applications} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
