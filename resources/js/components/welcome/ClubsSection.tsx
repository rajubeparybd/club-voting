import { memo } from 'react';
import ClubCard from './ClubCard';
import SectionHeading from './SectionHeading';

interface Position {
    id: number;
    name: string;
    is_active: boolean;
}

interface Club {
    id: number;
    name: string;
    description: string;
    image?: string;
    members_count: number;
    positions: Position[];
}

interface ClubsSectionProps {
    activeClubs: Club[];
}

const ClubsSection = memo(({ activeClubs }: ClubsSectionProps) => {
    return (
        <section id="clubs" className="px-6 py-24 md:px-8">
            <div className="container mx-auto">
                <SectionHeading title="Active Clubs" description="Join and participate in our vibrant community of active clubs" />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {activeClubs.length > 0 ? (
                        activeClubs.map((club) => (
                            <ClubCard
                                key={club.id}
                                id={club.id}
                                name={club.name}
                                description={club.description}
                                image={club.image}
                                members_count={club.members_count}
                                positions={club.positions}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] py-12">
                            <p className="text-gray-400">No active clubs available at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});

ClubsSection.displayName = 'ClubsSection';

export default ClubsSection;
