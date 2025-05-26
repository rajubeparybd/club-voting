import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WelcomeLayout from '@/layouts/welcome-layout';
import { getNoImage } from '@/lib/utils';
import { Club, ClubPosition, Nomination, NominationApplication, NominationWinner, SharedData, VotingEvent } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { LogIn, Trophy, Users, Vote } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface VotingStats {
    totalVotes: number;
    totalEligibleVoters: number;
    uniqueVoters: number;
    votingPercentage: number;
    averageVotesPerVoter: number;
    totalCandidates: number;
    totalPositions: number;
    totalWinners: number;
}

type VotingEventResultsProps = {
    votingEvent: VotingEvent;
    club: Club;
    nomination: Nomination | null;
    positions: ClubPosition[];
    candidates: NominationApplication[];
    candidatesByPosition: Record<number, NominationApplication[]>;
    winners: NominationWinner[];
    userVotes: number[];
    isVotingCompleted: boolean;
    votingStats: VotingStats;
};

export default function VotingEventResults({
    votingEvent,
    club,
    positions,
    candidatesByPosition,
    winners,
    userVotes,
    isVotingCompleted,
    votingStats,
}: VotingEventResultsProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;

    // Create confetti effect
    useEffect(() => {
        const createConfetti = () => {
            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
            const confettiCount = 50;

            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
                document.body.appendChild(confetti);

                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }
        };

        if (winners.length > 0) {
            createConfetti();
        }
    }, [winners.length]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getCandidatesByPosition = (positionId: number) => {
        const positionCandidates = candidatesByPosition[positionId] || [];
        return positionCandidates.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
    };

    const getColorForRank = (index: number) => {
        const colors = ['emerald', 'blue', 'purple', 'amber'];
        return colors[index % colors.length];
    };

    return (
        <WelcomeLayout>
            <Head title={`${votingEvent.title} - Election Results`} />

            <div className="relative min-h-screen overflow-hidden bg-slate-900 pt-20 text-slate-50">
                {/* Enhanced Animations & Confetti Styles */}
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                         .confetti {
                             position: fixed;
                             width: 10px;
                             height: 10px;
                             top: -10px;
                             z-index: 1000;
                             animation: confetti-fall 3s linear forwards;
                         }

                         @keyframes confetti-fall {
                             0% {
                                 transform: translateY(-100vh) rotate(0deg);
                                 opacity: 1;
                             }
                             100% {
                                 transform: translateY(100vh) rotate(720deg);
                                 opacity: 0;
                             }
                         }

                         @keyframes fadeInUp {
                             0% {
                                 opacity: 0;
                                 transform: translateY(30px);
                             }
                             100% {
                                 opacity: 1;
                                 transform: translateY(0);
                             }
                         }

                         @keyframes slideInLeft {
                             0% {
                                 opacity: 0;
                                 transform: translateX(-50px);
                             }
                             100% {
                                 opacity: 1;
                                 transform: translateX(0);
                             }
                         }

                         @keyframes slideInRight {
                             0% {
                                 opacity: 0;
                                 transform: translateX(50px);
                             }
                             100% {
                                 opacity: 1;
                                 transform: translateX(0);
                             }
                         }

                         @keyframes scaleIn {
                             0% {
                                 opacity: 0;
                                 transform: scale(0.9);
                             }
                             100% {
                                 opacity: 1;
                                 transform: scale(1);
                             }
                         }

                         @keyframes pulse-glow {
                             0%, 100% {
                                 box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
                             }
                             50% {
                                 box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
                             }
                         }

                         .animate-fadeInUp {
                             animation: fadeInUp 0.8s ease-out forwards;
                         }

                         .animate-slideInLeft {
                             animation: slideInLeft 0.6s ease-out forwards;
                         }

                         .animate-slideInRight {
                             animation: slideInRight 0.6s ease-out forwards;
                         }

                         .animate-scaleIn {
                             animation: scaleIn 0.5s ease-out forwards;
                         }

                         .animate-pulse-glow {
                             animation: pulse-glow 2s infinite;
                         }

                         .stagger-children > * {
                             opacity: 0;
                             animation: fadeInUp 0.6s ease-out forwards;
                         }

                         .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
                         .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
                         .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
                         .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
                         .stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
                         .stagger-children > *:nth-child(6) { animation-delay: 0.6s; }
                     `,
                    }}
                />

                <main className="px-8 py-12">
                    {/* Page Header */}
                    <div className="animate-fadeInUp mx-auto mb-16 max-w-7xl text-center">
                        <div className="animate-pulse-glow mb-8 inline-flex animate-pulse items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:scale-105">
                            🎉 Results Announced
                        </div>
                        <h1 className="animate-scaleIn mb-6 bg-gradient-to-r from-emerald-400 via-blue-300 to-purple-400 bg-clip-text text-5xl font-black text-transparent md:text-6xl">
                            {votingEvent.title}
                        </h1>
                        <p className="animate-slideInLeft mx-auto max-w-3xl text-xl text-slate-400 opacity-0 [animation-delay:0.3s]">
                            The votes have been counted! Congratulations to all candidates for their outstanding campaigns.
                        </p>
                        <div className="animate-slideInRight mt-6 text-slate-500 opacity-0 [animation-delay:0.5s]">
                            {formatDate(votingEvent.start_date)} - {formatDate(votingEvent.end_date)}
                        </div>
                    </div>

                    {/* Winner Announcement */}
                    {winners.length > 0 ? (
                        <div className="animate-scaleIn mx-auto mb-16 max-w-5xl opacity-0 [animation-delay:0.8s]">
                            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-12 text-center transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20">
                                {/* Background decoration */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5"></div>

                                <div className="relative z-10">
                                    <div className="mb-6 animate-bounce text-6xl">🏆</div>
                                    <h2 className="mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
                                        Congratulations to Our Winners!
                                    </h2>

                                    {/* Display all winners */}
                                    <div className="stagger-children mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {winners
                                            .filter((winner) => winner.nominationApplication?.user)
                                            .map((winner) => (
                                                <div
                                                    key={winner.id}
                                                    className="group flex flex-col items-center transition-all duration-300 hover:scale-105"
                                                >
                                                    <div className="relative mb-4">
                                                        <img
                                                            src={
                                                                winner.nominationApplication?.user?.avatar ||
                                                                getNoImage(150, 150, winner.nominationApplication?.user?.name || 'Winner')
                                                            }
                                                            alt={winner.nominationApplication?.user?.name || 'Winner'}
                                                            className="h-32 w-32 rounded-3xl border-4 border-emerald-400 object-cover shadow-2xl shadow-emerald-500/30 transition-all duration-300 group-hover:border-emerald-300 group-hover:shadow-emerald-400/50"
                                                        />
                                                        <div className="absolute -top-2 -right-2 animate-pulse rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white transition-all duration-300 group-hover:bg-emerald-400">
                                                            WINNER
                                                        </div>
                                                        {winner.is_tie_resolved && (
                                                            <div className="absolute -bottom-2 -left-2 animate-pulse rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white transition-all duration-300 group-hover:bg-amber-400">
                                                                TIE RESOLVED
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-center">
                                                        <h3 className="mb-2 text-xl font-bold text-slate-50 transition-colors duration-300 group-hover:text-emerald-100">
                                                            {winner.nominationApplication?.user?.name || 'Unknown Winner'}
                                                        </h3>
                                                        <p className="mb-2 text-lg font-semibold text-emerald-400 transition-colors duration-300 group-hover:text-emerald-300">
                                                            {winner.clubPosition?.name || 'Position'}
                                                        </p>
                                                        <div className="space-y-1 text-sm text-slate-300">
                                                            {winner.nominationApplication?.user?.student_id && (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <span className="text-emerald-400">🎓</span>
                                                                    <span>ID: {winner.nominationApplication.user.student_id}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-center gap-1">
                                                                <span className="text-emerald-400">🗳️</span>
                                                                <span>{(winner.votes_count || 0).toLocaleString()} votes</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    <div className="rounded-2xl border border-emerald-500/20 bg-slate-800/50 p-6">
                                        <h4 className="mb-4 text-xl font-bold text-slate-200">Congratulations!</h4>
                                        <p className="leading-relaxed text-slate-300 italic">
                                            "Thank you for your trust and support. Together, we will work towards a better future for our club and
                                            create positive change for all members."
                                        </p>
                                    </div>

                                    {winners.some((winner) => winner.is_tie_resolved) && (
                                        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <h5 className="font-semibold text-amber-300">⚖️ Fair Resolution</h5>
                                                <p className="text-sm leading-relaxed text-amber-200/80">
                                                    Some positions had tied votes that were fairly resolved through proper procedures, ensuring a
                                                    democratic outcome.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : isVotingCompleted ? (
                        <div className="mx-auto mb-16 max-w-5xl">
                            <div className="relative overflow-hidden rounded-3xl border border-slate-600/30 bg-slate-800 p-12 text-center">
                                <div className="mb-6 text-6xl opacity-50">🏆</div>
                                <h2 className="mb-4 text-4xl font-black text-slate-400 md:text-5xl">No Winners Announced Yet</h2>
                                <p className="text-slate-500">Winners will be announced once the results are finalized.</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Election Statistics */}
                    <div className="animate-fadeInUp mx-auto mb-16 max-w-7xl opacity-0 [animation-delay:1.2s]">
                        <div className="stagger-children grid gap-8 md:grid-cols-4">
                            <div className="rounded-2xl border border-blue-500/20 bg-slate-800 p-8 text-center transition-all duration-300 hover:scale-105 hover:border-blue-400/40 hover:bg-slate-700/80">
                                <div className="mb-2 text-4xl font-bold text-blue-400 transition-colors duration-300 hover:text-blue-300">
                                    {votingStats.totalVotes.toLocaleString()}
                                </div>
                                <div className="text-slate-400">Total Votes Cast</div>
                            </div>
                            <div className="rounded-2xl border border-emerald-500/20 bg-slate-800 p-8 text-center transition-all duration-300 hover:scale-105 hover:border-emerald-400/40 hover:bg-slate-700/80">
                                <div className="mb-2 text-4xl font-bold text-emerald-400 transition-colors duration-300 hover:text-emerald-300">
                                    {votingStats.votingPercentage}%
                                </div>
                                <div className="text-slate-400">Voter Turnout</div>
                            </div>
                            <div className="rounded-2xl border border-purple-500/20 bg-slate-800 p-8 text-center transition-all duration-300 hover:scale-105 hover:border-purple-400/40 hover:bg-slate-700/80">
                                <div className="mb-2 text-4xl font-bold text-purple-400 transition-colors duration-300 hover:text-purple-300">
                                    {votingStats.totalCandidates}
                                </div>
                                <div className="text-slate-400">Candidates</div>
                            </div>
                            <div className="rounded-2xl border border-amber-500/20 bg-slate-800 p-8 text-center transition-all duration-300 hover:scale-105 hover:border-amber-400/40 hover:bg-slate-700/80">
                                <div className="mb-2 text-4xl font-bold text-amber-400 transition-colors duration-300 hover:text-amber-300">
                                    {votingStats.totalWinners}
                                </div>
                                <div className="text-slate-400">Winners</div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Results by Position */}
                    {Object.keys(candidatesByPosition).length > 0 ? (
                        <div className="mx-auto mb-16 max-w-7xl">
                            <h3 className="mb-8 text-center text-3xl font-bold text-slate-50">Election Results by Position</h3>
                            <div className="grid gap-8 lg:grid-cols-2">
                                {positions.map((position) => {
                                    const positionCandidates = getCandidatesByPosition(position.id);
                                    if (positionCandidates.length === 0) return null;

                                    const totalVotesForPosition = positionCandidates.reduce(
                                        (sum, candidate) => sum + (candidate.votes_count || 0),
                                        0,
                                    );

                                    return (
                                        <div key={position.id} className="rounded-2xl border border-slate-600/30 bg-slate-800 p-8">
                                            <div className="mb-6 flex items-start justify-between">
                                                <h4 className="text-2xl font-bold text-slate-50">{position.name}</h4>
                                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                                    COMPLETED
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                {positionCandidates.map((candidate, index) => {
                                                    const votePercentage =
                                                        totalVotesForPosition > 0
                                                            ? Math.round(((candidate.votes_count || 0) / totalVotesForPosition) * 100)
                                                            : 0;
                                                    const isWinner = candidate.is_winner;
                                                    const isUserVote = userVotes.includes(candidate.id);
                                                    const color = getColorForRank(index);

                                                    return (
                                                        <div key={candidate.id} className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={candidate.user?.avatar || getNoImage(40, 40, candidate.user?.name || '')}
                                                                        alt={candidate.user?.name || ''}
                                                                        className="h-10 w-10 rounded-full border-2 border-slate-600"
                                                                    />
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-semibold text-slate-200">
                                                                                {candidate.user?.name || 'Unknown Candidate'}
                                                                            </span>
                                                                            {isWinner && (
                                                                                <Badge className="rounded-full bg-yellow-500 text-white">
                                                                                    <Trophy className="mr-1 h-3 w-3" />
                                                                                    Winner
                                                                                </Badge>
                                                                            )}
                                                                            {isWinner &&
                                                                                winners.find((w) => w.nomination_application_id === candidate.id)
                                                                                    ?.is_tie_resolved == true && (
                                                                                    <Badge className="rounded-full bg-amber-600 text-xs text-white">
                                                                                        ⚖️ Tie Resolved
                                                                                    </Badge>
                                                                                )}
                                                                            {isUserVote && isAuthenticated && (
                                                                                <Badge className="rounded-full bg-green-600 text-xs text-white">
                                                                                    <Vote className="mr-1 h-3 w-3" />
                                                                                    Your Vote
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {candidate.user?.student_id && (
                                                                            <div className="text-sm text-slate-400">
                                                                                ID: {candidate.user.student_id}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm text-slate-400">
                                                                        {(candidate.votes_count || 0).toLocaleString()} votes ({votePercentage}%)
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="h-3 w-full rounded-full bg-slate-700">
                                                                <div
                                                                    className={`h-3 rounded-full bg-gradient-to-r ${
                                                                        color === 'emerald'
                                                                            ? 'from-emerald-500 to-emerald-600'
                                                                            : color === 'blue'
                                                                              ? 'from-blue-500 to-blue-600'
                                                                              : color === 'purple'
                                                                                ? 'from-purple-500 to-purple-600'
                                                                                : 'from-amber-500 to-amber-600'
                                                                    }`}
                                                                    style={{ width: `${votePercentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto mb-16 max-w-4xl text-center">
                            <div className="rounded-2xl border border-slate-600/30 bg-slate-800 p-12">
                                <Users className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                                <h3 className="mb-4 text-2xl font-bold text-slate-50">No Results Available</h3>
                                <p className="mb-6 text-slate-300">
                                    {isVotingCompleted
                                        ? 'No candidates participated in this election.'
                                        : 'Voting is still in progress. Results will be available after the election ends.'}
                                </p>
                                {!isAuthenticated && (
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                        <Link href={route('login')}>
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Login to View More Details
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Thank You Message */}
                    <div className="mx-auto mt-16 max-w-4xl">
                        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-800/50 to-slate-700/30 p-8 text-center">
                            <h3 className="mb-4 text-2xl font-bold text-slate-50">Thank You for Participating!</h3>
                            <p className="mb-6 leading-relaxed text-slate-300">
                                Democracy thrives when members like you participate in the electoral process. Your voice matters, and together we can
                                continue to build a stronger, more inclusive club community.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    href={route('clubs.show', club.id)}
                                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 font-semibold text-blue-400 transition-all hover:bg-blue-500/20"
                                >
                                    <Trophy className="mr-2 inline h-4 w-4" />
                                    View Club Details
                                </Link>
                                <Link
                                    href={route('home')}
                                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
                                >
                                    Back to Portal
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </WelcomeLayout>
    );
}
