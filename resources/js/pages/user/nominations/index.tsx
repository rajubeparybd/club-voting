import ActiveNominationsCard from '@/components/user/nominations/ActiveNominationsCard';
import ReadyToLeadCard from '@/components/user/nominations/ReadyToLeadCard';
import UserAppLayout from '@/layouts/user/user-layout';
import { type BreadcrumbItem, type Nomination, type User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface NominationsIndexProps {
    nominations: Nomination[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Nominations',
        href: route('user.nominations.index'),
    },
];

export default function NominationsIndex({ nominations }: NominationsIndexProps) {
    const user = usePage().props.user as User;
    const isCandidate = user?.is_candidate;
    return (
        <UserAppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Head title="Nominations" />
                {isCandidate ? <ReadyToLeadCard /> : <ActiveNominationsCard nominations={nominations} />}

                {/* My Applications Section */}
                {/* This section can be converted into its own component, e.g., MyApplicationsSection.tsx */}
                {/* if (applications.length > 0) { */}
                {/*     <section className="space-y-4">
                        <h2 className="text-xl font-semibold">My Applications</h2>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left text-sm font-medium dark:border-gray-800 dark:bg-gray-900">
                                        <th className="px-4 py-3">Club</th>
                                        <th className="px-4 py-3">Nomination</th>
                                        <th className="px-4 py-3">Position(s)</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Date Applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((application) => (
                                        <tr
                                            key={application.id}
                                            className="border-b text-sm last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                                        >
                                            <td className="px-4 py-3">{application.nomination.club.name}</td>
                                            <td className="px-4 py-3">{application.nomination.title}</td>
                                            <td className="px-4 py-3">
                                                {application.positions.map((position: ClubPosition) => position.name).join(', ')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        application.isPending
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                                                            : application.isApproved
                                                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                                                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                                    }`}
                                                >
                                                    {application.isPending ? 'Pending' : application.isApproved ? 'Approved' : 'Rejected'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">{new Date(application.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                }*/}
            </div>
        </UserAppLayout>
    );
}
