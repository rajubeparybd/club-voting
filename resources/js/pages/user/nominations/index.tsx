import { Button } from '@/components/ui/button';
import UserAppLayout from '@/layouts/user/user-layout';
import { User, type Nomination } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { formatDate } from 'date-fns';
import { Award, CalendarClock, CalendarIcon, ClockIcon, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface NominationsIndexProps {
    nominations: Nomination[];
}

const ReadyToLeadCard = () => {
    const handleBecomeCandidate = () => {
        router.post(route('user.nominations.become-candidate'));
    };

    return (
        <section className="rounded-xl bg-[#26304a] p-6 text-white shadow-md">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                        <Award className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Ready to Lead?</h2>
                        <p className="text-gray-300">Join a club as a candidate and make a difference!</p>
                    </div>
                </div>
                <Button onClick={handleBecomeCandidate} className="bg-blue-500 px-5 py-2 font-medium text-white hover:bg-blue-600">
                    Become a Candidate
                </Button>
            </div>
        </section>
    );
};

// Helper function to format time remaining
const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();

    if (diffTime <= 0) {
        return { text: 'Ended', isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    return {
        text: `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`,
        isExpired: false,
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds,
    };
};

const NominationCard = ({ nomination }: { nomination: Nomination }) => {
    const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(nomination.end_date));

    // Update time remaining every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(formatTimeRemaining(nomination.end_date));
        }, 1000);

        return () => clearInterval(timer);
    }, [nomination.end_date]);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
            {/* Club Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        {nomination.club?.image && <img src={nomination.club.image} alt={nomination.club.name} className="h-10 w-10 rounded-full" />}
                    </div>
                    <div>
                        <h3 className="font-medium">{nomination.club?.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Club Nomination</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-3 text-xl font-semibold">{nomination.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{nomination.description || 'No description provided'}</p>

                {/* Timer Section */}
                <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                    <div className="mb-2 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">Time Remaining</span>
                    </div>

                    {timeRemaining.isExpired ? (
                        <div className="font-medium text-red-600 dark:text-red-400">Nomination Ended</div>
                    ) : (
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="flex flex-col rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
                                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{timeRemaining.days}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Days</span>
                            </div>
                            <div className="flex flex-col rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
                                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{timeRemaining.hours}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Hours</span>
                            </div>
                            <div className="flex flex-col rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
                                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{timeRemaining.minutes}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Mins</span>
                            </div>
                            <div className="flex flex-col rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
                                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{timeRemaining.seconds}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Secs</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="mb-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Start:</span> {formatDate(nomination.start_date, 'MMM d, yyyy hh:mm a')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">End:</span> {formatDate(nomination.end_date, 'MMM d, yyyy hh:mm a')}
                        </span>
                    </div>
                    {nomination.positions && (
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Positions:</span> {nomination.positions.length} available
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <Button asChild className="mt-auto w-full">
                    <Link href="">Apply Now</Link>
                </Button>
            </div>
        </div>
    );
};

const ActiveNominationsCard = ({ nominations }: { nominations: Nomination[] }) => {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Active Nominations</h2>
                {nominations.length > 0 && (
                    <div className="flex items-center text-sm text-red-500">
                        <Info className="mr-2 h-4 w-4" />
                        <span>Apply before nominations end</span>
                    </div>
                )}
            </div>

            {nominations.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <div className="mb-3 flex justify-center">
                        <CalendarClock className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-lg font-medium">No Active Nominations</h3>
                    <p className="text-gray-500 dark:text-gray-400">There are no active nominations for clubs where you are a member.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {nominations.map((nomination) => (
                        <NominationCard key={nomination.id} nomination={nomination} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default function NominationsIndex({ nominations }: NominationsIndexProps) {
    const user = usePage().props.user as User;
    const isCandidate = user?.is_candidate;
    return (
        <UserAppLayout>
            <div className="container space-y-8 p-4">
                <Head title="Nominations" />
                {isCandidate ? <ReadyToLeadCard /> : <ActiveNominationsCard nominations={nominations} />}

                {/* My Applications Section */}
                {/* {applications.length > 0 && (
                    <section className="space-y-4">
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
                )} */}
            </div>
        </UserAppLayout>
    );
}
