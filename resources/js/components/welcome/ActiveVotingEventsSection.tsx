import { memo } from 'react';
import ActiveVotingEventCard from './ActiveVotingEventCard';
import SectionHeading from './SectionHeading';
import { VotingEvent } from './types';

interface ActiveVotingEventsSectionProps {
    activeVotingEvents: VotingEvent[];
}

const ActiveVotingEventsSection = memo(({ activeVotingEvents }: ActiveVotingEventsSectionProps) => {
    return (
        <section className="px-6 py-24 md:px-8">
            <div className="container mx-auto">
                <SectionHeading
                    title="Active Voting Events"
                    description="Cast your vote in ongoing elections - your voice matters"
                    variant="success"
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {activeVotingEvents.length > 0 ? (
                        activeVotingEvents.map((event, index) => (
                            <ActiveVotingEventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                description={event.description}
                                start_date={event.start_date}
                                end_date={event.end_date}
                                status={event.status}
                                club={event.club}
                                index={index}
                                positions_count={event.positions_count}
                                candidates_count={event.candidates_count}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] py-12">
                            <p className="text-gray-400">No active voting events at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});

ActiveVotingEventsSection.displayName = 'ActiveVotingEventsSection';

export default ActiveVotingEventsSection;
