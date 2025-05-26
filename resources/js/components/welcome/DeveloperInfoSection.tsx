import mahin from '@/../images/mahin.jpg';
import rajubepary from '@/../images/rajubepary.png';
import { motion } from 'framer-motion';
import { Github, Globe, Linkedin, Mail, Twitter } from 'lucide-react';
import { memo } from 'react';
import SectionHeading from './SectionHeading';

// Animated Social Button Component
const AnimatedSocialButton = ({
    href,
    icon: Icon,
    target,
    rel,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    target?: string;
    rel?: string;
}) => {
    return (
        <motion.a
            href={href}
            target={target}
            rel={rel}
            className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] px-4 py-2 text-sm font-medium text-blue-400 transition-all duration-300 hover:border-blue-400 hover:bg-[rgba(59,130,246,0.2)] hover:shadow-lg hover:shadow-blue-500/25"
            whileHover={{
                scale: 1.1,
            }}
            transition={{ duration: 0.3 }}
        >
            <Icon className="h-4 w-4" />
        </motion.a>
    );
};

interface Developer {
    name: string;
    email: string;
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    role: string;
    bio: string;
    image?: string;
}

const DeveloperInfoSection = memo(() => {
    // Default developers if none provided
    const developers: Developer[] = [
        {
            name: 'Raju Bepary',
            email: 'contact@rajubepary.com',
            website: 'https://rajubepary.com',
            github: 'https://github.com/rajubeparybd',
            twitter: 'https://twitter.com/rajubeparybd',
            linkedin: 'https://linkedin.com/in/rajubepary',
            role: 'Software Developer',
            bio: 'An enthusiastic Software Developer with a strong focus on building scalable and efficient applications. Skilled in technologies like Laravel, React, and TypeScript. Raju excels at solving complex problems and delivering secure, high-performance, and user-friendly digital solutions.',
            image: rajubepary,
        },
        {
            name: 'Md Ibrahim Shikder Mahin',
            email: 'mahinshikder01@gmail.com',
            linkedin: 'https://www.linkedin.com/in/ismahin/',
            role: 'Research Assistant at BUBT',
            bio: 'I specialize in creating intuitive and accessible user interfaces. My focus is on ensuring that every user interaction is meaningful and contributes to a seamless voting experience.',
            image: mahin,
        },
    ];

    return (
        <section className="px-6 py-24 md:px-8">
            <div className="container mx-auto">
                <SectionHeading variant="blue" title="Development Team" description="Meet the talented developers behind this project" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-6xl"
                >
                    <div className="grid gap-8 md:grid-cols-2">
                        {developers.map((developer, index) => (
                            <motion.div
                                key={developer.email}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="relative overflow-hidden rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.3)] p-8 shadow-lg"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* Developer Image */}
                                    <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-purple-500 shadow-lg">
                                        {developer.image ? (
                                            <motion.img
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.3, delay: index * 0.2 }}
                                                src={developer.image}
                                                alt={developer.name}
                                                className="h-full w-full cursor-pointer object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-700 text-3xl font-bold text-white">
                                                {developer.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Developer Info */}
                                    <h3 className="text-2xl font-bold text-white">{developer.name}</h3>
                                    <p className="mb-4 text-blue-400">{developer.role}</p>

                                    {/* Social Links */}
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {developer.website && (
                                            <AnimatedSocialButton href={developer.website} icon={Globe} target="_blank" rel="noopener noreferrer" />
                                        )}

                                        {developer.twitter && (
                                            <AnimatedSocialButton href={developer.twitter} icon={Twitter} target="_blank" rel="noopener noreferrer" />
                                        )}

                                        {developer.github && (
                                            <AnimatedSocialButton href={developer.github} icon={Github} target="_blank" rel="noopener noreferrer" />
                                        )}

                                        {developer.linkedin && (
                                            <AnimatedSocialButton
                                                href={developer.linkedin}
                                                icon={Linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            />
                                        )}

                                        {developer.email && <AnimatedSocialButton href={`mailto:${developer.email}`} icon={Mail} />}
                                    </div>

                                    <div className="mt-4">
                                        <p className="leading-relaxed text-gray-300">{developer.bio}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
});

DeveloperInfoSection.displayName = 'DeveloperInfoSection';

export default DeveloperInfoSection;
