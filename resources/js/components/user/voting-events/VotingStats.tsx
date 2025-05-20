import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart2 } from 'lucide-react';

interface VotingStatsProps {
    totalVotes: number;
    totalEligibleVoters: number;
    votingPercentage: number;
}

export function VotingStats({ totalVotes, totalEligibleVoters, votingPercentage }: VotingStatsProps) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <BarChart2 className="h-5 w-5 text-blue-500" />
                    Election Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Voter Participation</span>
                        <span className="font-medium">
                            {totalVotes} / {totalEligibleVoters}
                        </span>
                    </div>
                    <Progress value={votingPercentage} className="h-2.5 bg-gray-100 dark:bg-gray-800 [&>div]:bg-blue-500" />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{votingPercentage}% of eligible voters</span>
                        <span>{totalEligibleVoters - totalVotes} members haven't voted</span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-gray-50 p-3 text-center dark:bg-gray-900">
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalVotes}</p>
                            <p className="text-xs text-gray-500">Total Votes</p>
                        </div>
                        <div className="rounded-lg border bg-gray-50 p-3 text-center dark:bg-gray-900">
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalEligibleVoters}</p>
                            <p className="text-xs text-gray-500">Eligible Voters</p>
                        </div>
                        <div className="rounded-lg border bg-gray-50 p-3 text-center dark:bg-gray-900">
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{votingPercentage}%</p>
                            <p className="text-xs text-gray-500">Participation</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
