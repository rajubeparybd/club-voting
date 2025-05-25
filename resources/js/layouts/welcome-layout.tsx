import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { memo, ReactNode } from 'react';

// Import always-needed components
import { Toaster } from '@/components/ui/sonner';
import AnimatedBackground from '@/components/welcome/AnimatedBackground';
import Footer from '@/components/welcome/Footer';
import Header from '@/components/welcome/Header';

// Import shared types
import { AppInfo, DeveloperInfo } from '@/components/welcome/types';
import useFlashNotifications from '@/hooks/use-flash-notifications';

// Loading fallback component
export const SectionLoader = () => (
    <div className="flex h-60 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
    </div>
);

interface WelcomeLayoutProps {
    children: ReactNode;
    title?: string;
    appInfo?: AppInfo;
    developerInfo?: DeveloperInfo;
}

const WelcomeLayout = memo(({ children, title = 'Club Voting', appInfo, developerInfo }: WelcomeLayoutProps) => {
    const { auth } = usePage<SharedData>().props;
    useFlashNotifications();

    // Get props from page if not passed directly
    const pageProps = usePage().props as { appInfo?: AppInfo; developerInfo?: DeveloperInfo };
    const finalAppInfo = appInfo || pageProps.appInfo || { name: 'Club Voting', version: '1.0.0', description: '' };
    const finalDeveloperInfo = developerInfo || pageProps.developerInfo || { name: '', email: '', website: '' };

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <AnimatedBackground>
                <Header auth={auth} />

                <main className="flex-1">{children}</main>

                <Footer developerInfo={finalDeveloperInfo} appInfo={finalAppInfo} />
            </AnimatedBackground>
            <Toaster />
        </>
    );
});

WelcomeLayout.displayName = 'WelcomeLayout';

export default WelcomeLayout;
