import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProcessingButton from '@/components/ui/processing-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { getNoImage } from '@/lib/utils';
import { Club, PaymentMethod, type User } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export function JoinClubModal({ club, userId, paymentMethods }: { club: Club; userId?: string; paymentMethods: PaymentMethod[] }) {
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
                            <Card key={paymentMethod.id} className="mt-2 flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                                    <CardTitle className="text-lg font-medium uppercase">{paymentMethod.name}</CardTitle>
                                    <img
                                        src={paymentMethod.logo || getNoImage(100, 100, paymentMethod.name)}
                                        alt={paymentMethod.name}
                                        className="h-auto w-32 rounded-xl object-cover"
                                    />
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="flex flex-row items-center justify-between">
                                        <p className="text-muted-foreground text-xs uppercase">
                                            {paymentMethod.type} - {paymentMethod.provider}
                                        </p>
                                        <StatusBadge status={paymentMethod.is_active ? 'active' : 'inactive'} />
                                    </div>
                                    {paymentMethod.description && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{paymentMethod.description}</p>
                                    )}
                                </CardContent>
                            </Card>
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

function CardClubMembership({ club, userId, paymentMethods }: { club: Club; userId?: string; paymentMethods: PaymentMethod[] }) {
    const isMember = club.users?.some((user) => user.id === Number(userId)) || false;
    const user = club.users?.find((user) => user.id === Number(userId));

    return (
        <div className="rounded-2xl bg-[#252834] p-4 transition-transform duration-300 hover:scale-[1.02] lg:p-6">
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                <img src={club.image} alt={club.name} className="h-full w-full object-cover" />
            </div>
            <h3 className="font-poppins mb-2 text-lg font-semibold text-white">{club.name}</h3>
            <p className="font-poppins mb-4 line-clamp-2 text-base text-gray-400">{club.description}</p>
            <div className="flex items-center justify-between gap-2">
                <span className="font-poppins text-sm text-gray-400">
                    Join Fee: <span className="font-bold">{club.join_fee}৳</span>
                </span>
                <span className="font-poppins text-sm text-gray-400">{club.members_count} members</span>
            </div>
            <div className="mt-2 flex items-center justify-end">
                {isMember ? (
                    <StatusBadge status={user?.pivot?.status || 'pending'} />
                ) : (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Join Club</Button>
                        </DialogTrigger>
                        <JoinClubModal club={club} userId={userId} paymentMethods={paymentMethods} />
                    </Dialog>
                )}
            </div>
        </div>
    );
}

export default function ClubMembership({ clubs, user, paymentMethods }: { clubs: Club[]; user: User; paymentMethods: PaymentMethod[] }) {
    return (
        <div className="mb-4 rounded-2xl bg-[#191B22] p-4 lg:col-span-8 lg:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-poppins text-xl font-semibold text-white">Club Membership</h2>
                <a href="/user/clubs" className="font-poppins text-lg text-white transition-colors hover:text-gray-300">
                    See all
                </a>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                {clubs.slice(0, 2).map((club) => (
                    <CardClubMembership key={club.id} club={club} userId={user.id.toString()} paymentMethods={paymentMethods} />
                ))}
            </div>
        </div>
    );
}
