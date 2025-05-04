import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface RolesSearchFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function RolesSearchFilters({ searchTerm, onSearchChange }: RolesSearchFiltersProps) {
    return (
        <div className="relative mb-4 ml-auto w-full md:w-1/3">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input placeholder="Search roles..." className="pl-8" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
    );
}
