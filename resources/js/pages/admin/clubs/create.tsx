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
import { z } from 'zod';

const positionSchema = z.object({
    name: z.string().min(1, 'Position name is required'),
    description: z.string().optional(),
    is_active: z.boolean(),
});

const clubFormSchema = z.object({
    name: z.string().min(3, 'Club name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    join_fee: z.coerce.number().min(0, 'Join fee must be greater than 0'),
    status: z.enum(['active', 'inactive', 'pending']),
    open_date: z.string().optional(),
    image: z.string().min(1, 'Club image is required'),
    is_active: z.boolean(),
    positions: z.array(positionSchema).min(1, 'At least one position is required'),
});

type ClubFormValues = z.infer<typeof clubFormSchema>;

export default function CreateClub() {
    const [clubImage, setClubImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClubFormValues>({
        resolver: zodResolver(clubFormSchema),
        defaultValues: {
            name: '',
            description: '',
            join_fee: 0,
            status: 'active',
            open_date: new Date().toISOString().split('T')[0],
            image: '',
            positions: [
                {
                    name: '',
                    description: '',
                    is_active: true,
                },
            ],
            is_active: true,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'positions',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Clubs Management',
            href: route('admin.clubs.index'),
        },
        {
            title: 'Create',
            href: route('admin.clubs.create'),
        },
    ];

    const handleSubmit = (data: ClubFormValues) => {
        setIsSubmitting(true);

        const formData = new FormData();

        // Add regular form fields to FormData
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('join_fee', data.join_fee.toString());
        formData.append('status', data.status);
        formData.append('image', data.image);

        if (data.open_date) {
            formData.append('open_date', data.open_date);
        }

        // Handle positions array correctly
        if (data.positions && Array.isArray(data.positions)) {
            // Convert positions to JSON string
            const positionsJson = JSON.stringify(data.positions);
            formData.append('positions', positionsJson);
        }

        // Add the file if it exists
        if (clubImage) {
            formData.append('club_image', clubImage);
        }

        // Submit with FormData
        router.post(route('admin.clubs.store'), formData, {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Club" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ManagementPageHeader title="Create Club" description="Fill in the details to create a new club.">
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
                        <CardDescription>Fill in the details to create a new club.</CardDescription>
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

                                {/* Join Fee */}
                                <FormField
                                    control={form.control}
                                    name="join_fee"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <FormLabel>Join Fee</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter join fee" {...field} />
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
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onFileChange={setClubImage}
                                                    hasError={!!form.formState.errors.image}
                                                />
                                            </FormControl>
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
                                        <Accordion type="multiple" className="w-full space-y-2 pb-2" defaultValue={['position-0']}>
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
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                            </>
                                        ) : (
                                            'Create Club'
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
