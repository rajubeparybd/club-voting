import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Users, Vote } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AnimatedButton from './AnimatedButton';
import { SimpleClub } from './types';

interface ActiveVotingEventCardProps {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    club: SimpleClub;
    index: number;
    positions_count?: number;
    candidates_count?: number;
}

const ActiveVotingEventCard = memo(
    ({ id, title, description, end_date, club, index, positions_count = 0, candidates_count = 0 }: ActiveVotingEventCardProps) => {
        // Memoize end date parsing to avoid repeated Date object creation
        const endDateTime = useMemo(() => new Date(end_date).getTime(), [end_date]);

        // Track if component is still mounted to prevent state updates after unmount
        const isMountedRef = useRef(true);

        // Optimized time calculation function
        const calculateTimeRemaining = useCallback(() => {
            const timeLeft = Math.max(0, endDateTime - Date.now());

            if (timeLeft === 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds, isExpired: false };
        }, [endDateTime]);

        // Initialize state with calculated time
        const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired?: boolean }>(
            calculateTimeRemaining,
        );

        // Optimized timer with dynamic interval and early termination
        useEffect(() => {
            isMountedRef.current = true;

            const updateTimer = () => {
                if (!isMountedRef.current) return;

                const newTime = calculateTimeRemaining();
                setTimeRemaining((prevTime) => {
                    // Only update if there's an actual change to prevent unnecessary renders
                    if (
                        prevTime.days !== newTime.days ||
                        prevTime.hours !== newTime.hours ||
                        prevTime.minutes !== newTime.minutes ||
                        prevTime.seconds !== newTime.seconds
                    ) {
                        return newTime;
                    }
                    return prevTime;
                });

                return newTime.isExpired;
            };

            // Initial update
            updateTimer();

            // Use requestAnimationFrame for better performance and sync with browser refresh rate
            let animationFrameId: number;
            let timeoutId: number;

            const scheduleUpdate = () => {
                timeoutId = window.setTimeout(() => {
                    const isExpired = updateTimer();
                    if (!isExpired && isMountedRef.current) {
                        animationFrameId = requestAnimationFrame(scheduleUpdate);
                    }
                }, 1000);
            };

            scheduleUpdate();

            return () => {
                isMountedRef.current = false;
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }, [calculateTimeRemaining]);

        // Memoize formatted date to avoid recalculation on every render
        const formattedEndDate = useMemo(() => {
            return new Date(end_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }, [end_date]);

        // Memoize progress calculation
        const progressPercentage = useMemo(() => {
            return positions_count > 0 ? Math.min((candidates_count / positions_count) * 100, 100) : 0;
        }, [candidates_count, positions_count]);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * (index % 3) }}
            >
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#262f43] to-green-500/30 opacity-90"></div>

                    <div className="relative z-10 flex h-full flex-col p-6">
                        <div className="absolute top-0 right-0 pt-4 pr-4">
                            <motion.div
                                className="flex items-center gap-1.5 rounded-full border border-green-500 bg-gradient-to-r from-green-500/30 to-green-400/30 px-3 py-1"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <motion.div
                                    className="h-2 w-2 rounded-full bg-green-500"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span className="text-xs font-medium text-green-400">Live Vote</span>
                            </motion.div>
                        </div>

                        {/* Main content */}
                        <div className="flex flex-1 flex-col">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg">
                                    {club.image ? (
                                        <img src={club.image} alt={club.name} width={48} height={48} className="rounded-md" />
                                    ) : (
                                        <Vote className="h-6 w-6 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="line-clamp-1 text-xl font-bold text-white">{title}</h3>
                                    <p className="flex items-center text-sm text-green-300">
                                        <Users className="mr-2 h-4 w-4" />
                                        <p className="line-clamp-1">{club.name}</p>
                                    </p>
                                </div>
                            </div>

                            <p className="mb-4 flex-1 text-sm text-slate-400">{description}</p>

                            {/* Time remaining section */}
                            <div className="mb-4 rounded-xl border border-green-500 bg-green-500/10 p-4">
                                <p className="mb-2 text-center text-xs text-green-400">Voting Ends In</p>
                                <div className="grid grid-cols-4 gap-1 text-center">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-white">{timeRemaining.days}</span>
                                        <span className="text-[10px] text-gray-400">Days</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-white">{timeRemaining.hours}</span>
                                        <span className="text-[10px] text-gray-400">Hours</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-white">{timeRemaining.minutes}</span>
                                        <span className="text-[10px] text-gray-400">Mins</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-white">{timeRemaining.seconds}</span>
                                        <span className="text-[10px] text-gray-400">Secs</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 space-y-3">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-green-400" />
                                        <span>Ends</span>
                                    </div>
                                    <span className="font-medium text-white">{formattedEndDate}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Vote className="h-4 w-4 text-green-400" />
                                        <span>Positions</span>
                                    </div>
                                    <span className="font-medium text-white">{positions_count}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-green-400" />
                                        <span>Candidates</span>
                                    </div>
                                    <span className="font-medium text-white">{candidates_count}</span>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-4">
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Position Coverage</span>
                                        <span className="font-medium text-white">
                                            {candidates_count}/{positions_count} candidates
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-500/10">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-700"
                                            initial={{ width: 0 }}
                                            whileInView={{
                                                width: `${progressPercentage}%`,
                                            }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <AnimatedButton
                                        variant="success"
                                        href={route('user.voting-events.show', { id })}
                                        icon={<ArrowRight className="ml-2 h-4 w-4" />}
                                        iconPosition="right"
                                        className="flex-1"
                                    >
                                        Vote Now
                                    </AnimatedButton>
                                    <AnimatedButton variant="outline" href={route('user.voting-events.show', { id })} className="flex-1">
                                        View Results
                                    </AnimatedButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    },
);

ActiveVotingEventCard.displayName = 'ActiveVotingEventCard';

export default ActiveVotingEventCard;
