import React from 'react'
import { Input } from './input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchProps {
    placeholder: string;
    className?: string;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const SearchInput = ({ placeholder, className, searchTerm, onSearchChange }: SearchProps) => {
    return (
        <div className={cn('md: relative flex-1', className)}>
            <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input placeholder={placeholder} className="pl-8 md:w-1/2" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
            </div>
        </div>
    );
};

export default SearchInput;
