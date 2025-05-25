import { motion } from 'framer-motion';
import { ArrowRight, Award, Calendar, Users } from 'lucide-react';
import { memo } from 'react';
import AnimatedButton from './AnimatedButton';

interface Club {
    id: number;
    name: string;
    image?: string;
}

interface ActiveNominationCardProps {
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

const ActiveNominationCard = memo(({ title, description, start_date, end_date, club, formatDate, index }: ActiveNominationCardProps) => {
    const now = new Date();
    const endDate = new Date(end_date);
    const hoursRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 * (index % 3) }}
        >
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#262f43] to-[rgba(239,68,68,0.2)] opacity-90"></div>

                <div className="relative z-10 flex h-full flex-col p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <motion.div
                            className="flex items-center gap-1.5 rounded-full border border-red-500 bg-gradient-to-r from-red-500/30 to-red-400/30 px-3 py-1"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            <span className="text-xs font-medium text-red-400">
                                {hoursRemaining > 0 ? `End In ${hoursRemaining} hours` : 'Ending soon'}
                            </span>
                        </motion.div>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-1 flex-col">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
                                {club.image ? (
                                    <img src={club.image} alt={club.name} width={48} height={48} className="rounded-md" />
                                ) : (
                                    <Award className="h-6 w-6 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="line-clamp-1 text-xl font-bold text-white">{title}</h3>
                                <p className="flex items-center text-sm text-red-300">
                                    <Users className="mr-2 h-4 w-4" />
                                    <p className="line-clamp-1">{club.name}</p>
                                </p>
                            </div>
                        </div>

                        <p className="mb-4 flex-1 text-sm text-slate-400">{description}</p>

                        <div className="mb-6 space-y-3">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-red-400" />
                                    <span>Started</span>
                                </div>
                                <span className="font-medium text-white">{formatDate(start_date)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-red-400" />
                                    <span>Deadline</span>
                                </div>
                                <span className="font-medium text-white">{formatDate(end_date)}</span>
                            </div>
                        </div>

                        <div className="mt-auto flex flex-col gap-4">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Time Remaining</span>
                                    <span className="font-medium text-white">
                                        {hoursRemaining > 24 ? `${Math.floor(hoursRemaining / 24)} days left` : `${hoursRemaining} hours left`}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(239,68,68,0.2)]">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-red-500 to-red-700"
                                        initial={{ width: 0 }}
                                        whileInView={{
                                            width: `${Math.max(10, Math.min(hoursRemaining > 0 ? (hoursRemaining / 168) * 100 : 5, 90))}%`,
                                        }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                            <AnimatedButton
                                href={route('user.nominations.index')}
                                variant="danger"
                                className="w-full"
                                icon={<ArrowRight className="ml-2 h-4 w-4" />}
                            >
                                Apply Now
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

ActiveNominationCard.displayName = 'ActiveNominationCard';

export default ActiveNominationCard;
