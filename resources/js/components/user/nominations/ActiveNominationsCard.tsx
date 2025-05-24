import { Card } from '@/components/ui/card';
import type { Nomination, NominationApplication } from '@/types';
import { CalendarClock, Info } from 'lucide-react';
import React from 'react';
import NominationCard from './NominationCard';

interface ActiveNominationsCardProps {
    nominations: Nomination[];
    applications: NominationApplication[];
}

const ActiveNominationsCard: React.FC<ActiveNominationsCardProps> = ({ nominations, applications }) => {
    return (
        <Card className="w-full rounded-2xl bg-gray-100 p-4 lg:p-6 dark:bg-[#191B22]">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Active Nominations</h2>
                {nominations.length > 0 && (
                    <div className="flex items-center text-sm text-red-500">
                        <Info className="mr-2 h-4 w-4" />
                        <span>Apply before nominations end</span>
                    </div>
                )}
            </div>

            {nominations.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <div className="mb-3 flex justify-center">
                        <CalendarClock className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-lg font-medium">No Active Nominations</h3>
                    <p className="text-gray-500 dark:text-gray-400">There are no active nominations for clubs where you are a member.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {nominations.map((nomination) => (
                        <NominationCard key={nomination.id} nomination={nomination} applications={applications} />
                    ))}
                </div>
            )}
        </Card>
    );
};

export default React.memo(ActiveNominationsCard);
