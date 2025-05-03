import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-600 text-white';
        case 'inactive':
            return 'bg-gray-600 text-white';
        case 'pending':
            return 'bg-yellow-600 text-white';
        case 'banned':
            return 'bg-red-600 text-white';
        default:
            return 'bg-gray-600 text-white';
    }
};

export const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};
