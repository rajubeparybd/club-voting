import { Vote } from 'lucide-react';
import { PieChartCard } from './PieChartCard';

interface EventStatusData {
    name: string;
    value: number;
}

interface EventStatusChartProps {
    activeVotingEvents: number;
    totalVotingEvents: number;
}

export function EventStatusChart({ activeVotingEvents, totalVotingEvents }: EventStatusChartProps) {
    // Transform voting events data into pie chart data
    const completedEvents = Math.max(0, totalVotingEvents - activeVotingEvents);

    const eventStatusData: EventStatusData[] =
        totalVotingEvents > 0
            ? [
                  { name: 'Active Events', value: activeVotingEvents },
                  { name: 'Completed Events', value: completedEvents },
              ].filter((item) => item.value > 0)
            : [{ name: 'No Events', value: 1 }];

    return (
        <PieChartCard
            title="Voting Events Status"
            description={`${activeVotingEvents} active of ${totalVotingEvents} total`}
            data={eventStatusData}
            icon={Vote}
            iconColor="text-green-500"
        />
    );
}
