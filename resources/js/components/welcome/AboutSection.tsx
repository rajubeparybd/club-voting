import { motion } from 'framer-motion';
import { Rocket, Shield, Users, Vote } from 'lucide-react';
import { memo } from 'react';
import SectionHeading from './SectionHeading';

interface AboutSectionProps {
    description: string;
}

const AboutSection = memo(({ description }: AboutSectionProps) => {
    return (
        <section id="about" className="bg-gradient-to-b from-[rgba(30,41,59,0.3)] to-[#0f172a] px-6 py-24 md:px-8">
            <div className="container mx-auto">
                <SectionHeading
                    title="About This Project"
                    description={description || 'An open-source voting platform designed with simplicity and security in mind'}
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Left side: About the project */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="space-y-6 rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] p-8 shadow-lg">
                            <div className="inline-flex rounded-xl border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.1)] p-3">
                                <Shield className="h-8 w-8 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Club Voting System</h3>
                            <p className="text-gray-300">
                                This project was created to provide educational institutions with a secure, transparent, and easy-to-use platform for
                                conducting club elections. It aims to streamline the democratic process and increase student participation in campus
                                activities.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 rounded-full bg-[rgba(59,130,246,0.1)] p-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <p className="text-sm text-gray-300">Secure and transparent voting system</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 rounded-full bg-[rgba(59,130,246,0.1)] p-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <p className="text-sm text-gray-300">Comprehensive club management features</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 rounded-full bg-[rgba(59,130,246,0.1)] p-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <p className="text-sm text-gray-300">Built with modern web technologies</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 rounded-full bg-[rgba(59,130,246,0.1)] p-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <p className="text-sm text-gray-300">Available under Apache License</p>
                                </li>
                            </ul>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <div className="rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)] px-3 py-1.5">
                                    <span className="text-xs font-medium text-blue-400">Laravel</span>
                                </div>
                                <div className="rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)] px-3 py-1.5">
                                    <span className="text-xs font-medium text-blue-400">React</span>
                                </div>
                                <div className="rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)] px-3 py-1.5">
                                    <span className="text-xs font-medium text-blue-400">TypeScript</span>
                                </div>
                                <div className="rounded-lg border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.05)] px-3 py-1.5">
                                    <span className="text-xs font-medium text-blue-400">Tailwind CSS</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right side: Core values */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] p-6 shadow-md">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                    <Vote className="h-7 w-7" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white">Democratic</h3>
                                <p className="text-sm text-gray-300">Built on principles of fairness and transparency to ensure every vote counts.</p>
                            </div>

                            <div className="rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] p-6 shadow-md">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                    <Shield className="h-7 w-7" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white">Secure</h3>
                                <p className="text-sm text-gray-300">Advanced security features protect the integrity of every election.</p>
                            </div>

                            <div className="rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] p-6 shadow-md">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                    <Users className="h-7 w-7" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white">Community</h3>
                                <p className="text-sm text-gray-300">Designed to strengthen student organizations and campus engagement.</p>
                            </div>

                            <div className="rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] p-6 shadow-md">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                    <Rocket className="h-7 w-7" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white">Open Source</h3>
                                <p className="text-sm text-gray-300">Available under Apache License for anyone to use, modify, and contribute.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;
