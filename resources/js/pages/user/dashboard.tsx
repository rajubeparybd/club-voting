import ClubMembership from '@/components/user/ClubMembership';
import ClubNomination from '@/components/user/ClubNomination';
import OngoingElections from '@/components/user/OngoingElections';
import UpcomingElections from '@/components/user/UpcomingElections';
import UpcomingNominations from '@/components/user/UpcomingNomination';
import UserInfoCard from '@/components/user/UserInfoCard';
import AppLayout from '@/layouts/user/user-layout';
import {
    Club,
    PaymentMethod,
    SharedData,
    type BreadcrumbItem,
    type Nomination,
    type NominationApplication,
    type User,
    type VotingEvent,
} from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('user.dashboard'),
    },
];

export default function Dashboard({
    clubs,
    paymentMethods,
    activeNominations,
    upcomingNominations,
    applications,
    activeVotingEvents,
    upcomingVotingEvents,
}: {
    clubs: Club[];
    paymentMethods: PaymentMethod[];
    activeNominations: Nomination[];
    upcomingNominations: Nomination[];
    applications: NominationApplication[];
    activeVotingEvents: VotingEvent[];
    upcomingVotingEvents: VotingEvent[];
}) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User;
    const hasActiveVotingEvents = activeVotingEvents.length > 0;
    const hasUpcomingVotingEvents = upcomingVotingEvents.length > 0;
    const hasActiveNominations = activeNominations.length > 0;
    const hasUpcomingNominations = upcomingNominations.length > 0;
    const hasClubs = clubs.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <UserInfoCard user={user} />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
                    <div className={`${hasUpcomingVotingEvents ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                        <div className="space-y-4 lg:space-y-8">
                            {hasActiveVotingEvents && <OngoingElections votingEvents={activeVotingEvents} />}
                            {hasActiveNominations && <ClubNomination nominations={activeNominations} applications={applications} />}
                            {hasClubs && <ClubMembership clubs={clubs} user={user} paymentMethods={paymentMethods} />}
                        </div>
                    </div>
                    {/* {hasUpcomingVotingEvents || */}
                    {/* // (hasUpcomingNominations && ( */}
                    <div className="lg:col-span-4">
                        {hasUpcomingVotingEvents && <UpcomingElections votingEvents={upcomingVotingEvents} />}
                        {hasUpcomingNominations && <UpcomingNominations nominations={upcomingNominations} />}
                    </div>
                    {/* ))} */}
                </div>
            </div>
        </AppLayout>
    );
}
