import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Club, VotingEvent } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface VotingEventFormProps {
    votingEvent?: VotingEvent;
    clubs: Club[];
    onSuccess?: () => void;
}

const votingEventFormSchema = z
    .object({
        club_id: z.string().min(1, 'Club is required'),
        title: z.string().min(3, 'Event title must be at least 3 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        status: z.enum(['active', 'draft', 'closed', 'archived']),
        start_date: z.string().min(1, 'Start date and time is required'),
        end_date: z.string().min(1, 'End date and time is required'),
    })
    .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
        message: 'End date must be after start date',
        path: ['end_date'],
    });

type VotingEventFormValues = z.infer<typeof votingEventFormSchema>;

export default function VotingEventForm({ votingEvent, clubs, onSuccess }: VotingEventFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEdit = !!votingEvent;

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    const form = useForm<VotingEventFormValues>({
        resolver: zodResolver(votingEventFormSchema),
        defaultValues: votingEvent
            ? {
                  club_id: votingEvent.club_id.toString(),
                  title: votingEvent.title,
                  description: votingEvent.description ?? '',
                  status: votingEvent.status,
                  start_date: formatDateForInput(votingEvent.start_date),
                  end_date: formatDateForInput(votingEvent.end_date),
              }
            : {
                  club_id: '',
                  title: '',
                  description: '',
                  status: 'draft',
                  start_date: '',
                  end_date: '',
              },
    });

    const handleSubmit = (data: VotingEventFormValues) => {
        setIsSubmitting(true);

        if (isEdit) {
            router.put(route('admin.voting-events.update', votingEvent.id), data, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onSuccess?.();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    if (errors.error) {
                        toast.error(errors.error);
                    }
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as keyof VotingEventFormValues, { message: value as string });
                    });
                },
            });
        } else {
            router.post(route('admin.voting-events.store'), data, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onSuccess?.();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    if (errors.error) {
                        toast.error(errors.error);
                    }
                    Object.entries(errors).forEach(([key, value]) => {
                        form.setError(key as keyof VotingEventFormValues, { message: value as string });
                    });
                },
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Club */}
                <FormField
                    control={form.control}
                    name="club_id"
                    render={({ field }) => (
                        <FormItem>
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
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter event title" {...field} />
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
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter event description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Status */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
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
                            <FormItem>
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
                            <FormItem>
                                <FormLabel>End Date & Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : isEdit ? (
                            'Update Event'
                        ) : (
                            'Create Event'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
