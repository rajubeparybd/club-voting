import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PaymentMethod } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { z } from 'zod';

interface EditPaymentMethodModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    paymentMethod: PaymentMethod | null;
    onSuccess?: () => void;
}

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
    logo: z.instanceof(File, { message: 'Logo must be a valid image file' }).nullable().optional(),
});

type PaymentMethodFormData = {
    name: string;
    description: string;
    type: 'manual' | 'automatic';
    provider: 'bkash' | 'rocket' | 'nagad' | 'bank' | 'cash';
    is_active: boolean;
    logo: File | null;
    _method: string;
};

export default function EditPaymentMethodModal({ isOpen, onOpenChange, paymentMethod, onSuccess }: EditPaymentMethodModalProps) {
    const { data, setData, post, processing, errors, reset, wasSuccessful, clearErrors } = useForm<PaymentMethodFormData>({
        name: '',
        description: '',
        type: 'manual',
        provider: 'cash',
        is_active: true,
        logo: null,
        _method: 'PUT',
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [logoChanged, setLogoChanged] = useState(false);

    useEffect(() => {
        if (paymentMethod) {
            setData({
                name: paymentMethod.name || '',
                description: paymentMethod.description || '',
                type: (paymentMethod.type as 'manual' | 'automatic') || 'manual',
                provider: (paymentMethod.provider as 'bkash' | 'rocket' | 'nagad' | 'bank' | 'cash') || 'cash',
                is_active: Boolean(paymentMethod.is_active),
                logo: null,
                _method: 'PUT',
            });
            setLogoChanged(false);
        } else {
            reset();
        }
    }, [paymentMethod, reset, setData]);

    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
            setValidationErrors({});
            setLogoChanged(false);
            setData({
                name: '',
                description: '',
                type: 'manual',
                provider: 'cash',
                is_active: true,
                logo: null,
                _method: 'PUT',
            });
        }
    }, [isOpen, reset, clearErrors, setData]);

    useEffect(() => {
        if (wasSuccessful && isOpen) {
            if (onSuccess) onSuccess();
            onOpenChange(false);
        }
    }, [wasSuccessful, isOpen, onSuccess, onOpenChange]);

    const validateForm = (): boolean => {
        try {
            const validationSchema = logoChanged ? paymentMethodSchema : paymentMethodSchema.omit({ logo: true });

            validationSchema.parse(data);
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
        if (!paymentMethod) return;

        if (!validateForm()) {
            return;
        }

        post(route('admin.payment-methods.update', paymentMethod.id), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const getError = (field: keyof PaymentMethodFormData) => {
        return errors[field] || validationErrors[field];
    };

    if (!paymentMethod) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Payment Method</DialogTitle>
                    <DialogDescription>Update the payment method details.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1"
                            placeholder="Enter payment method name"
                        />
                        {getError('name') && <p className="mt-1 text-xs text-red-500">{getError('name')}</p>}
                    </div>

                    <div>
                        <Label htmlFor="edit-logo">Logo</Label>
                        <ImageUpload
                            value={paymentMethod?.logo || ''}
                            onChange={() => {}}
                            onFileChange={(file) => {
                                setData('logo', file);
                                setLogoChanged(true);
                            }}
                            hasError={!!getError('logo')}
                            previewImage={paymentMethod?.logo}
                        />
                        {getError('logo') && <p className="mt-1 text-xs text-red-500">{getError('logo')}</p>}
                        <p className="mt-1 text-xs text-gray-500">{logoChanged ? 'New logo selected' : 'Leave empty to keep current logo'}</p>
                    </div>

                    <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1"
                            placeholder="Enter payment method description"
                        />
                        {getError('description') && <p className="mt-1 text-xs text-red-500">{getError('description')}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-type">Type</Label>
                            <Select value={data.type} onValueChange={(value) => setData('type', value as 'manual' | 'automatic')}>
                                <SelectTrigger id="edit-type" className="mt-1">
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
                            <Label htmlFor="edit-provider">Provider</Label>
                            <Select
                                value={data.provider}
                                onValueChange={(value) => setData('provider', value as 'bkash' | 'rocket' | 'nagad' | 'bank' | 'cash')}
                            >
                                <SelectTrigger id="edit-provider" className="mt-1">
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
                        <Switch id="edit-is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                        <Label htmlFor="edit-is_active">Active</Label>
                        {getError('is_active') && <p className="mt-1 ml-2 text-xs text-red-500">{getError('is_active')}</p>}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
