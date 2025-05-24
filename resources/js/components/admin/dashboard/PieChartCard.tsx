import { LucideIcon } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';

// Standard colors for all pie charts
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface PieChartData {
    name: string;
    value: number;
}

interface PieChartCardProps {
    title: string;
    description: string;
    data: PieChartData[];
    icon: LucideIcon;
    iconColor?: string;
}

export function PieChartCard({ title, description, data, icon, iconColor }: PieChartCardProps) {
    // Defensive programming: handle undefined/null data
    const chartData = data && Array.isArray(data) ? data : [];
    const hasData = chartData.length > 0 && chartData.some((item) => item.value > 0);

    return (
        <ChartCard title={title} description={description} icon={icon} iconColor={iconColor}>
            <div className="h-[300px] w-full">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="text-sm">No data available</p>
                            <p className="text-xs text-gray-400">Chart will appear when data is loaded</p>
                        </div>
                    </div>
                )}
            </div>
        </ChartCard>
    );
}
