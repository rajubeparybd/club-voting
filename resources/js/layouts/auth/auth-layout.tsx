import { Toaster } from '@/components/ui/sonner';
import useFlashNotifications from '@/hooks/use-flash-notifications';
import AuthLayoutTemplate from '@/layouts/auth/auth-card-layout';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    useFlashNotifications();
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
            <Toaster />
        </AuthLayoutTemplate>
    );
}
