import useAuthorization from '@/hooks/useAuthorization';
import { Auth } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { memo } from 'react';
import AnimatedButton from './AnimatedButton';

// Removed static stats data

interface HeroSectionProps {
    appName: string;
    auth: Auth;
    siteStats: Array<{ number: string; label: string }>;
}

const HeroSection = memo(({ appName, auth, siteStats }: HeroSectionProps) => {
    const { hasRole } = useAuthorization();
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16 md:px-6">
            {/* Hero Background Image */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(15,23,42,0.8)] via-[rgba(30,41,59,0.6)] to-[rgba(59,130,246,0.3)]"></div>
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        scale: [1.1, 1.15, 1.1],
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                    }}
                >
                    <img
                        src="/dashboard.svg"
                        alt="Students collaborating"
                        className="h-full w-full object-cover object-center brightness-[0.4] contrast-[1.1] saturate-[1.2] filter"
                    />
                </motion.div>
            </div>

            <div className="relative z-10 max-w-3xl text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto mb-8">
                    <motion.div
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] px-6 py-3 text-sm font-semibold text-blue-400"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                    >
                        ✨ {appName} - Modern Club Management Platform
                    </motion.div>
                </motion.div>

                <motion.h1
                    className="mb-6 bg-gradient-to-r from-white via-blue-400 to-green-400 bg-clip-text text-4xl leading-tight font-black tracking-tight text-transparent sm:text-5xl md:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Empowering Student Democracy
                </motion.h1>

                <motion.p
                    className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    A comprehensive platform for club management, nominations, and transparent voting processes that brings your educational community
                    together.
                </motion.p>

                <motion.div
                    className="mb-16 flex flex-col justify-center gap-4 sm:flex-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {auth.user ? (
                        <AnimatedButton
                            className="h-12 px-8"
                            href={hasRole('user') ? route('user.dashboard') : route('admin.dashboard')}
                            icon={<User className="mr-2 h-4 w-4" />}
                            iconPosition="left"
                        >
                            Dashboard
                        </AnimatedButton>
                    ) : (
                        <>
                            <AnimatedButton
                                className="h-12 px-8"
                                href={route('register')}
                                icon={<ArrowRight className="ml-2 h-5 w-5" />}
                                iconPosition="right"
                            >
                                Get Started
                            </AnimatedButton>
                        </>
                    )}
                </motion.div>

                {/* Hero Stats */}
                <motion.div
                    className="mt-16 grid cursor-pointer grid-cols-2 gap-6 md:grid-cols-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {siteStats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[rgba(30,41,59,0.5)] p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:bg-[rgba(30,41,59,0.8)]"
                            whileHover={{
                                y: -5,
                                borderColor: 'rgba(59,130,246,1)',
                                backgroundColor: 'rgba(30,41,59,0.8)',
                            }}
                        >
                            <motion.span
                                className="block bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-3xl font-extrabold text-transparent"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 * index + 0.5 }}
                            >
                                {stat.number}
                            </motion.span>
                            <motion.span
                                className="mt-1 block text-sm text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 * index + 0.7 }}
                            >
                                {stat.label}
                            </motion.span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
