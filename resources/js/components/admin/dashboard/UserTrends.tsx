import { LineChart as LineChartIcon } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from './ChartCard';

interface UserTrendsProps {
    userTrends: { month: string; count: number }[];
}

export function UserTrends({ userTrends }: UserTrendsProps) {
    return (
        <ChartCard title="Trends Overview" description="Monthly user growth for the past 6 months" icon={LineChartIcon} iconColor="text-blue-500">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area dataKey="count" name="New Users" fill="#82ca9d" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    );
}
