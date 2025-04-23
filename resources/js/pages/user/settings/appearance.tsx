import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/app/appearance-tabs';
import HeadingSmall from '@/components/app/heading-small';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

import AppLayout from '@/layouts/user/app-layout';
import SettingsLayout from '@/layouts/user/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: route('user.settings.appearance'),
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
