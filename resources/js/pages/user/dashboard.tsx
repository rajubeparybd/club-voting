import ClubMembership from '@/components/user/ClubMembership';
import ClubNomination from '@/components/user/ClubNomination';
import UserInfoCard from '@/components/user/UserInfoCard';
import AppLayout from '@/layouts/user/user-layout';
import { Club, PaymentMethod, SharedData, type BreadcrumbItem, type Nomination, type User } from '@/types';
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
    nominations,
}: {
    clubs: Club[];
    paymentMethods: PaymentMethod[];
    nominations: Nomination[];
}) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <UserInfoCard user={user} />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-8">
                        <div className="space-y-4 lg:space-y-6">
                            {/* <OngoingElections /> */}
                            {nominations.length > 0 && <ClubNomination nominations={nominations} />}
                            <ClubMembership clubs={clubs} user={user} paymentMethods={paymentMethods} />
                        </div>
                    </div>
                    <div className="lg:col-span-4">
                        Upcoming Elections
                        {/* <UpcomingElections /> */}
                        {/* <UpcomingEvents /> */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
