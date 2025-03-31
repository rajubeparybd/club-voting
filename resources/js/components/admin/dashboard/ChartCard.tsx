import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ChartCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string;
    children: ReactNode;
    className?: string;
}

export function ChartCard({ title, description, icon: Icon, iconColor = 'text-blue-500', children, className = 'lg:col-span-4' }: ChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                    <CardTitle>{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
