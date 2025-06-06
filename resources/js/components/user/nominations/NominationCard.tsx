import { Button } from '@/components/ui/button';
import { cn, formatTimeRemaining } from '@/lib/utils';
import type { Nomination, NominationApplication } from '@/types';
import { router } from '@inertiajs/react';
import { formatDate } from 'date-fns';
import { Award, CalendarClock, CalendarIcon, ClockIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NominationApplicationDialog } from './NominationApplicationDialog';

interface NominationCardProps {
    nomination: Nomination;
    applications: NominationApplication[];
    className?: string;
}

const NominationCard: React.FC<NominationCardProps> = ({ nomination, applications, className }) => {
    const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(nomination.end_date));
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const hasStarted = new Date(nomination.start_date) <= new Date();

    useEffect(() => {
        const timer = setInterval(() => {
            const updatedTimeRemaining = formatTimeRemaining(hasStarted ? nomination.end_date : nomination.start_date);
            setTimeRemaining(updatedTimeRemaining);

            if (updatedTimeRemaining.isExpired && !hasStarted) {
                router.reload();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nomination.end_date, nomination.start_date, hasStarted]);

    const handleApplyNow = () => {
        setIsDialogOpen(true);
    };

    return (
        <div
            className={cn(
                'flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950',
                className,
            )}
        >
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
            <div className="flex flex-1 flex-col bg-gray-100 p-6 dark:bg-[#252834]">
                <h3 className="mb-3 text-xl font-semibold">{nomination.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{nomination.description || 'No description provided'}</p>

                {/* Timer Section */}
                <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                    <div className="mb-2 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                            Time Remaining to {hasStarted ? 'End' : 'Start'} Application
                        </span>
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
                {hasStarted ? (
                    <Button className="mt-auto w-full" onClick={handleApplyNow} disabled={timeRemaining.isExpired}>
                        Apply Now
                    </Button>
                ) : (
                    <Button className="mt-auto w-full" disabled={true}>
                        Upcoming
                    </Button>
                )}
            </div>

            {/* Application Dialog */}
            <NominationApplicationDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} nomination={nomination} applications={applications} />
        </div>
    );
};

export default React.memo(NominationCard);
