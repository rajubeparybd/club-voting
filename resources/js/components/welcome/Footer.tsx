import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ExternalLink, Mail, Shield } from 'lucide-react';
import { memo } from 'react';
import AppLogo from '../app/app-logo';

interface DeveloperInfo {
    name: string;
    email: string;
    website: string;
}

interface AppInfo {
    name: string;
    version: string;
    description: string;
}

interface FooterProps {
    developerInfo: DeveloperInfo;
    appInfo: AppInfo;
}

const Footer = memo(({ developerInfo, appInfo }: FooterProps) => {
    return (
        <footer className="relative border-t border-[rgba(59,130,246,0.2)] py-12 md:py-16">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[rgba(59,130,246,0.05)] blur-3xl"></div>
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[rgba(16,185,129,0.05)] blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 md:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
                    {/* Column 1: Logo and info */}
                    <div className="md:col-span-1">
                        <motion.div
                            className="mb-5 flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        >
                            <a href="/" className="flex items-center justify-center gap-2">
                                <AppLogo />
                            </a>
                        </motion.div>
                        <p className="mb-4 text-sm text-gray-400">
                            A modern platform for club management, nominations, and democratic voting processes.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Shield className="h-3.5 w-3.5 text-blue-500" />
                            <span>Secure Voting System</span>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="md:col-span-1">
                        <h3 className="mb-4 text-sm font-semibold text-white">Quick Links</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="#clubs" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    Clubs
                                </Link>
                            </li>
                            <li>
                                <Link href="#nominations" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    Nominations
                                </Link>
                            </li>
                            <li>
                                <Link href="#voting" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    Voting
                                </Link>
                            </li>
                            <li>
                                <Link href="#about" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Legal */}
                    <div className="md:col-span-1">
                        <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="#" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                    License
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="md:col-span-1">
                        <h3 className="mb-4 text-sm font-semibold text-white">Contact</h3>
                        <ul className="space-y-2.5">
                            {developerInfo.email && (
                                <li className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                                    <a href={`mailto:${developerInfo.email}`} className="text-sm text-gray-400 transition-colors hover:text-blue-400">
                                        {developerInfo.email}
                                    </a>
                                </li>
                            )}
                            {developerInfo.website && (
                                <li className="flex items-center gap-2">
                                    <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                                    <a
                                        href={developerInfo.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-400 transition-colors hover:text-blue-400"
                                    >
                                        {developerInfo.website}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Footer with Copyright, Version, and Made with tag */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgba(59,130,246,0.2)] pt-8 md:flex-row">
                    <div className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} {developerInfo.name || 'Club Voting'}. All rights reserved.
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div>Version {appInfo.version}</div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>Made with</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-red-500">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                        </svg>
                        <span>by</span>
                        <span className="font-medium text-blue-400">
                            <a href="https://rajubepary.com" target="_blank">
                                Raju Bepary
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
});

Footer.displayName = 'Footer';

export default Footer;
