import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProcessingButton from '@/components/ui/processing-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { getNoImage } from '@/lib/utils';
import { Club, PaymentMethod } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface JoinClubModalProps {
    club: Club;
    userId?: string;
    paymentMethods: PaymentMethod[];
}

export function JoinClubModal({ club, userId, paymentMethods }: JoinClubModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        club_id: club.id,
        user_id: userId,
        payment_method_id: '',
        sender_account_number: '',
        transaction_id: '',
        transaction_amount: club.join_fee.toString(),
        screenshot: '',
    });

    const handlePaymentMethodChange = (value: string) => {
        const selectedPaymentMethod = paymentMethods.find((method) => method.id === Number(value));
        setPaymentMethod(selectedPaymentMethod || null);
        setFormData({
            ...formData,
            payment_method_id: value,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    const handleImageChange = (base64Image: string) => {
        setFormData({
            ...formData,
            screenshot: base64Image,
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Submit the form data using Inertia
        router.post('/user/clubs/join', formData, {
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Join Club - {club.name}</DialogTitle>
                <DialogDescription>Please fill the form to join in the {club.name} club.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
                <input type="hidden" name="club_id" value={club.id} />
                <input type="hidden" name="user_id" value={userId} />

                <div className="grid gap-4">
                    <div className="mt-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Select value={formData.payment_method_id} onValueChange={handlePaymentMethodChange}>
                            <SelectTrigger id="payment_method">
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method.id} value={method.id.toString()}>
                                        {method.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {paymentMethod && (
                            <div key={paymentMethod.id} className="mt-2 rounded-lg border p-3 shadow-sm">
                                <div className="flex flex-row items-center justify-between gap-4 pb-2">
                                    <div className="text-lg font-medium uppercase">{paymentMethod.name}</div>
                                    <img
                                        src={paymentMethod.logo || getNoImage(100, 100, paymentMethod.name)}
                                        alt={paymentMethod.name}
                                        className="h-auto w-32 rounded-xl object-cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex flex-row items-center justify-between">
                                        <p className="text-muted-foreground text-xs uppercase">
                                            {paymentMethod.type} - {paymentMethod.provider}
                                        </p>
                                        <StatusBadge status={paymentMethod.is_active ? 'active' : 'inactive'} />
                                    </div>
                                    {paymentMethod.description && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{paymentMethod.description}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-2">
                        <Label htmlFor="sender_account_number">Sender Account Number</Label>
                        <Input
                            id="sender_account_number"
                            placeholder="Enter sender account number"
                            value={formData.sender_account_number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mt-2">
                        <Label htmlFor="transaction_id">Transaction ID</Label>
                        <Input
                            id="transaction_id"
                            placeholder="Enter transaction ID"
                            value={formData.transaction_id}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mt-2">
                        <Label htmlFor="transaction_amount">Transaction Amount</Label>
                        <Input
                            type="number"
                            id="transaction_amount"
                            placeholder="Enter transaction amount"
                            value={formData.transaction_amount}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="mt-2">
                        <Label htmlFor="screenshot">Screenshot</Label>
                        <ImageUpload onChange={handleImageChange} value={formData.screenshot} />
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <ProcessingButton type="submit" processing={isLoading} disabled={!paymentMethod || isLoading}>
                        {isLoading ? 'Joining...' : 'Join Club'}
                    </ProcessingButton>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

interface JoinClubButtonProps {
    club: Club;
    userId?: string;
    paymentMethods: PaymentMethod[];
    isMember: boolean;
    memberStatus?: string;
    className?: string;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
}

export default function JoinClubButton({
    club,
    userId,
    paymentMethods,
    isMember,
    memberStatus = 'pending',
    className = '',
    variant = 'default',
}: JoinClubButtonProps) {
    return (
        <div className={className}>
            {isMember ? (
                <StatusBadge status={memberStatus} />
            ) : (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={variant}>Join Club</Button>
                    </DialogTrigger>
                    <JoinClubModal club={club} userId={userId} paymentMethods={paymentMethods} />
                </Dialog>
            )}
        </div>
    );
}
