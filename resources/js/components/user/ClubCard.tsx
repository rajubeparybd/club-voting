import JoinClubButton from '@/components/user/JoinClubButton';
import { getNoImage } from '@/lib/utils';
import { Club, PaymentMethod } from '@/types';

export default function ClubCard({ club, userId, paymentMethods }: { club: Club; userId?: string; paymentMethods: PaymentMethod[] }) {
    const isMember = club.users?.some((user) => user.id === Number(userId)) || false;
    const user = club.users?.find((user) => user.id === Number(userId));
    const memberStatus = user?.pivot?.status || 'pending';

    return (
        <div className="bg-card dark:bg-card rounded-xl shadow-sm transition-transform duration-300 hover:shadow-md">
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-t-xl">
                <img src={club.image || getNoImage(400, 200, club.name)} alt={club.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold">{club.name}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">{club.description}</p>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">
                        Join Fee: <span className="font-bold">{club.join_fee}৳</span>
                    </span>
                    <span className="text-muted-foreground text-sm">{club.members_count} members</span>
                </div>
                <div className="mt-4 flex items-center justify-end">
                    <JoinClubButton club={club} userId={userId} paymentMethods={paymentMethods} isMember={isMember} memberStatus={memberStatus} />
                </div>
            </div>
        </div>
    );
}
