import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Suspense, lazy, useCallback } from 'react';

// Import welcome layout and components
import HeroSection from '@/components/welcome/HeroSection';
import WelcomeLayout, { SectionLoader } from '@/layouts/welcome-layout';

// Lazy load other components
const ClubsSection = lazy(() => import('@/components/welcome/ClubsSection'));
const UpcomingNominationsSection = lazy(() => import('@/components/welcome/UpcomingNominationsSection'));
const ActiveNominationsSection = lazy(() => import('@/components/welcome/ActiveNominationsSection'));
const UpcomingVotingEventsSection = lazy(() => import('@/components/welcome/UpcomingVotingEventsSection'));
const ActiveVotingEventsSection = lazy(() => import('@/components/welcome/ActiveVotingEventsSection'));
// const AboutSection = lazy(() => import('@/components/welcome/AboutSection'));
const DeveloperInfoSection = lazy(() => import('@/components/welcome/DeveloperInfoSection'));

// Import shared types
import { AppInfo, Club, DeveloperInfo, Nomination, VotingEvent } from '@/components/welcome/types';

interface SiteStat {
    number: string;
    label: string;
}

interface WelcomePageProps extends SharedData {
    activeClubs: Club[];
    upcomingNominations: Nomination[];
    activeNominations: Nomination[];
    upcomingVotingEvents: VotingEvent[];
    activeVotingEvents: VotingEvent[];
    appInfo: AppInfo;
    developerInfo: DeveloperInfo;
    siteStats: SiteStat[];
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const {
        activeClubs = [],
        upcomingNominations = [],
        activeNominations = [],
        upcomingVotingEvents = [],
        activeVotingEvents = [],
        appInfo = { name: 'Club Voting', version: '1.0.0', description: '' },
        developerInfo = { name: '', email: '', website: '' },
        siteStats = [
            { number: '0', label: 'Active Clubs' },
            { number: '0', label: 'Members' },
            { number: '0', label: 'Elections' },
            { number: '0%', label: 'Satisfaction' },
        ],
    } = usePage<WelcomePageProps>().props;

    // Format date function - memoize to prevent unnecessary re-renders
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    return (
        <WelcomeLayout title="Welcome to Club Voting" appInfo={appInfo} developerInfo={developerInfo}>
            <HeroSection appName={appInfo.name} auth={auth} siteStats={siteStats} />

            <Suspense fallback={<SectionLoader />}>
                <ClubsSection activeClubs={activeClubs} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <UpcomingNominationsSection upcomingNominations={upcomingNominations} formatDate={formatDate} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <ActiveNominationsSection activeNominations={activeNominations} formatDate={formatDate} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <UpcomingVotingEventsSection upcomingVotingEvents={upcomingVotingEvents} formatDate={formatDate} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
                <ActiveVotingEventsSection activeVotingEvents={activeVotingEvents} />
            </Suspense>

            {/* <Suspense fallback={<SectionLoader />}>
                <AboutSection description={appInfo.description} />
            </Suspense> */}

            <Suspense fallback={<SectionLoader />}>
                <DeveloperInfoSection />
            </Suspense>
        </WelcomeLayout>
    );
}
