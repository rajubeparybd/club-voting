import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface SetReminderModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    itemType: 'voting-event' | 'nomination';
    itemId: number;
    itemTitle: string;
    userEmail?: string;
}

interface ReminderFormData {
    email: string;
    reminder_time: number;
    notification_type: string;
    notes: string;
    [key: string]: string | number;
}

export default function SetReminderModal({ isOpen, onOpenChange, itemType, itemId, itemTitle, userEmail }: SetReminderModalProps) {
    const { data, setData, post, processing, errors, reset, wasSuccessful, clearErrors } = useForm<ReminderFormData>({
        email: userEmail || '',
        reminder_time: 24,
        notification_type: 'email',
        notes: '',
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Clear previous validation errors
        setValidationErrors({});

        // Basic client-side validation
        const newErrors: Record<string, string> = {};

        if (!data.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (data.reminder_time < 1 || data.reminder_time > 168) {
            newErrors.reminder_time = 'Reminder time must be between 1 and 168 hours';
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        post(route('user.reminders.store', { type: itemType, id: itemId }), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    useEffect(() => {
        if (wasSuccessful) {
            reset();
        }
    }, [wasSuccessful, reset]);

    useEffect(() => {
        if (!isOpen) {
            reset();
            setValidationErrors({});
            clearErrors();
            setData({
                email: userEmail || '',
                reminder_time: 24,
                notification_type: 'email',
                notes: '',
            });
        }
    }, [isOpen, reset, clearErrors, setData, userEmail]);

    // Combined errors (from server-side validation and client-side validation)
    const getError = (field: keyof ReminderFormData) => {
        return errors[field] || validationErrors[field];
    };

    const reminderTimeOptions = [
        { value: 1, label: '1 hour before' },
        { value: 2, label: '2 hours before' },
        { value: 6, label: '6 hours before' },
        { value: 12, label: '12 hours before' },
        { value: 24, label: '1 day before' },
        { value: 48, label: '2 days before' },
        { value: 72, label: '3 days before' },
        { value: 168, label: '1 week before' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Reminder</DialogTitle>
                    <DialogDescription>
                        Get notified before "{itemTitle}" starts. We'll send you an email reminder at your chosen time.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1"
                            placeholder="Enter your email address"
                            required
                        />
                        {getError('email') && <p className="mt-1 text-xs text-red-500">{getError('email')}</p>}
                    </div>

                    <div>
                        <Label htmlFor="reminder_time">Reminder Time</Label>
                        <Select value={data.reminder_time.toString()} onValueChange={(value) => setData('reminder_time', parseInt(value))}>
                            <SelectTrigger id="reminder_time" className="mt-1">
                                <SelectValue placeholder="Select when to remind you" />
                            </SelectTrigger>
                            <SelectContent>
                                {reminderTimeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {getError('reminder_time') && <p className="mt-1 text-xs text-red-500">{getError('reminder_time')}</p>}
                    </div>

                    {/* <div>
                        <Label htmlFor="notification_type">Notification Type</Label>
                        <Select value={data.notification_type} onValueChange={(value) => setData('notification_type', value)}>
                            <SelectTrigger id="notification_type" className="mt-1">
                                <SelectValue placeholder="Select notification type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms" disabled>
                                    SMS (Coming Soon)
                                </SelectItem>
                                <SelectItem value="push" disabled>
                                    Push Notification (Coming Soon)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {getError('notification_type') && <p className="mt-1 text-xs text-red-500">{getError('notification_type')}</p>}
                    </div> */}

                    <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1"
                            placeholder="Add any personal notes for this reminder..."
                            rows={3}
                        />
                        {getError('notes') && <p className="mt-1 text-xs text-red-500">{getError('notes')}</p>}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Setting Reminder...' : 'Set Reminder'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
