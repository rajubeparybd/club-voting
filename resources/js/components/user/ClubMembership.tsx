import DashboardClubCard from '@/components/user/DashboardClubCard';
import { Club, PaymentMethod, type User } from '@/types';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
export default function ClubMembership({ clubs, user, paymentMethods }: { clubs: Club[]; user: User; paymentMethods: PaymentMethod[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl font-bold">Club Membership</CardTitle>
                    <CardDescription>Clubs you are a member of</CardDescription>
                </div>
                <Link
                    href={route('user.clubs.index')}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
                >
                    View all <ExternalLink className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                    {clubs.slice(0, 2).map((club) => (
                        <DashboardClubCard key={club.id} club={club} userId={user.id.toString()} paymentMethods={paymentMethods} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
