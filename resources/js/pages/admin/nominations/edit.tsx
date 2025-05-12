import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem, Club, Nomination } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Helper function to format date string for datetime-local input
const formatDateTimeLocal = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // Return empty string or a default value if the date is invalid
        return '';
    }
    // Get local date parts
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Format as YYYY-MM-DDTHH:mm
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const nominationFormSchema = z
    .object({
        club_id: z.string().min(1, 'Club is required'),
        title: z.string().min(3, 'Nomination title must be at least 3 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        status: z.enum(['active', 'draft', 'closed', 'archived']),
        start_date: z.string().min(1, 'Start date and time is required'),
        end_date: z.string().min(1, 'End date and time is required'),
    })
    .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
        message: 'End date must be after start date',
        path: ['end_date'],
    });

type NominationFormValues = z.infer<typeof nominationFormSchema>;

export default function EditNomination({ clubs, nomination }: { clubs: Club[]; nomination: Nomination }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<NominationFormValues>({
        resolver: zodResolver(nominationFormSchema),
        defaultValues: {
            club_id: nomination.club_id.toString(),
            title: nomination.title,
            description: nomination.description,
            status: nomination.status as 'active' | 'draft' | 'closed' | 'archived',
            start_date: formatDateTimeLocal(nomination.start_date), // Format for datetime-local
            end_date: formatDateTimeLocal(nomination.end_date), // Format for datetime-local
        },
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Nominations Management',
            href: route('admin.nominations.index'),
        },
        {
            title: 'Create Nomination',
            href: route('admin.nominations.create'),
        },
    ];

    const handleSubmit = (data: NominationFormValues) => {
        // Date comparison validation is now handled by Zod refine

        setIsSubmitting(true);
        router.put(route('admin.nominations.update', nomination.id), data, {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                toast.error(errors.error || 'Failed to update nomination. Please try again.');
                Object.entries(errors).forEach(([key, value]) => {
                    form.setError(key as keyof NominationFormValues, { message: value });
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Nomination - ${nomination.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ManagementPageHeader title={`Edit Nomination - ${nomination.title}`} description="Fill in the details to edit the nomination.">
                    <Button variant="outline" asChild>
                        <Link href={route('admin.nominations.index')}>
                            <ArrowLeft className="size-4" />
                            Go Back
                        </Link>
                    </Button>
                </ManagementPageHeader>
                <Card>
                    <CardHeader>
                        <CardTitle>Nomination Information</CardTitle>
                        <CardDescription>Update the nomination details below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                {/* Club */}
                                <FormField
                                    control={form.control}
                                    name="club_id"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>Club</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Club" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {clubs.map((club) => (
                                                        <SelectItem key={club.id} value={club.id.toString()}>
                                                            {club.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Title */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>Nomination Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter nomination title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter nomination description" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {/* Status */}
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="mb-4 w-full">
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="closed">Closed</SelectItem>
                                                        <SelectItem value="archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Start Date */}
                                    <FormField
                                        control={form.control}
                                        name="start_date"
                                        render={({ field }) => (
                                            <FormItem className="mb-4 w-full">
                                                <FormLabel>Start Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* End Date */}
                                    <FormField
                                        control={form.control}
                                        name="end_date"
                                        render={({ field }) => (
                                            <FormItem className="mb-4 w-full">
                                                <FormLabel>End Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                            </>
                                        ) : (
                                            'Update Nomination'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AdminAppLayout>
    );
}
