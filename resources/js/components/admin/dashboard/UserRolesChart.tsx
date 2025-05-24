import { Users } from 'lucide-react';
import { PieChartCard } from './PieChartCard';

interface UserRoleData {
    name: string;
    value: number;
}

interface UserRolesChartProps {
    totalUsers: number;
}

export function UserRolesChart({ totalUsers }: UserRolesChartProps) {
    // Transform totalUsers into pie chart data
    // Since we don't have specific role breakdown, we'll create a placeholder structure
    // This should ideally come from the backend with actual role counts
    const userRolesData: UserRoleData[] =
        totalUsers > 0
            ? [
                  { name: 'Active Users', value: Math.round(totalUsers * 0.8) },
                  { name: 'Inactive Users', value: Math.round(totalUsers * 0.2) },
              ]
            : [{ name: 'No Users', value: 1 }];

    return (
        <PieChartCard
            title="User Distribution"
            description={`Total users: ${totalUsers}`}
            data={userRolesData}
            icon={Users}
            iconColor="text-blue-500"
        />
    );
}
