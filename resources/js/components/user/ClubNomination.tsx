import NominationCard from '@/components/user/nominations/NominationCard';
import { Nomination } from '@/types';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function ClubNomination({ nominations }: { nominations: Nomination[] }) {
    return (
        <div className="mb-4 rounded-2xl bg-[#191B22] p-4 lg:col-span-8 lg:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-poppins text-xl font-semibold text-white">Club Active Nominations</h2>
                <Link href={route('user.nominations.index')} className="font-poppins text-lg text-white transition-colors hover:text-gray-300">
                    See all
                </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                {nominations.slice(0, 2).map((nomination) => (
                    <NominationCard key={nomination.id} nomination={nomination} />
                ))}
            </div>
        </div>
    );
}
