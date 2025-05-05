import { Button } from '@/components/ui/button';
import SearchInput from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClubsSearchFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
}

export function ClubsSearchFilters({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }: ClubsSearchFiltersProps) {
    const handleClearFilters = () => {
        onStatusFilterChange('all');
        onSearchChange('');
    };

    const hasActiveFilters = statusFilter !== 'all';

    return (
        <div className="mb-4 flex items-center justify-between gap-4">
            <SearchInput placeholder="Search clubs..." searchTerm={searchTerm} onSearchChange={onSearchChange} />
            <div className="flex flex-wrap items-center gap-3">
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
                {(hasActiveFilters || searchTerm) && (
                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
