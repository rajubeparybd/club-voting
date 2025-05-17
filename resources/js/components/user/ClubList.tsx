import JoinClubButton from '@/components/user/JoinClubButton';
import { getNoImage } from '@/lib/utils';
import { Club, PaymentMethod } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export function ClubListItem({ club, userId, paymentMethods }: { club: Club; userId?: string; paymentMethods: PaymentMethod[] }) {
    const isMember = club.users?.some((user) => user.id === Number(userId)) || false;
    const user = club.users?.find((user) => user.id === Number(userId));
    const memberStatus = user?.pivot?.status || 'pending';

    return (
        <div className="bg-card flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center space-x-4">
                <img src={club.image || getNoImage(80, 80, club.name)} alt={club.name} className="h-16 w-16 rounded-md object-cover" />
                <div>
                    <h3 className="text-lg font-semibold">{club.name}</h3>
                    <p className="text-muted-foreground text-sm">
                        {club.members_count} members • Join Fee: {club.join_fee}৳
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <JoinClubButton club={club} userId={userId} paymentMethods={paymentMethods} isMember={isMember} memberStatus={memberStatus} />
                <Link href={`/clubs/${club.id}`} className="text-muted-foreground ml-2">
                    <ChevronRight className="h-5 w-5" />
                </Link>
            </div>
        </div>
    );
}

export default function ClubList({ clubs, userId, paymentMethods }: { clubs: Club[]; userId?: string; paymentMethods: PaymentMethod[] }) {
    return (
        <div className="space-y-4">
            {clubs.map((club) => (
                <ClubListItem key={club.id} club={club} userId={userId} paymentMethods={paymentMethods} />
            ))}

            {clubs.length === 0 && (
                <div className="bg-card rounded-lg border p-8 text-center">
                    <p className="text-muted-foreground">No clubs available.</p>
                </div>
            )}
        </div>
    );
}
