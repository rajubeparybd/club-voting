import { Award, BookOpen, TrendingUp, Users, Vote } from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsGridProps {
    stats: {
        totalUsers: number;
        totalClubs: number;
        totalVotingEvents: number;
        totalNominations: number;
        activeClubs: number;
        pendingClubs: number;
        activeVotingEvents: number;
        activeNominations: number;
        totalVotes: number;
        totalCandidates: number;
        lastClosedNominationVotes: number;
        lastClosedNominationCandidates: number;
        clubsWithClosedEvents: number;
        lastEventsEngagement: number;
        avgVotesPerClub: number;
        participationRate: number;
    };
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <>
            {/* Top Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    description="Registered users in the system"
                    icon={Users}
                    iconColor="text-blue-500"
                />

                <StatCard
                    title="Total Clubs"
                    value={stats.totalClubs}
                    description={`${stats.activeClubs} Active, ${stats.pendingClubs} Pending`}
                    icon={BookOpen}
                    iconColor="text-purple-500"
                />

                <StatCard
                    title="Active Voting Events"
                    value={stats.activeVotingEvents}
                    description={`Out of ${stats.totalVotingEvents} total events`}
                    icon={Vote}
                    iconColor="text-green-500"
                />

                <StatCard
                    title="Active Nominations"
                    value={stats.activeNominations}
                    description={`Out of ${stats.totalNominations} total nominations`}
                    icon={Award}
                    iconColor="text-amber-500"
                />

                <StatCard
                    title="Last Events Candidates"
                    value={stats.lastClosedNominationCandidates || 0}
                    description={`Candidates from ${stats.clubsWithClosedEvents} clubs' last closed events`}
                    icon={Award}
                    iconColor="text-blue-500"
                />

                <StatCard
                    title="Last Events Votes"
                    value={stats.lastClosedNominationVotes || 0}
                    description={`Total votes from ${stats.clubsWithClosedEvents} clubs' last closed events`}
                    icon={Vote}
                    iconColor="text-orange-500"
                />

                <StatCard
                    title="Last Events Engagement"
                    value={stats.lastEventsEngagement ? `${stats.lastEventsEngagement.toFixed(1)}%` : '0%'}
                    description="Average votes per user in the last events"
                    icon={TrendingUp}
                    iconColor="text-green-500"
                />

                <StatCard
                    title="User Participation"
                    value={stats.participationRate ? `${stats.participationRate.toFixed(1)}%` : '0%'}
                    description="Percentage of users who have cast at least one vote"
                    icon={Users}
                    iconColor="text-indigo-500"
                />

                <StatCard
                    title="Average Votes Per Club"
                    value={stats.avgVotesPerClub ? stats.avgVotesPerClub.toFixed(1) : '0'}
                    description="Average number of votes received by each club"
                    icon={BookOpen}
                    iconColor="text-emerald-500"
                />
            </div>
        </>
    );
}
