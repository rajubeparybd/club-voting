import { motion } from 'framer-motion';
import { ArrowRight, Award, Users } from 'lucide-react';
import { memo } from 'react';
import AnimatedButton from './AnimatedButton';

interface Position {
    id: number;
    name: string;
    is_active: boolean;
}

interface ClubCardProps {
    id: number;
    name: string;
    description: string;
    image?: string;
    members_count: number;
    positions: Position[];
}

const ClubCard = memo(({ id, name, description, image, members_count, positions }: ClubCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[rgba(59,130,246,0.2)] bg-[#1e293b] transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:bg-[#334155] hover:shadow-xl">
                <div className="flex flex-1 flex-row items-center justify-between p-5 pb-2">
                    <div>
                        <h3 className="line-clamp-1 text-xl font-bold text-white">{name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span>{members_count} Members</span>
                        </div>
                    </div>
                    {image && <img src={image} alt={name} className="size-10 rounded-md" />}
                </div>

                <div className="flex flex-1 flex-col space-y-4 p-5">
                    <p className="line-clamp-2 text-sm text-gray-300">{description}</p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span>{members_count} Active Members</span>
                        </div>
                        {positions.length > 0 && (
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <Award className="h-4 w-4 text-blue-400" />
                                <span>{positions.length} Available Positions</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {positions.slice(0, 3).map((position) => (
                            <span
                                key={position.id}
                                className="rounded-full border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] px-3 py-1 text-xs text-blue-400 transition-all hover:scale-105 hover:bg-[rgba(59,130,246,0.2)]"
                            >
                                {position.name}
                            </span>
                        ))}
                        {positions.length > 3 && (
                            <span className="rounded-full border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] px-3 py-1 text-xs text-blue-400">
                                +{positions.length - 3} more
                            </span>
                        )}
                    </div>

                    <div className="mt-auto flex justify-between gap-3 pt-2">
                        <AnimatedButton href={route('user.clubs.show', { id })} icon={<ArrowRight className="ml-2 h-4 w-4" />} iconPosition="right">
                            Join Club
                        </AnimatedButton>
                        <AnimatedButton variant="outline" href={route('user.clubs.show', { id })}>
                            Learn More
                        </AnimatedButton>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

ClubCard.displayName = 'ClubCard';

export default ClubCard;
