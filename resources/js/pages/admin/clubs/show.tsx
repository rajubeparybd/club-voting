import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFlashNotifications from '@/hooks/use-flash-notifications';
import AppLayout from '@/layouts/admin/app-layout';
import { getStatusColor, getStatusText } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Award, CalendarDays, Edit, Search, Users } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

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
                                        {column.cell ? column.cell(item) : String((item as any)[column.key] || '')}
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
    useFlashNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [positionFilter, setPositionFilter] = useState('all');

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
            cell: (position) => <Badge variant={position.is_active ? 'default' : 'secondary'}>{position.is_active ? 'Active' : 'Inactive'}</Badge>,
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
                return <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>;
            },
        },
        {
            key: 'joined_at',
            header: 'Joined Date',
            cell: (user) => format(new Date(user.pivot.joined_at), 'PPP'),
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Club: ${club.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{club.name}</h1>
                        <p className="text-sm text-gray-500">View detailed information about this club</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.clubs.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.clubs.edit', { club: club.id })}>
                                <Edit className="mr-2 size-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Club Details</CardTitle>
                        <CardDescription>Complete information about the club</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-2 text-lg font-medium">About</h3>
                                    <p className="text-sm text-gray-700">{club.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(club.status)}>{getStatusText(club.status)}</Badge>

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
                                    <img src={club.image} alt={club.name} className="max-h-60 rounded-lg object-cover shadow-md" />
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
                                    <DataTable columns={positionColumns} data={club.positions} searchable={true} searchKey="name" />
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
                                    <DataTable columns={memberColumns} data={filteredMembers} searchable={true} searchKey="name" />
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
        </AppLayout>
    );
}
