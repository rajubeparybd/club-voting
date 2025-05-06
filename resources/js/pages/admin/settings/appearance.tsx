import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/app/appearance-tabs';
import HeadingSmall from '@/components/app/heading-small';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

import AdminAppLayout from '@/layouts/admin/admin-layout';
import AdminSettingsLayout from '@/layouts/admin/settings/admin-settings-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: route('admin.settings.appearance'),
    },
];

export default function Appearance() {
    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <AdminSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </AdminSettingsLayout>
        </AdminAppLayout>
    );
}
