import { formatDistance } from 'date-fns';
import { Activity, BookOpen, Clock, Users, Vote } from 'lucide-react';
import { ChartCard } from './ChartCard';

interface ActivityCauser {
    id: number;
    name: string;
    avatar: string | null;
}

interface ActivityItem {
    description: string;
    event: string;
    causer: ActivityCauser | null;
    created_at: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    // Function to get icons for different activity events
    const getActivityIcon = (event: string) => {
        switch (event) {
            case 'login':
                return <Activity className="h-4 w-4 text-blue-500" />;
            case 'role':
                return <Users className="h-4 w-4 text-green-500" />;
            case 'club':
                return <BookOpen className="h-4 w-4 text-purple-500" />;
            case 'vote':
                return <Vote className="h-4 w-4 text-orange-500" />;
            default:
                return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <ChartCard title="Recent Activity" description="Latest actions across the platform" icon={Activity} iconColor="text-blue-500">
            <div className="space-y-2">
                {activities.map((activity, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-md border p-4">
                        <div className="mt-1">{getActivityIcon(activity.event)}</div>
                        <div className="flex-1 space-y-1">
                            <div>
                                <p className="mb-1">{activity.description}</p>
                                <div className="flex items-center justify-between">
                                    {activity.causer && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs">by {activity.causer.name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-muted-foreground h-3 w-3" />
                                        <p className="text-muted-foreground text-xs">
                                            {formatDistance(new Date(activity.created_at), new Date(), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ChartCard>
    );
}
