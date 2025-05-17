import ManagementPageHeader from '@/components/admin/common/management-page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CheckUserPermission from '@/components/ui/check-user-permission';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Processing from '@/components/ui/processing';
import ProcessingButton from '@/components/ui/processing-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, StatusVariant } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminAppLayout from '@/layouts/admin/admin-layout';
import { getNoImage } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    Ban,
    CalendarDays,
    CreditCard,
    Edit,
    Lock,
    LogOut,
    MoreHorizontal,
    PlusCircle,
    Search,
    Shield,
    ThumbsDown,
    ThumbsUp,
    Users,
} from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

// Position Assignment Dialog Component
interface PositionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clubPositions: ClubPosition[];
    userId: number;
    onPositionChange: (userId: number, positionId: number | null) => void;
    currentPositionId: number | null;
}

function PositionAssignmentDialog({ open, onOpenChange, clubPositions, userId, onPositionChange, currentPositionId }: PositionDialogProps) {
    const [selectedPositionId, setSelectedPositionId] = useState<string>(currentPositionId ? currentPositionId.toString() : 'none');
    const [isUpdating, setIsUpdating] = useState(false);

    // Reset selectedPositionId when currentPositionId changes or dialog opens
    useEffect(() => {
        if (open) {
            setSelectedPositionId(currentPositionId ? currentPositionId.toString() : 'none');
            setIsUpdating(false);
        }
    }, [currentPositionId, open]);

    const handleConfirm = () => {
        setIsUpdating(true);
        const positionId = selectedPositionId !== 'none' ? parseInt(selectedPositionId, 10) : null;
        onPositionChange(userId, positionId);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!isUpdating) {
                    onOpenChange(newOpen);
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Position</DialogTitle>
                    <DialogDescription>Select a position to assign to this member</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Select value={selectedPositionId} onValueChange={setSelectedPositionId} disabled={isUpdating}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Position</SelectItem>
                            {clubPositions.map((position) => (
                                <SelectItem key={position.id} value={position.id.toString()} disabled={!position.is_active}>
                                    {position.name} {!position.is_active && '(Inactive)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <ProcessingButton processing={isUpdating} onClick={handleConfirm}>
                        {isUpdating ? 'Assigning...' : 'Confirm'}
                    </ProcessingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Remove Member Dialog Component
interface RemoveMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
    userName: string;
    onConfirm: (userId: number) => void;
    isLoading: boolean;
}

function RemoveMemberDialog({ open, onOpenChange, userId, userName, onConfirm, isLoading }: RemoveMemberDialogProps) {
    const handleConfirm = () => {
        onConfirm(userId);
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!isLoading) {
                    onOpenChange(newOpen);
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove Member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove <span className="font-medium">{userName}</span> from this club?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-amber-800">
                    <AlertCircle className="size-5 text-amber-600" />
                    <p className="text-sm">This action cannot be undone. The member will lose their position and access to this club.</p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <ProcessingButton variant="destructive" processing={isLoading} onClick={handleConfirm}>
                        {isLoading ? 'Removing...' : 'Remove Member'}
                    </ProcessingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Payment Dialog Component
interface Payment {
    id: number;
    user_id: number;
    club_id: number;
    payment_method_id: number;
    transaction_id: string;
    amount: string;
    sender_account_number: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    screenshot_url: string | null;
    payment_method?: {
        id: number;
        name: string;
        logo: string | null;
    } | null;
}

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: Payment | null;
    userName: string;
    onApprove: (paymentId: number) => void;
    onReject: (paymentId: number) => void;
    isLoading: boolean;
}

function PaymentDialog({ open, onOpenChange, payment, userName, onApprove, onReject, isLoading }: PaymentDialogProps) {
    if (!payment) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!isLoading) {
                    onOpenChange(newOpen);
                }
            }}
        >
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                    <DialogDescription>
                        Payment information for <span className="font-medium">{userName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                            <div className="mt-1 flex items-center gap-2">
                                {payment.payment_method?.logo && (
                                    <img src={payment.payment_method.logo} alt="Payment Method" className="h-6 w-6 rounded-md object-contain" />
                                )}
                                <p className="font-medium">{payment.payment_method?.name || 'Unknown'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                            <p className="mt-1 font-medium">{payment.amount}৳</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                            <p className="mt-1 font-mono">{payment.transaction_id}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Sender Account</h3>
                            <p className="mt-1 font-mono">{payment.sender_account_number}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
                        <p className="mt-1">{format(new Date(payment.created_at), 'PPP p')}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <StatusBadge status={payment.status} />
                    </div>

                    {payment.screenshot_url && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-500">Payment Screenshot</h3>
                            <a href={payment.screenshot_url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={payment.screenshot_url}
                                    alt="Payment Screenshot"
                                    className="max-h-44 rounded-md border border-gray-200 object-contain"
                                />
                            </a>
                        </div>
                    )}
                </div>

                {payment.status === 'pending' && (
                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <div className="flex gap-2">
                            <ProcessingButton
                                variant="destructive"
                                processing={isLoading}
                                onClick={() => onReject(payment.id)}
                                disabled={payment.status !== 'pending'}
                            >
                                <ThumbsDown className="mr-2 size-4" />
                                {isLoading ? 'Processing...' : 'Reject Payment'}
                            </ProcessingButton>
                            <ProcessingButton
                                variant="default"
                                processing={isLoading}
                                onClick={() => onApprove(payment.id)}
                                disabled={payment.status !== 'pending'}
                            >
                                <ThumbsUp className="mr-2 size-4" />
                                {isLoading ? 'Processing...' : 'Approve Payment'}
                            </ProcessingButton>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface ClubPosition {
    id: number;
    club_id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ClubUser {
    id: number;
    name: string;
    student_id: string | null;
    email: string;
    avatar: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    pivot: {
        club_id: number;
        user_id: number;
        position_id: number | null;
        status?: 'pending' | 'active' | 'inactive' | 'banned';
        joined_at: string;
    };
    position?: ClubPosition | null;
    payment_logs?: Payment[];
}

interface Club {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'pending';
    image: string | null;
    open_date: string | null;
    created_at: string;
    updated_at: string;
    positions: ClubPosition[];
    users: ClubUser[];
    join_fee: number;
}

interface ClubShowProps {
    club: Club;
}

// Define a simple column definition
interface Column<T> {
    key: string;
    header: string;
    cell?: (item: T) => ReactNode;
}

// Member action dropdown component
interface MemberActionsProps {
    user: ClubUser;
    clubPositions: ClubPosition[];
    onStatusChange: (userId: number, status: string) => void;
    onPositionChange: (userId: number, positionId: number | null) => void;
    onRemoveMember: (userId: number) => void;
    onViewPayment: (userId: number) => void;
    isLoading: boolean;
}

function MemberActions({ user, clubPositions, onStatusChange, onPositionChange, onRemoveMember, onViewPayment, isLoading }: MemberActionsProps) {
    const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const currentStatus = user.pivot.status || 'pending';

    // Check if user has pending payment for this specific club
    const hasPendingPayment = user.payment_logs?.some((payment) => payment.status === 'pending' && payment.club_id === user.pivot.club_id);

    return (
        <>
            <PositionAssignmentDialog
                open={isPositionDialogOpen}
                onOpenChange={setIsPositionDialogOpen}
                clubPositions={clubPositions}
                userId={user.id}
                onPositionChange={(userId, positionId) => {
                    onPositionChange(userId, positionId);
                    setIsPositionDialogOpen(false);
                }}
                currentPositionId={user.pivot.position_id}
            />

            <RemoveMemberDialog
                open={isRemoveDialogOpen}
                onOpenChange={setIsRemoveDialogOpen}
                userId={user.id}
                userName={user.name}
                onConfirm={onRemoveMember}
                isLoading={isLoading}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Status actions */}
                    <CheckUserPermission
                        permission={['edit_club_users', 'delete_club_users']}
                        fallback={
                            <DropdownMenuItem>
                                <Lock className="mr-2 size-4" />
                                Access Denied
                            </DropdownMenuItem>
                        }
                    >
                        <CheckUserPermission permission="edit_club_users">
                            {/* View Payment (only show for pending payments) */}
                            {hasPendingPayment && (
                                <DropdownMenuItem disabled={isLoading} onClick={() => onViewPayment(user.id)}>
                                    <CreditCard className="mr-2 size-4 text-blue-600" />
                                    View Payment
                                </DropdownMenuItem>
                            )}

                            {hasPendingPayment && <DropdownMenuSeparator />}

                            <DropdownMenuItem disabled={currentStatus === 'active' || isLoading} onClick={() => onStatusChange(user.id, 'active')}>
                                <Shield className="mr-2 size-4 text-green-600" />
                                Activate Member
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                disabled={currentStatus === 'inactive' || isLoading}
                                onClick={() => onStatusChange(user.id, 'inactive')}
                            >
                                <Shield className="mr-2 size-4 text-gray-600" />
                                Deactivate Member
                            </DropdownMenuItem>

                            <DropdownMenuItem disabled={currentStatus === 'banned' || isLoading} onClick={() => onStatusChange(user.id, 'banned')}>
                                <Ban className="mr-2 size-4 text-red-600" />
                                Ban Member
                            </DropdownMenuItem>
                        </CheckUserPermission>

                        {/* Position assignment */}
                        <CheckUserPermission permission="edit_club_users">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                disabled={isLoading}
                                onClick={() => {
                                    setIsPositionDialogOpen(true);
                                }}
                            >
                                <Award className="mr-2 size-4" />
                                Assign Position
                            </DropdownMenuItem>
                        </CheckUserPermission>

                        {/* Remove member */}
                        <CheckUserPermission permission="delete_club_users">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                disabled={isLoading}
                                onClick={() => setIsRemoveDialogOpen(true)}
                            >
                                <LogOut className="mr-2 size-4" />
                                Remove from Club
                            </DropdownMenuItem>
                        </CheckUserPermission>
                    </CheckUserPermission>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

// Custom table component that works with our column definition
function DataTable<T>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column.key}>{column.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((item, i) => (
                            <TableRow key={i}>
                                {columns.map((column) => (
                                    <TableCell key={column.key}>
                                        {column.cell ? column.cell(item) : ((item as Record<string, unknown>)[column.key] as ReactNode)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default function ClubShow({ club }: ClubShowProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [positionFilter, setPositionFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ClubUser | null>(null);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Clubs Management',
                href: route('admin.clubs.index'),
            },
            {
                title: club.name,
                href: route('admin.clubs.show', { club: club.id }),
            },
        ],
        [club.id, club.name],
    );

    // Handle member status change
    const handleStatusChange = (userId: number, status: string) => {
        setIsLoading(true);

        router.post(
            route('admin.clubs.members.update-status', { club: club.id, user: userId }),
            {
                status: status,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    setIsLoading(false);
                },
            },
        );
    };

    // Handle position assignment
    const handlePositionChange = (userId: number, positionId: number | null) => {
        setIsLoading(true);

        router.post(
            route('admin.clubs.members.update-position', { club: club.id, user: userId }),
            {
                position_id: positionId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    setIsLoading(false);
                },
            },
        );
    };

    // Handle member removal
    const handleRemoveMember = (userId: number) => {
        setIsLoading(true);

        router.delete(route('admin.clubs.members.remove', { club: club.id, user: userId }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: (errors) => {
                console.error(errors);
                setIsLoading(false);
            },
        });
    };

    // Handle viewing payment
    const handleViewPayment = (userId: number) => {
        const user = club.users.find((u) => u.id === userId);
        if (!user || !user.payment_logs || user.payment_logs.length === 0) {
            toast.error('No payment information available');
            return;
        }

        // Get pending payments for this specific club
        const pendingPayments = user.payment_logs.filter((payment) => payment.status === 'pending' && payment.club_id === club.id);

        if (pendingPayments.length === 0) {
            toast.error('No pending payments found for this club');
            return;
        }

        // Get the most recent pending payment
        const latestPayment = [...pendingPayments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        setSelectedPayment(latestPayment);
        setSelectedUser(user);
        setIsPaymentDialogOpen(true);
    };

    // Handle payment approval
    const handleApprovePayment = (paymentId: number) => {
        if (!selectedUser) return;

        setIsLoading(true);

        router.post(
            route('admin.clubs.members.update-payment-status', {
                club: club.id,
                user: selectedUser.id,
                payment: paymentId,
            }),
            {
                status: 'approved',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    setIsPaymentDialogOpen(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    setIsLoading(false);
                },
            },
        );
    };

    // Handle payment rejection
    const handleRejectPayment = (paymentId: number) => {
        if (!selectedUser) return;

        setIsLoading(true);

        router.post(
            route('admin.clubs.members.update-payment-status', {
                club: club.id,
                user: selectedUser.id,
                payment: paymentId,
            }),
            {
                status: 'rejected',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                    setIsPaymentDialogOpen(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    setIsLoading(false);
                },
            },
        );
    };

    const positionColumns: Column<ClubPosition>[] = [
        {
            key: 'name',
            header: 'Position Name',
        },
        {
            key: 'description',
            header: 'Description',
            cell: (position) => <span className="line-clamp-2">{position.description || 'No description'}</span>,
        },
        {
            key: 'is_active',
            header: 'Status',
            cell: (position) => {
                return <StatusBadge status={position.is_active ? 'active' : 'inactive'} variant={position.is_active ? 'active' : 'inactive'} />;
            },
        },
        {
            key: 'created_at',
            header: 'Created Date',
            cell: (position) => format(new Date(position.created_at), 'PPP'),
        },
    ];

    const memberColumns: Column<ClubUser>[] = [
        {
            key: 'student_id',
            header: 'Student ID',
            cell: (user) => <span>{user.student_id || '-'}</span>,
        },
        {
            key: 'name',
            header: 'Name',
            cell: (user) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-full border border-gray-300">
                        <AvatarImage src={user.avatar || ''} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Email',
        },
        {
            key: 'position',
            header: 'Position',
            cell: (user) => {
                const positionId = user.pivot.position_id;
                const position = positionId ? club.positions.find((p) => p.id === positionId) : null;

                return <span>{position ? position.name : '-'}</span>;
            },
        },
        {
            key: 'status',
            header: 'Status',
            cell: (user) => {
                const status = user.pivot.status || 'pending';
                return <StatusBadge status={status} variant={status as StatusVariant} />;
            },
        },
        {
            key: 'joined_at',
            header: 'Joined Date',
            cell: (user) => format(new Date(user.pivot.joined_at), 'PPP'),
        },
        {
            key: 'actions',
            header: 'Actions',
            cell: (user) => (
                <MemberActions
                    user={user}
                    clubPositions={club.positions}
                    onStatusChange={handleStatusChange}
                    onPositionChange={handlePositionChange}
                    onRemoveMember={handleRemoveMember}
                    onViewPayment={handleViewPayment}
                    isLoading={isLoading}
                />
            ),
        },
    ];

    // Filter members based on search, status, and position
    const filteredMembers = useMemo(() => {
        return club.users.filter((user) => {
            const matchesSearch =
                searchTerm === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const userStatus = user.pivot.status || 'active'; // Default to active if not set
            const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

            let matchesPosition = true;
            if (positionFilter !== 'all') {
                if (positionFilter === 'unassigned') {
                    matchesPosition = user.pivot.position_id === null;
                } else {
                    const positionId = parseInt(positionFilter, 10);
                    matchesPosition = user.pivot.position_id === positionId;
                }
            }

            return matchesSearch && matchesStatus && matchesPosition;
        });
    }, [club.users, searchTerm, statusFilter, positionFilter]);

    return (
        <AdminAppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Club: ${club.name}`} />
            <div className="relative flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {isLoading && <Processing />}

                {/* Payment Dialog */}
                {selectedUser && (
                    <PaymentDialog
                        open={isPaymentDialogOpen}
                        onOpenChange={setIsPaymentDialogOpen}
                        payment={selectedPayment}
                        userName={selectedUser.name}
                        onApprove={handleApprovePayment}
                        onReject={handleRejectPayment}
                        isLoading={isLoading}
                    />
                )}

                <ManagementPageHeader title={club.name} description={`Complete information about ${club.name.toLowerCase()} club`}>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.clubs.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Link>
                        </Button>
                        <CheckUserPermission permission="edit_clubs">
                            <Button asChild>
                                <Link href={route('admin.clubs.edit', { club: club.id })}>
                                    <Edit className="mr-2 size-4" />
                                    Edit
                                </Link>
                            </Button>
                        </CheckUserPermission>
                    </div>
                </ManagementPageHeader>

                <Card>
                    <CardHeader>
                        <CardTitle>{club.name}</CardTitle>
                        <CardDescription>Complete information about {club.name.toLowerCase()} club</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-2 text-lg font-medium">About</h3>
                                    <p className="text-sm text-gray-500">{club.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <StatusBadge status={club.status} variant={club.status} />

                                    {club.open_date && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <CalendarDays className="size-4" />
                                            <span>Opened on {format(new Date(club.open_date), 'PPP')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <PlusCircle className="size-4" />
                                        <span>
                                            Join Fee: <span className="font-bold">{club.join_fee}৳</span>
                                        </span>
                                    </div>

                                    <Users className="ml-2 size-4" />
                                    <span>{club.users.length} Members</span>

                                    <Award className="ml-2 size-4" />
                                    <span>{club.positions.length} Positions</span>
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-end">
                                {club.image ? (
                                    <img
                                        src={club.image}
                                        alt={club.name}
                                        className="max-h-60 rounded-lg object-cover shadow-md"
                                        onError={(e) => {
                                            e.currentTarget.src = getNoImage();
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-52 w-52 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                        No image available
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="positions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="positions">
                            <Award className="mr-2 size-4" />
                            Positions ({club.positions.length})
                        </TabsTrigger>
                        <TabsTrigger value="members">
                            <Users className="mr-2 size-4" />
                            Members ({club.users.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="positions" className="border-none p-0 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Positions</CardTitle>
                                <CardDescription>All positions available in this club</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {club.positions.length > 0 ? (
                                    <DataTable columns={positionColumns} data={club.positions} />
                                ) : (
                                    <div className="rounded-md border border-dashed p-6 text-center text-gray-500">
                                        <p>No positions have been created for this club yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="members" className="border-none p-0 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Members</CardTitle>
                                <CardDescription>All users who are members of this club</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search members..."
                                            className="pl-8 md:w-1/2"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Status Filter" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="banned">Banned</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={positionFilter} onValueChange={setPositionFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Position Filter" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Positions</SelectItem>
                                                <SelectItem value="unassigned">No Position</SelectItem>
                                                {club.positions.map((position) => (
                                                    <SelectItem key={position.id} value={position.id.toString()}>
                                                        {position.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {filteredMembers.length > 0 ? (
                                    <DataTable columns={memberColumns} data={filteredMembers} />
                                ) : (
                                    <div className="rounded-md border border-dashed p-6 text-center text-gray-500">
                                        <p>No members matching the selected filters.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminAppLayout>
    );
}
