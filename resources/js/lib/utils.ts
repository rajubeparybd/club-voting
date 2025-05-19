import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names
 * @param {ClassValue[]} inputs - The class values to merge
 * @returns {string} The merged class names
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Get the text for a status
 * @param {string} status - The status to get the text for
 * @returns {string} The text for the status
 */
export const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Get a placeholder image URL
 * @param {Object} props - The properties for the placeholder image
 * @param {number} [width=400] - The width of the image
 * @param {number} [height=300] - The height of the image
 * @param {string} [text='No Image'] - The text to display in the image
 */
export const getNoImage = (width = 200, height = 100, text = 'No Image') => {
    return `https://placehold.co/${width}x${height}?text=${text}`;
};

/**
 * Format a role name to text
 * @param {string} role - The role name to format
 * @returns {string} The formatted role name
 */
export const formatRoleToText = (role: string) => {
    const prefix = 'c_admin_';
    if (role.startsWith(prefix)) {
        role = role.slice(prefix.length);
    }
    return role.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format a text to role name
 * @param {string} text - The text to format
 * @returns {string} The formatted role name
 */
export const formatTextToRole = (text: string) => {
    const underscored = text.toLowerCase().replace(/\s+/g, '_');
    return `c_admin_${underscored}`;
};

/**
 * Format a pattern to text
 * @param {string} pattern - The pattern to format
 * @returns {string} The formatted pattern
 */
export const formatPatternToText = (pattern: string, capitalize = true) => {
    if (capitalize) {
        return pattern.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return pattern.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toLowerCase());
};

/**
 * Format a text to pattern
 * @param {string} text - The text to format
 * @returns {string} The formatted pattern
 */
export const formatTextToPattern = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, '_');
};

/**
 * Format a filter
 * @param {string[]} filters - The filters to format
 * @returns {string[]} The formatted filters
 */
export const formatFilter = (filters: string[]) => {
    return ['all', ...filters].map((item) => {
        const formattedItem = item?.slice(0, 1).toUpperCase() + item?.slice(1);
        return { label: formattedItem, value: item };
    });
};

// Helper function to format time remaining
export const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();

    if (diffTime <= 0) {
        return { text: 'Ended', isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    return {
        text: `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`,
        isExpired: false,
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds,
    };
};
