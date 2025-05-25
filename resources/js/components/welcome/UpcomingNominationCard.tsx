import { motion } from 'framer-motion';
import { Award, Bell, Calendar, Users } from 'lucide-react';
import { memo } from 'react';
import AnimatedButton from './AnimatedButton';

interface Club {
    id: number;
    name: string;
    image?: string;
}

interface UpcomingNominationCardProps {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    club: Club;
    formatDate: (dateString: string) => string;
    index: number;
}

const UpcomingNominationCard = memo(({ title, description, start_date, end_date, club, formatDate, index }: UpcomingNominationCardProps) => {
    const now = new Date();
    const startDate = new Date(start_date);
    const daysRemaining = Math.max(0, Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 * (index % 3) }}
        >
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#262f43] to-[rgba(245,158,11,0.2)] opacity-90"></div>

                <div className="relative z-10 flex h-full flex-col p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <motion.div
                            className="flex items-center gap-1.5 rounded-full border border-amber-500 bg-gradient-to-r from-amber-500/30 to-amber-400/30 px-3 py-1"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                            <span className="text-xs font-medium text-amber-400">
                                {daysRemaining > 0 ? `In ${daysRemaining} days` : 'Starting soon'}
                            </span>
                        </motion.div>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-1 flex-col">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg">
                                {club.image ? (
                                    <img src={club.image} alt={club.name} width={48} height={48} className="rounded-md" />
                                ) : (
                                    <Award className="h-6 w-6 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="line-clamp-1 text-xl font-bold text-white">{title}</h3>
                                <p className="flex items-center text-sm text-amber-300">
                                    <Users className="mr-2 h-4 w-4" />
                                    <p className="line-clamp-1">{club.name}</p>
                                </p>
                            </div>
                        </div>

                        <p className="mb-4 flex-1 text-sm text-slate-400">{description}</p>

                        <div className="mb-6 space-y-3">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-amber-400" />
                                    <span>Starts</span>
                                </div>
                                <span className="font-medium text-white">{formatDate(start_date)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-amber-400" />
                                    <span>Ends</span>
                                </div>
                                <span className="font-medium text-white">{formatDate(end_date)}</span>
                            </div>
                        </div>

                        <div className="mt-auto flex flex-col gap-4">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Nomination Period</span>
                                    <span className="font-medium text-white">
                                        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Starting soon'}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(245,158,11,0.2)]">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-amber-500 to-amber-700"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.max(10, Math.min(100 - daysRemaining * 2, 90))}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <AnimatedButton
                                    variant="warning"
                                    href={route('user.nominations.index')}
                                    icon={<Bell className="ml-2 h-4 w-4" />}
                                    iconPosition="right"
                                    className="flex-1"
                                >
                                    Set Reminder
                                </AnimatedButton>
                                <AnimatedButton variant="outline" href={route('user.nominations.index')} className="flex-1">
                                    View Details
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

UpcomingNominationCard.displayName = 'UpcomingNominationCard';

export default UpcomingNominationCard;
