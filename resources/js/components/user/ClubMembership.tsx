import DashboardClubCard from '@/components/user/DashboardClubCard';
import { Club, PaymentMethod, type User } from '@/types';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function ClubMembership({ clubs, user, paymentMethods }: { clubs: Club[]; user: User; paymentMethods: PaymentMethod[] }) {
    return (
        <div className="mb-4 rounded-2xl bg-[#191B22] p-4 lg:col-span-8 lg:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-poppins text-xl font-semibold text-white">Club Membership</h2>
                <Link href={route('user.clubs.index')} className="font-poppins text-lg text-white transition-colors hover:text-gray-300">
                    See all
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                {clubs.slice(0, 2).map((club) => (
                    <DashboardClubCard key={club.id} club={club} userId={user.id.toString()} paymentMethods={paymentMethods} />
                ))}
            </div>
        </div>
    );
}
