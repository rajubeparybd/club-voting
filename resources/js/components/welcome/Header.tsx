import useAuthorization from '@/hooks/useAuthorization';
import { type Auth } from '@/types';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { memo } from 'react';
import AppLogo from '../app/app-logo';
import AnimatedButton from './AnimatedButton';

interface HeaderProps {
    auth: Auth;
}

const Header = memo(({ auth }: HeaderProps) => {
    const { hasRole } = useAuthorization();

    return (
        <motion.header
            className="fixed top-0 z-50 w-full border-b border-[rgba(59,130,246,0.2)] bg-[rgba(15,23,42,0.9)] backdrop-blur-xl"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                    <a href="/" className="flex items-center justify-center gap-2">
                        <AppLogo />
                    </a>
                </motion.div>

                <nav className="hidden items-center gap-8 md:flex">
                    <Link
                        href="#clubs"
                        className="rounded-lg px-4 py-2 font-medium text-gray-300 transition-all hover:bg-[rgba(59,130,246,0.1)] hover:text-white"
                    >
                        Clubs
                    </Link>
                    <Link
                        href="#nominations"
                        className="rounded-lg px-4 py-2 font-medium text-gray-300 transition-all hover:bg-[rgba(59,130,246,0.1)] hover:text-white"
                    >
                        Nominations
                    </Link>
                    <Link
                        href="#voting"
                        className="rounded-lg px-4 py-2 font-medium text-gray-300 transition-all hover:bg-[rgba(59,130,246,0.1)] hover:text-white"
                    >
                        Voting
                    </Link>
                    <Link
                        href="#about"
                        className="rounded-lg px-4 py-2 font-medium text-gray-300 transition-all hover:bg-[rgba(59,130,246,0.1)] hover:text-white"
                    >
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <AnimatedButton
                            href={hasRole('user') ? route('user.dashboard') : route('admin.dashboard')}
                            icon={<User className="mr-2 h-4 w-4" />}
                            iconPosition="left"
                        >
                            Dashboard
                        </AnimatedButton>
                    ) : (
                        <>
                            <AnimatedButton href={route('login')}>Log in</AnimatedButton>
                            <AnimatedButton href={route('register')} icon={<ArrowRight className="ml-2 h-4 w-4" />} iconPosition="right">
                                Register
                            </AnimatedButton>
                        </>
                    )}
                </div>
            </div>
        </motion.header>
    );
});

Header.displayName = 'Header';

export default Header;
