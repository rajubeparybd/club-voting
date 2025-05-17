import JoinClubButton from '@/components/user/JoinClubButton';
import { getNoImage } from '@/lib/utils';
import { Club, PaymentMethod } from '@/types';

export default function DashboardClubCard({ club, userId, paymentMethods }: { club: Club; userId?: string; paymentMethods: PaymentMethod[] }) {
    const isMember = club.users?.some((user) => user.id === Number(userId)) || false;
    const user = club.users?.find((user) => user.id === Number(userId));
    const memberStatus = user?.pivot?.status || 'pending';

    return (
        <div className="rounded-2xl bg-[#252834] p-4 transition-transform duration-300 hover:scale-[1.02] lg:p-6">
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                <img src={club.image || getNoImage(400, 200, club.name)} alt={club.name} className="h-full w-full object-cover" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{club.name}</h3>
            <p className="mb-4 line-clamp-2 text-base text-gray-400">{club.description}</p>
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-400">
                    Join Fee: <span className="font-bold">{club.join_fee}৳</span>
                </span>
                <span className="text-sm text-gray-400">{club.members_count} members</span>
            </div>
            <div className="mt-2 flex items-center justify-end">
                <JoinClubButton club={club} userId={userId} paymentMethods={paymentMethods} isMember={isMember} memberStatus={memberStatus} />
            </div>
        </div>
    );
}
