import { FlashMessages } from '@/types/admin';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook to automatically display flash messages from Inertia props
 *
 * @returns {FlashMessages | undefined} The current flash messages
 */
export function useFlashNotifications() {
    const page = usePage();
    const flash = page.props.flash as FlashMessages | undefined;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return flash;
}

export default useFlashNotifications;
