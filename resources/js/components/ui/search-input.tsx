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
        <div className={cn('relative  w-full md:w-1/3', className)}>
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input placeholder={placeholder} className="pl-8 w-full" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
    );
};

export default SearchInput;
