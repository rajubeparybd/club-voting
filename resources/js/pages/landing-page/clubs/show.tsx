import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JoinClubButton from '@/components/user/JoinClubButton';
import AnimatedButton from '@/components/welcome/AnimatedButton';
import SectionHeading from '@/components/welcome/SectionHeading';
import WelcomeLayout from '@/layouts/welcome-layout';
import { getNoImage } from '@/lib/utils';
import { Club, PaymentMethod, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Award, Calendar, Clock, Crown, Eye, LogIn, Sparkles, Trophy, Users, Vote } from 'lucide-react';
import { route } from 'ziggy-js';

interface ManualPosition {
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        student_id: string;
        department_id: string;
        department?: {
            id: number;
            name: string;
        };
    };
    position: {
        id: number;
        name: string;
        description?: string;
        is_active: boolean;
    };
    joined_at: string;
    status: string;
}

interface Position {
    id: number;
    name: string;
    is_active: boolean;
    current_holder?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        student_id: string;
        department_id: string;
    };
    votes_count?: number;
    is_tie_resolved?: boolean;
}

interface NominationApplication {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        student_id: string;
        department_id: string;
    };
    club_position: {
        id: number;
        name: string;
    };
    status: string;
}

interface NominationWinner {
    id: number;
    nominationApplication?: NominationApplication;
    club_position: {
        id: number;
        name: string;
    };
    votes_count: number;
}

interface Nomination {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    applications: NominationApplication[];
}

interface VotingEvent {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    winners: NominationWinner[];
}

type ClubShowProps = {
    club: Club;
    manualPositions: ManualPosition[];
    positionsWithHolders: Position[];
    previousNominations: Nomination[];
    currentNomination: Nomination | null;
    previousVotingEvents: VotingEvent[];
    currentVotingEvent: VotingEvent | null;
    isMember: boolean;
    membershipStatus: string | null;
    paymentMethods: PaymentMethod[];
};

export default function ClubShow({
    club,
    positionsWithHolders,
    manualPositions,
    previousNominations,
    currentNomination,
    previousVotingEvents,
    currentVotingEvent,
    isMember,
    membershipStatus,
    paymentMethods,
}: ClubShowProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    // Log manual positions for debugging
    // console.log('Manual Positions:', manualPositions);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    };

    const staggerChildren = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    return (
        <WelcomeLayout>
            <Head title={`${club.name} - Club Details`} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 text-slate-50">
                <main className="px-8 py-12">
                    {/* Club Header */}
                    <motion.div
                        className="mx-auto mb-16 max-w-7xl"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-12 backdrop-blur-sm">
                            {/* Background decoration */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-emerald-500/5"></div>

                            <div className="relative z-10 flex flex-col gap-8 lg:flex-row">
                                <motion.div
                                    className="relative h-80 w-full overflow-hidden rounded-2xl lg:w-96"
                                    initial="hidden"
                                    animate="visible"
                                    variants={scaleIn}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                >
                                    <motion.img
                                        src={club.image || getNoImage(400, 320, club.name)}
                                        alt={club.name}
                                        className="h-full w-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                                </motion.div>

                                <motion.div
                                    className="flex-1"
                                    initial="hidden"
                                    animate="visible"
                                    variants={slideInRight}
                                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                                >
                                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <h1 className="mb-4 bg-gradient-to-r from-blue-400 via-emerald-300 to-purple-400 bg-clip-text text-5xl font-black text-transparent">
                                                    {club.name}
                                                </h1>
                                                <div className="flex flex-col gap-4">
                                                    {!isAuthenticated ? (
                                                        <AnimatedButton href={route('login')} variant="primary">
                                                            Login to Join
                                                        </AnimatedButton>
                                                    ) : isMember ? (
                                                        <Badge
                                                            variant={membershipStatus === 'active' ? 'default' : 'outline'}
                                                            className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-lg"
                                                        >
                                                            {membershipStatus === 'active' ? 'Active Member' : `Member (${membershipStatus})`}
                                                        </Badge>
                                                    ) : (
                                                        <JoinClubButton
                                                            club={club}
                                                            userId={auth?.user?.id.toString()}
                                                            paymentMethods={paymentMethods}
                                                            isMember={isMember}
                                                            memberStatus={membershipStatus || undefined}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="mb-6 text-xl leading-relaxed text-slate-300">{club.description}</p>

                                            <div className="flex flex-wrap gap-8 text-slate-300">
                                                <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 transition-all duration-300 hover:scale-105 hover:border-blue-500">
                                                    <Users className="h-6 w-6 text-blue-400" />
                                                    <span className="text-lg font-semibold">{club.members_count} Members</span>
                                                </div>
                                                <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 transition-all duration-300 hover:scale-105 hover:border-emerald-500">
                                                    <Award className="h-6 w-6 text-emerald-400" />
                                                    <span className="text-lg font-semibold">{positionsWithHolders.length} Positions</span>
                                                </div>
                                                <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 transition-all duration-300 hover:scale-105 hover:border-purple-500">
                                                    <Sparkles className="h-6 w-6 text-purple-400" />
                                                    <span className="text-lg font-semibold">Join Fee: {club.join_fee}৳</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Club Positions */}
                    <motion.div
                        className="mx-auto mb-16 max-w-7xl"
                        initial="hidden"
                        animate="visible"
                        variants={slideInLeft}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
                    >
                        <motion.div
                            className="mb-8 text-center"
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <SectionHeading variant="warning" title="Leadership Team" description="Meet the current position holders" />
                        </motion.div>

                        {positionsWithHolders.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                                initial="hidden"
                                animate="visible"
                                variants={staggerChildren}
                                transition={{ delay: 1 }}
                            >
                                {positionsWithHolders.map((position) => (
                                    <div
                                        key={position.id}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-yellow-500"
                                    >
                                        <div className="absolute top-4 right-4">
                                            <Crown className="h-6 w-6 text-yellow-400 transition-transform duration-300 group-hover:scale-125" />
                                        </div>

                                        <h3 className="mb-4 flex gap-2 text-xl font-bold text-yellow-400">
                                            {position.name}
                                            {position.is_tie_resolved == true && (
                                                <Badge className="rounded-full bg-amber-600 text-xs text-white">⚖️ Tie Resolved</Badge>
                                            )}
                                        </h3>

                                        {position.current_holder ? (
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={position.current_holder.avatar || getNoImage(60, 60, position.current_holder.name)}
                                                    alt={position.current_holder.name}
                                                    className="h-15 w-15 rounded-full border-3 border-yellow-400 shadow-lg transition-transform duration-300 group-hover:scale-110"
                                                />
                                                <div>
                                                    <p className="text-lg font-semibold text-slate-50">{position.current_holder.name}</p>
                                                    <p className="text-sm text-slate-400">
                                                        ID: {position.current_holder.student_id} | Department: {position.current_holder.department_id}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-400">No Current Holder</p>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="rounded-2xl border border-slate-600/30 bg-slate-800/50 p-12 text-center">
                                <Crown className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                                <p className="text-xl text-slate-400">No positions available</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Manual Positions Section */}
                    {manualPositions.length > 0 && (
                        <motion.div
                            className="mx-auto mb-16 max-w-7xl"
                            initial="hidden"
                            animate="visible"
                            variants={slideInLeft}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.9 }}
                        >
                            <motion.div
                                className="mb-8 text-center"
                                initial="hidden"
                                animate="visible"
                                variants={fadeInUp}
                                transition={{ duration: 0.5, delay: 1.1 }}
                            >
                                <SectionHeading
                                    variant="success"
                                    title="Manual Positions"
                                    description="Members with specific assigned roles without any voting or nomination"
                                />
                            </motion.div>

                            <motion.div
                                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                                initial="hidden"
                                animate="visible"
                                variants={staggerChildren}
                                transition={{ delay: 1.3 }}
                            >
                                {manualPositions.map((manualPosition) => (
                                    <div
                                        key={`${manualPosition.user.id}-${manualPosition.position.id}`}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-emerald-500"
                                    >
                                        <div className="absolute top-4 right-4">
                                            <Award className="h-6 w-6 text-emerald-400 transition-transform duration-300 group-hover:scale-125" />
                                        </div>

                                        <h3 className="mb-4 text-xl font-bold text-emerald-400">{manualPosition.position.name}</h3>

                                        <div className="flex items-center gap-4">
                                            <img
                                                src={manualPosition.user.avatar || getNoImage(60, 60, manualPosition.user.name)}
                                                alt={manualPosition.user.name}
                                                className="h-15 w-15 rounded-full border-3 border-emerald-400 shadow-lg transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div>
                                                <p className="text-lg font-semibold text-slate-50">{manualPosition.user.name}</p>
                                                <p className="text-sm text-slate-400">
                                                    ID: {manualPosition.user.student_id || 'N/A'}
                                                    {manualPosition.user.department && <> | Department: {manualPosition.user.department.name}</>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Activities Section */}
                    <motion.div
                        className="mx-auto max-w-7xl"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 1 }}
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm">
                            {/* Background decoration */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5"></div>

                            <div className="relative z-10 p-8">
                                <div className="mb-8 text-center">
                                    <h2 className="mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-4xl font-black text-transparent">
                                        Club Activities
                                    </h2>
                                </div>

                                <Tabs defaultValue="nominations" className="w-full">
                                    <div className="mb-8 flex justify-center">
                                        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 rounded-full bg-slate-800/50">
                                            <TabsTrigger
                                                value="nominations"
                                                className="rounded-full py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-emerald-400 data-[state=active]:text-white"
                                            >
                                                <Award className="h-6 w-6" />
                                                Nominations
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="voting"
                                                className="rounded-full py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-blue-400 data-[state=active]:text-white"
                                            >
                                                <Clock className="h-6 w-6" />
                                                Voting Events
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="nominations" className="space-y-8">
                                        {/* Current Nomination */}
                                        {currentNomination && (
                                            <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-8">
                                                <div className="mb-6 flex items-center gap-3">
                                                    <div className="rounded-full bg-emerald-500 p-2">
                                                        <Clock className="h-6 w-6 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-emerald-400">Current Nomination</h3>
                                                </div>
                                                <StatusBadge status={currentNomination.status} className="absolute top-3 right-3 px-3 py-1" />

                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="mb-2 text-xl font-bold text-slate-50">{currentNomination.title}</h4>
                                                        <p className="mb-4 text-slate-300">{currentNomination.description}</p>
                                                        <div className="flex items-center gap-6 text-sm text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-5 w-5" />
                                                                <span>
                                                                    {formatDate(currentNomination.start_date)} -{' '}
                                                                    {formatDate(currentNomination.end_date)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {currentNomination.applications.length > 0 && (
                                                        <div>
                                                            <h5 className="mb-4 text-lg font-semibold text-slate-50">
                                                                Approved Candidates ({currentNomination.applications.length})
                                                            </h5>
                                                            <motion.div
                                                                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                                                                initial="hidden"
                                                                animate="visible"
                                                                variants={staggerChildren}
                                                            >
                                                                {currentNomination.applications.map((application) => (
                                                                    <div
                                                                        key={application.id}
                                                                        className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-600/30 bg-slate-800/50 p-4 transition-all duration-300 hover:scale-105 hover:border-emerald-400"
                                                                    >
                                                                        <img
                                                                            src={application.user.avatar || getNoImage(48, 48, application.user.name)}
                                                                            alt={application.user.name}
                                                                            className="h-12 w-12 rounded-full border-2 border-emerald-400"
                                                                        />
                                                                        <div>
                                                                            <p className="font-semibold text-slate-50">{application.user.name}</p>
                                                                            <p className="text-sm text-slate-400">
                                                                                ID: {application.user.student_id} | Department:{' '}
                                                                                {application.user.department_id}
                                                                            </p>
                                                                            <p className="text-sm text-emerald-400">
                                                                                Position: {application.club_position.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous Nominations */}
                                        <div>
                                            <div className="mb-6 flex items-center gap-3">
                                                <div className="rounded-full bg-blue-500 p-2">
                                                    <Trophy className="h-6 w-6 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-blue-400">Previous Nominations</h3>
                                            </div>

                                            {previousNominations.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {previousNominations.map((nomination) => (
                                                        <div
                                                            key={nomination.id}
                                                            className="relative cursor-pointer rounded-xl border border-slate-600/30 bg-slate-800/30 p-6 transition-all duration-300 hover:scale-102 hover:border-emerald-400"
                                                        >
                                                            <h4 className="mb-2 text-lg font-bold text-slate-50">{nomination.title}</h4>
                                                            <p className="mb-3 text-slate-300">{nomination.description}</p>
                                                            <div className="flex items-center gap-1 text-sm text-slate-400">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>
                                                                    {formatDate(nomination.start_date)} - {formatDate(nomination.end_date)}
                                                                </span>
                                                            </div>
                                                            <StatusBadge status={nomination.status} className="absolute top-3 right-3 px-3 py-1" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-slate-600/30 bg-slate-800/30 p-8 text-center">
                                                    <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                                                    <p className="text-lg text-slate-400">No previous nominations</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="voting" className="space-y-8">
                                        {/* Current Voting Event */}
                                        {currentVotingEvent && (
                                            <div className="relative rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8">
                                                <div className="relative mb-4 flex items-center gap-3">
                                                    <div className="rounded-full bg-blue-500 p-2">
                                                        <Clock className="h-6 w-6 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-blue-400">Active Voting Event</h3>
                                                </div>
                                                <StatusBadge status={currentVotingEvent.status} className="absolute top-3 right-3 px-3" />

                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="mb-2 text-xl font-bold text-slate-50">{currentVotingEvent.title}</h4>
                                                        <p className="mb-4 text-slate-300">{currentVotingEvent.description}</p>
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <Calendar className="h-5 w-5" />
                                                            <span>
                                                                {formatDate(currentVotingEvent.start_date)} -{' '}
                                                                {formatDate(currentVotingEvent.end_date)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4">
                                                        {isAuthenticated && isMember && membershipStatus === 'active' && (
                                                            <AnimatedButton
                                                                href={route('user.voting-events.show', { votingEvent: currentVotingEvent.id })}
                                                                icon={<Vote className="ml-2 h-5 w-5" />}
                                                            >
                                                                Vote Now
                                                            </AnimatedButton>
                                                        )}
                                                        {!isAuthenticated && (
                                                            <AnimatedButton href={route('login')} icon={<LogIn className="ml-2 h-5 w-5" />}>
                                                                Login to Vote
                                                            </AnimatedButton>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Previous Voting Events */}
                                        <div>
                                            <div className="mb-6 flex items-center gap-3">
                                                <div className="rounded-full bg-purple-500 p-2">
                                                    <Trophy className="h-6 w-6 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-purple-400">Previous Elections</h3>
                                            </div>

                                            {previousVotingEvents.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {previousVotingEvents.map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className="relative rounded-xl border border-slate-600/30 bg-slate-800/30 p-6 transition-all duration-300 hover:scale-102 hover:border-purple-400"
                                                        >
                                                            <div className="mb-4">
                                                                <h4 className="mb-2 text-lg font-bold text-slate-50">{event.title}</h4>
                                                                <p className="mb-3 text-slate-300">{event.description}</p>
                                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-4 w-4" />
                                                                        <span>
                                                                            {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <StatusBadge status={event.status} className="absolute top-3 right-3 px-3" />

                                                            <AnimatedButton
                                                                variant="warningLight"
                                                                icon={<Eye className="ml-2 h-4 w-4" />}
                                                                href={route('clubs.events.results', { club: club.id, votingEvent: event.id })}
                                                            >
                                                                View Results
                                                            </AnimatedButton>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-slate-600/30 bg-slate-800/30 p-8 text-center">
                                                    <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                                                    <p className="text-lg text-slate-400">No previous voting events</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </WelcomeLayout>
    );
}
