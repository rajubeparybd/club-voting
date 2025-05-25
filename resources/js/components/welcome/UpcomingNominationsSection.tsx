import { memo } from 'react';
import SectionHeading from './SectionHeading';
import UpcomingNominationCard from './UpcomingNominationCard';
import { Nomination } from './types';

interface UpcomingNominationsSectionProps {
    upcomingNominations: Nomination[];
    formatDate: (dateString: string) => string;
}

const UpcomingNominationsSection = memo(({ upcomingNominations, formatDate }: UpcomingNominationsSectionProps) => {
    return (
        <section id="nominations" className="bg-[rgba(30,41,59,0.3)] px-6 py-24 md:px-8">
            <div className="container mx-auto">
                <SectionHeading
                    variant="warning"
                    title="Upcoming Nominations"
                    description="Get ready for upcoming nomination periods across all clubs"
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingNominations.length > 0 ? (
                        upcomingNominations.map((nomination, index) => (
                            <UpcomingNominationCard
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
                            <p className="text-gray-400">No upcoming nominations at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});

UpcomingNominationsSection.displayName = 'UpcomingNominationsSection';

export default UpcomingNominationsSection;
