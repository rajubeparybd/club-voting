import { memo, ReactNode } from 'react';

interface AnimatedBackgroundProps {
    children: ReactNode;
}

const AnimatedBackground = memo(({ children }: AnimatedBackgroundProps) => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0f172a] text-white">
            {/* Animated background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
            </div>

            {children}
        </div>
    );
});

AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;
