import ActiveNominationsCard from '@/components/user/nominations/ActiveNominationsCard';
import MyApplicationsSection from '@/components/user/nominations/MyApplicationsSection';
import ReadyToLeadCard from '@/components/user/nominations/ReadyToLeadCard';
import UserAppLayout from '@/layouts/user/user-layout';
import { type BreadcrumbItem, type Nomination, type NominationApplication, type User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface NominationsIndexProps {
    nominations: Nomination[];
    applications: NominationApplication[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Nominations',
        href: route('user.nominations.index'),
    },
];

export default function NominationsIndex({ nominations, applications }: NominationsIndexProps) {
    const user = usePage().props.user as User;
    const isCandidate = user?.is_candidate;
    return (
        <UserAppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Head title="Nominations" />
                {isCandidate ? <ReadyToLeadCard /> : <ActiveNominationsCard nominations={nominations} applications={applications} />}

                {/* My Applications Section */}
                {applications.length > 0 && <MyApplicationsSection applications={applications} />}
            </div>
        </UserAppLayout>
    );
}
