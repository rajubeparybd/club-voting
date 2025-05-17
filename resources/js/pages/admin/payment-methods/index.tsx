import ManagementPageHeader from '@/components/admin/common/management-page-header';
import CreatePaymentMethodModal from '@/components/admin/payment-methods/CreatePaymentMethodModal';
import EditPaymentMethodModal from '@/components/admin/payment-methods/EditPaymentMethodModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { StatusBadge } from '@/components/ui/status-badge';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { getNoImage } from '@/lib/utils';
import { BreadcrumbItem, PaymentMethod } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

export default function PaymentMethodsIndex({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [paymentMethodToAction, setPaymentMethodToAction] = useState<PaymentMethod | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Payment Methods Management',
                href: route('admin.payment-methods.index'),
            },
        ],
        [],
    );

    const handleDeleteClick = useCallback((paymentMethod: PaymentMethod) => {
        setPaymentMethodToAction(paymentMethod);
        setShowDeleteDialog(true);
    }, []);

    const handleEditClick = useCallback((paymentMethod: PaymentMethod) => {
        setPaymentMethodToAction(paymentMethod);
        setShowEditModal(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (!paymentMethodToAction) return;

        setIsLoading(true);
        router.delete(route('admin.payment-methods.destroy', paymentMethodToAction.id), {
            onSuccess: () => {
                setIsLoading(false);
                setShowDeleteDialog(false);
                setPaymentMethodToAction(null);
            },
            onError: (errors) => {
                console.error('Error deleting payment method:', errors);
                setIsLoading(false);
                setShowDeleteDialog(false);
            },
            preserveState: true,
            preserveScroll: true,
        });
    }, [paymentMethodToAction]);

    const cancelDelete = useCallback(() => {
        setShowDeleteDialog(false);
        setPaymentMethodToAction(null);
    }, []);

    if (!paymentMethods) {
        return (
            <AdminAppLayout breadcrumbs={breadcrumbs}>
                <Head title="Payment Methods Management" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 md:p-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading payment methods data...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminAppLayout>
        );
    }

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Methods Management" />

            <CreatePaymentMethodModal isOpen={showCreateModal} onOpenChange={setShowCreateModal} />

            {paymentMethodToAction && (
                <EditPaymentMethodModal
                    isOpen={showEditModal}
                    onOpenChange={setShowEditModal}
                    paymentMethod={paymentMethodToAction}
                    onSuccess={() => {
                        setPaymentMethodToAction(null);
                    }}
                />
            )}

            <DeleteConfirmationDialog
                isOpen={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                isLoading={isLoading}
            />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 md:p-6">
                <ManagementPageHeader title="Payment Methods" description="Manage all available payment methods.">
                    <CheckUserPermission permission="create_payment_methods">
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="mr-2 size-4" /> Create Payment Method
                        </Button>
                    </CheckUserPermission>
                </ManagementPageHeader>

                {paymentMethods.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <p className="text-lg font-semibold">No Payment Methods Found</p>
                                <p>Get started by creating a new payment method.</p>
                                <CheckUserPermission permission="create_payment_methods">
                                    <Button variant="outline" className="mt-4" onClick={() => setShowCreateModal(true)}>
                                        <Plus className="mr-2 size-4" /> Create Payment Method
                                    </Button>
                                </CheckUserPermission>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {paymentMethods.map((pm) => (
                            <Card key={pm.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                                    <CardTitle className="text-lg font-medium uppercase">{pm.name}</CardTitle>
                                    <img
                                        src={pm.logo || getNoImage(100, 100, pm.name)}
                                        alt={pm.name}
                                        className="h-auto w-32 rounded-xl object-cover"
                                    />
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="flex flex-row items-center justify-between">
                                        <p className="text-muted-foreground text-xs uppercase">
                                            {pm.type} - {pm.provider}
                                        </p>
                                        <StatusBadge status={pm.is_active ? 'active' : 'inactive'} />
                                    </div>
                                    {pm.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{pm.description}</p>}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    <CheckUserPermission permission="edit_payment_methods">
                                        <Button onClick={() => handleEditClick(pm)}>
                                            <Pencil className="mr-1 size-4" /> Edit
                                        </Button>
                                    </CheckUserPermission>
                                    <CheckUserPermission permission="delete_payment_methods">
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDeleteClick(pm)}
                                            disabled={isLoading && paymentMethodToAction?.id === pm.id}
                                        >
                                            <Trash2 className="mr-1 size-4" /> Delete
                                        </Button>
                                    </CheckUserPermission>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminAppLayout>
    );
}
