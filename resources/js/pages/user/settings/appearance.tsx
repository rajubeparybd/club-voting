import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/app/appearance-tabs';
import HeadingSmall from '@/components/app/heading-small';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

import UserSettingsLayout from '@/layouts/user/settings/user-settings-layout';
import UserAppLayout from '@/layouts/user/user-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: route('user.settings.appearance'),
    },
];

export default function Appearance() {
    return (
        <UserAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <UserSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </UserSettingsLayout>
        </UserAppLayout>
    );
}
