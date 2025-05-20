import { Button } from '@/components/ui/button';
import { formatTimeRemaining } from '@/lib/utils';
import type { VotingEvent } from '@/types';
import { Link } from '@inertiajs/react';
import { formatDate } from 'date-fns';
import { CalendarClock, CalendarIcon, CheckCircle, ClockIcon, Vote } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface VotingEventCardProps {
    votingEvent: VotingEvent;
}

const VotingEventCard: React.FC<VotingEventCardProps> = ({ votingEvent }) => {
    const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(votingEvent.end_date));

    const hasStarted = new Date(votingEvent.start_date) <= new Date();
    const hasVotedAll = votingEvent.has_voted_all;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(formatTimeRemaining(hasStarted ? votingEvent.end_date : votingEvent.start_date));
        }, 1000);

        return () => clearInterval(timer);
    }, [votingEvent.end_date, votingEvent.start_date, hasStarted]);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
            {/* Club Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        {votingEvent.club?.image && (
                            <img src={votingEvent.club.image} alt={votingEvent.club.name} className="h-10 w-10 rounded-full" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium">{votingEvent.club?.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Club Voting</p>
                    </div>
                </div>
                {hasVotedAll && (
                    <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        <span>Voted</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col bg-[#252834] p-6">
                <h3 className="mb-3 text-xl font-semibold">{votingEvent.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{votingEvent.description || 'No description provided'}</p>

                {/* Timer Section */}
                <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                    <div className="mb-2 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">Time Remaining to {hasStarted ? 'End' : 'Start'} Voting</span>
                    </div>

                    {timeRemaining.isExpired ? (
                        <div className="font-medium text-red-600 dark:text-red-400">Voting Ended</div>
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
                            <span className="font-medium">Start:</span> {formatDate(votingEvent.start_date, 'MMM d, yyyy hh:mm a')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">End:</span> {formatDate(votingEvent.end_date, 'MMM d, yyyy hh:mm a')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Vote className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Status:</span> {hasVotedAll ? 'You have voted' : 'Vote now'}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                {hasStarted ? (
                    <Button className="mt-auto w-full" asChild disabled={timeRemaining.isExpired} variant={hasVotedAll ? 'outline' : 'default'}>
                        <Link href={route('user.voting-events.show', votingEvent.id)}>{hasVotedAll ? 'View Results' : 'Vote Now'}</Link>
                    </Button>
                ) : (
                    <Button className="mt-auto w-full" disabled={true}>
                        Upcoming
                    </Button>
                )}
            </div>
        </div>
    );
};

export default React.memo(VotingEventCard);
