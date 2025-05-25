import { memo } from 'react';
import ActiveNominationCard from './ActiveNominationCard';
import SectionHeading from './SectionHeading';

interface Club {
    id: number;
    name: string;
}

interface Nomination {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    club: Club;
}

interface ActiveNominationsSectionProps {
    activeNominations: Nomination[];
    formatDate: (dateString: string) => string;
}

const ActiveNominationsSection = memo(({ activeNominations, formatDate }: ActiveNominationsSectionProps) => {
    return (
        <section className="px-6 py-24 md:px-8">
            <div className="container mx-auto">
                <SectionHeading variant="error" title="Active Nominations" description="Apply now for open positions in your clubs" />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {activeNominations.length > 0 ? (
                        activeNominations.map((nomination, index) => (
                            <ActiveNominationCard
                                key={nomination.id}
                                id={nomination.id}
                                title={nomination.title}
                                description={nomination.description}
                                start_date={nomination.start_date}
                                end_date={nomination.end_date}
                                status={nomination.status}
                                club={nomination.club}
                                formatDate={formatDate}
                                index={index}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] py-12">
                            <p className="text-gray-400">No active nominations at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});

ActiveNominationsSection.displayName = 'ActiveNominationsSection';

export default ActiveNominationsSection;
