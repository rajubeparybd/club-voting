import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { z } from 'zod';

interface CreatePaymentMethodModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess?: () => void;
}

// Define Zod schema for client-side validation that mirrors server validation
const paymentMethodSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
    description: z.string().min(1, 'Description is required'),
    type: z.enum(['manual', 'automatic'], {
        errorMap: () => ({ message: 'Type must be either manual or automatic' }),
    }),
    provider: z.enum(['bkash', 'rocket', 'nagad', 'bank', 'cash'], {
        errorMap: () => ({ message: 'Provider must be one of: bkash, rocket, nagad, bank, cash' }),
    }),
    is_active: z.boolean(),
    logo: z
        .instanceof(File, { message: 'Logo is required' })
        .nullable()
        .refine((file) => file !== null, {
            message: 'Logo is required',
        }),
});

type PaymentMethodFormData = {
    name: string;
    description: string;
    type: 'manual' | 'automatic';
    provider: 'bkash' | 'rocket' | 'nagad' | 'bank' | 'cash';
    is_active: boolean;
    logo: File | null;
};

export default function CreatePaymentMethodModal({ isOpen, onOpenChange, onSuccess }: CreatePaymentMethodModalProps) {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm<PaymentMethodFormData>({
        name: '',
        description: '',
        type: 'manual',
        provider: 'cash',
        is_active: true,
        logo: null,
    });

    // Client-side validation state
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Validate form with Zod before submission
    const validateForm = (): boolean => {
        try {
            paymentMethodSchema.parse(data);
            setValidationErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.reduce<Record<string, string>>((acc, curr) => {
                    if (curr.path.length > 0) {
                        const field = curr.path[0].toString();
                        acc[field] = curr.message;
                    }
                    return acc;
                }, {});
                setValidationErrors(errors);
            }
            return false;
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        post(route('admin.payment-methods.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                onOpenChange(false);
                if (onSuccess) onSuccess();
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
            setData({
                name: '',
                description: '',
                type: 'manual',
                provider: 'cash',
                is_active: true,
                logo: null,
            });
        }
    }, [isOpen, reset, setData]);

    // Combined errors (from server-side validation and client-side validation)
    const getError = (field: keyof PaymentMethodFormData) => {
        return errors[field] || validationErrors[field];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Payment Method</DialogTitle>
                    <DialogDescription>Add a new payment method to the system.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1"
                            placeholder="Enter payment method name"
                        />
                        {getError('name') && <p className="mt-1 text-xs text-red-500">{getError('name')}</p>}
                    </div>

                    <div>
                        <Label htmlFor="logo">Logo</Label>
                        <ImageUpload value={''} onChange={() => {}} onFileChange={(file) => setData('logo', file)} hasError={!!getError('logo')} />
                        {getError('logo') && <p className="mt-1 text-xs text-red-500">{getError('logo')}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1"
                            placeholder="Enter payment method description"
                        />
                        {getError('description') && <p className="mt-1 text-xs text-red-500">{getError('description')}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select value={data.type} onValueChange={(value) => setData('type', value as 'manual' | 'automatic')}>
                                <SelectTrigger id="type" className="mt-1">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="automatic">Automatic</SelectItem>
                                </SelectContent>
                            </Select>
                            {getError('type') && <p className="mt-1 text-xs text-red-500">{getError('type')}</p>}
                        </div>

                        <div>
                            <Label htmlFor="provider">Provider</Label>
                            <Select
                                value={data.provider}
                                onValueChange={(value) => setData('provider', value as 'bkash' | 'rocket' | 'nagad' | 'bank' | 'cash')}
                            >
                                <SelectTrigger id="provider" className="mt-1">
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bkash">bKash</SelectItem>
                                    <SelectItem value="rocket">Rocket</SelectItem>
                                    <SelectItem value="nagad">Nagad</SelectItem>
                                    <SelectItem value="bank">Bank</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                            {getError('provider') && <p className="mt-1 text-xs text-red-500">{getError('provider')}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                        <Label htmlFor="is_active">Active</Label>
                        {getError('is_active') && <p className="mt-1 ml-2 text-xs text-red-500">{getError('is_active')}</p>}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Payment Method'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
