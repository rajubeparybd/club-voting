import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const positionSchema = z.object({
    name: z.string().min(1, 'Position name is required'),
    description: z.string().optional(),
    is_active: z.boolean(),
});

const clubFormSchema = z.object({
    name: z.string().min(3, 'Club name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    status: z.enum(['active', 'inactive', 'pending']),
    open_date: z.string().optional(),
    image: z.string().optional(),
    positions: z.array(positionSchema).optional(),
});

type ClubFormValues = z.infer<typeof clubFormSchema>;

interface EditClubProps {
    club: {
        id: number;
        name: string;
        description: string;
        status: 'active' | 'inactive' | 'pending';
        open_date: string | null;
        image: string | null;
        positions: {
            id: number;
            name: string;
            description: string | null;
            is_active: boolean;
        }[];
    };
}

export default function EditClub({ club }: EditClubProps) {
    const [clubImage, setClubImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Format the opening date to YYYY-MM-DD format for the date input
    const formatOpenDate = (dateString: string | null): string => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    };

    const form = useForm<ClubFormValues>({
        resolver: zodResolver(clubFormSchema),
        defaultValues: {
            name: club.name,
            description: club.description,
            status: club.status,
            open_date: formatOpenDate(club.open_date),
            image: club.image || '',
            positions: club.positions.map((position) => ({
                name: position.name,
                description: position.description || '',
                is_active: position.is_active,
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'positions',
    });

    // Generate default accordion values to keep all items expanded
    const defaultAccordionValues = fields.map((_, index) => `position-${index}`);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Clubs Management',
            href: route('admin.clubs.index'),
        },
        {
            title: 'Edit',
            href: route('admin.clubs.edit', { club: club.id }),
        },
    ];

    const handleSubmit = (data: ClubFormValues) => {
        setIsSubmitting(true);

        // Add the file to FormData if it exists
        const formData = new FormData();

        // Add all form fields to FormData
        Object.entries(data).forEach(([key, value]) => {
            // Handle nested positions array separately
            if (key === 'positions' && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        // Add the file if it exists
        if (clubImage) {
            formData.append('club_image', clubImage);
        }

        // Add _method field for method spoofing
        formData.append('_method', 'PUT');

        // Submit with FormData as POST with method spoofing
        router.post(route('admin.clubs.update', { club: club.id }), formData, {
            onSuccess: () => {
                toast.success('Club updated successfully');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Failed to update club');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Club: ${club.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ManagementPageHeader title={club.name} description={`Edit ${club.name.toLowerCase()} club information`}>
                    <Button variant="outline" asChild>
                        <Link href={route('admin.clubs.index')}>
                            <ArrowLeft className="size-4" />
                            Go Back
                        </Link>
                    </Button>
                </ManagementPageHeader>
                <Card>
                    <CardHeader>
                        <CardTitle>Club Information</CardTitle>
                        <CardDescription>Update the details of the club.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                {/* Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>Club Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter club name" {...field} />
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
                                                <Textarea placeholder="Enter club description" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col gap-4 md:flex-row">
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
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="open_date"
                                        render={({ field }) => (
                                            <FormItem className="mb-4 w-full">
                                                <FormLabel>Opening Date (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Image Upload */}
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>Club Image</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    onFileChange={setClubImage}
                                                    hasError={!!form.formState.errors.image}
                                                />
                                            </FormControl>
                                            {club.image && (
                                                <div className="mt-2">
                                                    <p className="mb-1 text-sm text-gray-500">Current image:</p>
                                                    <img src={club.image} alt={club.name} className="max-h-40 rounded-md border" />
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Positions Section */}
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Positions</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                append({
                                                    name: '',
                                                    description: '',
                                                    is_active: true,
                                                })
                                            }
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Position
                                        </Button>
                                    </div>

                                    {fields.length > 0 ? (
                                        <Accordion type="multiple" className="mb-2 w-full space-y-2 pb-2" defaultValue={defaultAccordionValues}>
                                            {fields.map((field, index) => (
                                                <AccordionItem
                                                    key={field.id}
                                                    value={`position-${index}`}
                                                    className="overflow-hidden rounded-md border"
                                                >
                                                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                                                        <div className="flex w-full items-center justify-between">
                                                            <h4 className="text-sm font-medium">Position {index + 1}</h4>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    remove(index);
                                                                }}
                                                                className="mr-2 ml-auto"
                                                            >
                                                                <Trash2 className="text-destructive h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pt-2 pb-4">
                                                        <div className="grid gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name={`positions.${index}.name`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Position Name</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="e.g. President" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`positions.${index}.description`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Description</FormLabel>
                                                                        <FormControl>
                                                                            <Textarea placeholder="Position description" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`positions.${index}.is_active`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                                                        <FormControl>
                                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                                        </FormControl>
                                                                        <FormLabel className="text-sm font-normal">Active</FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (
                                        <div className="rounded-md border border-dashed p-6 text-center text-gray-500">
                                            <p>No positions added yet. Click "Add Position" to get started.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                                            </>
                                        ) : (
                                            'Update Club'
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
