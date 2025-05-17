import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable, { DataTableColumnHeader, DataTableFilter } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import UserAppLayout from '@/layouts/user/user-layout';
import { BreadcrumbItem, PaymentLog } from '@/types';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useMemo } from 'react';

export default function PaymentLogsIndex({ paymentLogs }: { paymentLogs: PaymentLog[] }) {
    const columns: ColumnDef<PaymentLog>[] = useMemo(
        () => [
            {
                accessorKey: 'club.name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Club" />,
                cell: ({ row }) => {
                    const club = row.original.club;
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-8 rounded-md border">
                                <AvatarImage src={club?.image ?? undefined} alt={club?.name ?? 'Club'} />
                            </Avatar>
                            <span>{club?.name ?? '-'}</span>
                        </div>
                    );
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'payment_method.name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Method" />,
                cell: ({ row }) => {
                    const paymentMethod = row.original.payment_method;
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-8 rounded-md border">
                                <AvatarImage src={paymentMethod?.logo ?? undefined} alt={paymentMethod?.name ?? 'Payment Method'} />
                                <AvatarFallback>
                                    <span>{paymentMethod?.name?.charAt(0) ?? '-'}</span>
                                </AvatarFallback>
                            </Avatar>
                            <span>{paymentMethod?.name ?? '-'}</span>
                        </div>
                    );
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'transaction_id',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction ID" />,
                cell: ({ row }) => <span className="font-mono">{row.getValue('transaction_id')}</span>,
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'amount',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
                cell: ({ row }) => {
                    const amount = parseFloat(row.getValue('amount'));
                    return <span className="font-medium">${amount.toFixed(2)}</span>;
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'status',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
                cell: ({ row }) => {
                    const status = row.getValue('status') as string;
                    return <StatusBadge status={status} />;
                },
                enableSorting: true,
                enableHiding: true,
                filterFn: (row, id, value) => {
                    return value === 'all' || row.getValue(id) === value;
                },
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('created_at'));
                    return format(date, 'dd MMM, yyyy hh:mm a');
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'updated_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('updated_at'));
                    return format(date, 'dd MMM, yyyy hh:mm a');
                },
                enableSorting: true,
                enableHiding: true,
            },
            {
                accessorKey: 'screenshot_url',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Screenshot" />,
                cell: ({ row }) => {
                    const screenshotUrl = row.getValue('screenshot_url') as string;
                    return screenshotUrl ? (
                        <a
                            href={screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:underline"
                        >
                            <Eye className="mr-1 size-4" /> View
                        </a>
                    ) : (
                        <span className="text-gray-400">No screenshot</span>
                    );
                },
                enableSorting: false,
                enableHiding: true,
            },
        ],
        [],
    );

    const initialHiddenColumns: string[] = useMemo(() => ['updated_at'], []);

    const data = useMemo(() => paymentLogs ?? [], [paymentLogs]);

    const filters: Record<string, DataTableFilter> = useMemo(
        () => ({
            club_name: {
                label: 'Search Club',
                placeholder: 'Search by club name...',
                type: 'input',
                columnId: 'club.name',
                className: 'flex-1',
            },
            status: {
                label: 'Status',
                type: 'select',
                columnId: 'status',
                options: [
                    { label: 'All', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Verified', value: 'verified' },
                    { label: 'Rejected', value: 'rejected' },
                ],
                className: 'flex-1',
            },
        }),
        [],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Payment History',
                href: route('user.payment-logs.index'),
            },
        ],
        [],
    );

    // Defensive rendering
    if (!paymentLogs) {
        return (
            <UserAppLayout breadcrumbs={breadcrumbs}>
                <Head title="Payment History" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-center">
                                <p>Loading payment history...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </UserAppLayout>
        );
    }

    return (
        <UserAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment History" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Payment History</h1>
                        <p className="text-muted-foreground">View all your payment transactions</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Logs</CardTitle>
                        <CardDescription>A list of all your payment transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={data} filters={filters} initialHiddenColumns={initialHiddenColumns} />
                    </CardContent>
                </Card>
            </div>
        </UserAppLayout>
    );
}
