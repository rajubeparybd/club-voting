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
import { ArrowLeft, Award, Ban, CalendarDays, Edit, Lock, LogOut, MoreHorizontal, Search, Shield, Users } from 'lucide-react';
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
    isLoading: boolean;
}

function MemberActions({ user, clubPositions, onStatusChange, onPositionChange, onRemoveMember, isLoading }: MemberActionsProps) {
    const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
    const currentStatus = user.pivot.status || 'pending';

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
                                onClick={() => onRemoveMember(user.id)}
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
                    toast.success(`Member status updated to ${status}`);
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to update member status');
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
                    toast.success(positionId ? 'Position assigned successfully' : 'Position removed successfully');
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to update position');
                    setIsLoading(false);
                },
            },
        );
    };

    // Handle member removal
    const handleRemoveMember = (userId: number) => {
        if (!confirm('Are you sure you want to remove this member from the club?')) {
            return;
        }

        setIsLoading(true);

        router.delete(route('admin.clubs.members.remove', { club: club.id, user: userId }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Member removed from club');
                setIsLoading(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to remove member');
                setIsLoading(false);
            },
        });
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
                                    <Users className="size-4" />
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
