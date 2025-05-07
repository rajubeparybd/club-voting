import { type BreadcrumbItem, type Department, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/app/heading-small';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import ProcessingButton from '@/components/ui/processing-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import AdminSettingsLayout from '@/layouts/admin/settings/admin-settings-layout';
import { route } from 'ziggy-js';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: route('admin.settings.profile.edit'),
    },
];

export default function Profile({ mustVerifyEmail, status, departments }: { mustVerifyEmail: boolean; status?: string; departments: Department[] }) {
    const { auth } = usePage<SharedData>().props;

    // Initialize form with typed data
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method: 'PATCH',
        student_id: auth.user.student_id || '',
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: auth.user.phone || '',
        bio: auth.user.bio || '',
        gender: auth.user.gender || '',
        intake: auth.user.intake || '',
        department_id: auth.user.department_id?.toString() || '',
        avatar: auth.user.avatar || '',
        avatar_file: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('admin.settings.profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleFileChange = (file: File | null) => {
        setData('avatar_file', file);
    };

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <AdminSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your profile information and avatar" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6">
                            <div className="space-y-4">
                                <Label>Profile Avatar</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-20">
                                        <AvatarImage src={data.avatar?.toString() || ''} alt={data.name?.toString() || ''} />
                                        <AvatarFallback>{typeof data.name === 'string' ? data.name.charAt(0) : ''}</AvatarFallback>
                                    </Avatar>
                                    <ImageUpload
                                        value={''}
                                        onChange={(dataUrl) => {
                                            setData('avatar_file', dataUrl);
                                            setData('avatar', dataUrl);
                                        }}
                                        onFileChange={handleFileChange}
                                        hasError={!!errors.avatar}
                                        className="h-48"
                                    />
                                </div>
                                <InputError className="mt-2" message={errors.avatar_file} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="student_id">Student ID</Label>
                                <Input
                                    id="student_id"
                                    className="mt-1 block w-full bg-gray-100"
                                    value={data.student_id?.toString() || ''}
                                    disabled
                                    readOnly
                                />
                                <p className="text-muted-foreground text-xs">Student ID cannot be changed</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name?.toString() || ''}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email?.toString() || ''}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    className="mt-1 block w-full"
                                    value={data.bio?.toString() || ''}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Tell us about yourself"
                                    rows={4}
                                />
                                <InputError className="mt-2" message={errors.bio} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="intake">Intake</Label>
                                <Input
                                    id="intake"
                                    className="mt-1 block w-full"
                                    value={data.intake?.toString() || ''}
                                    onChange={(e) => setData('intake', e.target.value)}
                                    placeholder="Your intake (e.g. Spring 2023)"
                                />
                                <InputError className="mt-2" message={errors.intake} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={data.gender?.toString() || ''} onValueChange={(value) => setData('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">Male</SelectItem>
                                        <SelectItem value="F">Female</SelectItem>
                                        <SelectItem value="O">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError className="mt-2" message={errors.gender} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Select value={data.department_id?.toString() || ''} onValueChange={(value) => setData('department_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments?.map((department) => (
                                            <SelectItem key={department.id} value={department.id.toString()}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError className="mt-2" message={errors.department_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={data.phone?.toString() || ''}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    autoComplete="tel"
                                    placeholder="Phone number"
                                />
                                <InputError className="mt-2" message={errors.phone} />
                            </div>
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <ProcessingButton processing={processing}>Save</ProcessingButton>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* <DeleteUser /> */}
            </AdminSettingsLayout>
        </AdminAppLayout>
    );
}
