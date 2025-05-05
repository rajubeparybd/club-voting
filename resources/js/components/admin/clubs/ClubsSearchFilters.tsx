import SearchInput from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClubsSearchFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
}

export function ClubsSearchFilters({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }: ClubsSearchFiltersProps) {
    return (
        <div className="mb-4 flex items-center gap-4">
            <SearchInput placeholder="Search clubs..." searchTerm={searchTerm} onSearchChange={onSearchChange} />
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
