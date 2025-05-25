import { memo } from 'react';
import SectionHeading from './SectionHeading';
import UpcomingVotingEventCard from './UpcomingVotingEventCard';
import { Club } from './types';

interface VotingEvent {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    club: Club;
    candidate_count?: number;
}

interface UpcomingVotingEventsSectionProps {
    upcomingVotingEvents: VotingEvent[];
    formatDate: (dateString: string) => string;
}

const UpcomingVotingEventsSection = memo(({ upcomingVotingEvents, formatDate }: UpcomingVotingEventsSectionProps) => {
    return (
        <section id="voting" className="bg-[rgba(30,41,59,0.3)] px-6 py-24 md:px-8">
            <div className="container mx-auto">
                <SectionHeading variant="purple" title="Upcoming Voting Events" description="Prepare for upcoming elections and voting events" />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingVotingEvents.length > 0 ? (
                        upcomingVotingEvents.map((event, index) => (
                            <UpcomingVotingEventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                description={event.description}
                                start_date={event.start_date}
                                end_date={event.end_date}
                                status={event.status}
                                candidate_count={event.candidate_count}
                                club={event.club}
                                formatDate={formatDate}
                                index={index}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] py-12">
                            <p className="text-gray-400">No upcoming voting events at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});

UpcomingVotingEventsSection.displayName = 'UpcomingVotingEventsSection';

export default UpcomingVotingEventsSection;
