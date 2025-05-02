import { Badge } from '@/components/ui/badge';
import { ClubActions } from '@/components/ui/data-table/club-actions';
import { StatusBadge } from '@/components/ui/data-table/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ClubPosition {
    id: number;
    club_id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Club {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'pending';
    image: string;
    open_date: string | null;
    created_at: string;
    updated_at: string;
    users_count: number;
    positions_count: number;
    positions?: ClubPosition[];
}

interface ClubsTableProps {
    clubs: Club[];
    onDeleteClick: (id: number) => void;
    isLoading: boolean;
}

export function ClubsTable({ clubs, onDeleteClick, isLoading }: ClubsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Positions</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clubs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No clubs found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        clubs.map((club) => (
                            <TableRow key={club.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        {club.image && <img src={club.image} alt={club.name} className="h-10 w-10 rounded-lg object-cover" />}
                                        <div>
                                            <div>{club.name}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {club.description && club.description.length > 50
                                                    ? `${club.description.substring(0, 50)}...`
                                                    : club.description}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={club.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="outline" className="whitespace-nowrap">
                                            {club.positions_count} positions
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>{club.users_count} members</TableCell>
                                <TableCell className="text-right">
                                    <ClubActions clubId={club.id} onDelete={onDeleteClick} disabled={isLoading} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
