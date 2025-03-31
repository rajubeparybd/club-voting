import { Users } from 'lucide-react';
import { PieChartCard } from './PieChartCard';

interface UserRolesChartProps {
    totalUsers: number;
}

export function UserRolesChart({ totalUsers }: UserRolesChartProps) {
    // Data for user roles distribution (mock data - replace with actual data if available)
    const userRolesData = [
        { name: 'Admins', value: Math.round(totalUsers * 0.05) }, // 5% of users are admins (example)
        { name: 'Club Admins', value: Math.round(totalUsers * 0.15) }, // 15% are club admins
        { name: 'Regular Users', value: totalUsers - Math.round(totalUsers * 0.2) }, // Rest are regular users
    ];

    return (
        <PieChartCard
            title="User Roles Distribution"
            description="Breakdown of user roles in the system"
            data={userRolesData}
            icon={Users}
            iconColor="text-blue-500"
        />
    );
}
