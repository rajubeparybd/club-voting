import { Vote } from 'lucide-react';
import { PieChartCard } from './PieChartCard';

interface EventStatusChartProps {
    activeVotingEvents: number;
    totalVotingEvents: number;
}

export function EventStatusChart({ activeVotingEvents, totalVotingEvents }: EventStatusChartProps) {
    // Data for event status (mock data for the completed events - replace with actual data if available)
    const eventStatusData = [
        { name: 'Active', value: activeVotingEvents },
        { name: 'Completed', value: Math.round(totalVotingEvents * 0.3) },
        { name: 'Upcoming', value: totalVotingEvents - activeVotingEvents - Math.round(totalVotingEvents * 0.3) },
    ];

    return (
        <PieChartCard
            title="Voting Events Status"
            description="Active vs Completed vs Upcoming Events"
            data={eventStatusData}
            icon={Vote}
            iconColor="text-green-500"
        />
    );
}
