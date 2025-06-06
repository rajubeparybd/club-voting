import { motion } from 'framer-motion';
import { Bell, Calendar, ChartBarDecreasing, Users, Vote } from 'lucide-react';
import { memo, useState } from 'react';
import AnimatedButton from './AnimatedButton';
import SetReminderModal from './SetReminderModal';
import { SimpleClub } from './types';

interface UpcomingVotingEventCardProps {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    club: SimpleClub;
    formatDate: (dateString: string) => string;
    index: number;
    candidate_count?: number;
    candidates_count?: number;
    positions_count?: number;
}

const UpcomingVotingEventCard = memo(
    ({
        id,
        title,
        description,
        start_date,
        end_date,
        club,
        formatDate,
        index,
        candidate_count,
        candidates_count,
        positions_count,
    }: UpcomingVotingEventCardProps) => {
        const now = new Date();
        const startDate = new Date(start_date);
        const daysRemaining = Math.max(0, Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * (index % 3) }}
                >
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#262f43] to-purple-500/30 opacity-90"></div>

                        <div className="relative z-10 flex h-full flex-col p-6">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <motion.div
                                    className="flex items-center gap-1.5 rounded-full border border-purple-500 bg-gradient-to-r from-purple-500/30 to-purple-400/30 px-3 py-1"
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                    <span className="text-xs font-medium text-purple-400">
                                        {daysRemaining > 0 ? `In ${daysRemaining} days` : 'Starting soon'}
                                    </span>
                                </motion.div>
                            </div>

                            {/* Main content */}
                            <div className="flex flex-1 flex-col">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg">
                                        {club.image ? (
                                            <img src={club.image} alt={club.name} width={48} height={48} className="rounded-md" />
                                        ) : (
                                            <Vote className="h-6 w-6 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="line-clamp-1 text-xl font-bold text-white">{title}</h3>
                                        <p className="flex items-center text-sm text-purple-300">
                                            <Users className="mr-2 h-4 w-4" />
                                            <p className="line-clamp-1">{club.name}</p>
                                        </p>
                                    </div>
                                </div>

                                <p className="mb-4 flex-1 text-sm text-slate-400">{description}</p>

                                <div className="mb-6 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-purple-400" />
                                            <span>Starts</span>
                                        </div>
                                        <span className="font-medium text-white">{formatDate(start_date)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-purple-400" />
                                            <span>Ends</span>
                                        </div>
                                        <span className="font-medium text-white">{formatDate(end_date)}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <ChartBarDecreasing className="h-4 w-4 text-purple-400" />
                                            <span>Total Positions</span>
                                        </div>
                                        <span className="font-medium text-white">{positions_count ?? club.positions?.length ?? 0}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-purple-400" />
                                            <span>Total Candidates</span>
                                        </div>
                                        <span className="font-medium text-white">{candidates_count ?? candidate_count ?? 0}</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex flex-col gap-4">
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-xs">
                                            <span className="text-gray-400">Preparation Status</span>
                                            <span className="font-medium text-white">
                                                {candidates_count ?? candidate_count ?? 0}/{positions_count ?? club.positions?.length ?? 0} candidates
                                                ready
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(245,158,11,0.2)]">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-purple-700"
                                                initial={{ width: 0 }}
                                                whileInView={{
                                                    width:
                                                        (positions_count ?? club.positions?.length ?? 0) > 0
                                                            ? `${Math.min(((candidates_count ?? candidate_count ?? 0) / (positions_count ?? club.positions?.length ?? 0)) * 100, 100)}%`
                                                            : '0%',
                                                }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <AnimatedButton
                                            variant="warningLight"
                                            // href={route('user.voting-events.show', { id })}
                                            icon={<Bell className="ml-2 h-4 w-4" />}
                                            iconPosition="right"
                                            className="flex-1"
                                            onClick={() => setIsReminderModalOpen(true)}
                                        >
                                            Set Reminder
                                        </AnimatedButton>
                                        <AnimatedButton variant="outline" href={route('user.voting-events.show', { id })} className="flex-1">
                                            View Details
                                        </AnimatedButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <SetReminderModal
                    isOpen={isReminderModalOpen}
                    onOpenChange={setIsReminderModalOpen}
                    itemType="voting-event"
                    itemId={id}
                    itemTitle={title}
                />
            </>
        );
    },
);

UpcomingVotingEventCard.displayName = 'UpcomingVotingEventCard';

export default UpcomingVotingEventCard;
