import { cn, getStatusText } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const variants = {
    // Success states
    success: 'bg-green-600 text-white',
    active: 'bg-green-600 text-white',
    approved: 'bg-green-600 text-white',
    completed: 'bg-green-600 text-white',
    verified: 'bg-green-600 text-white',
    published: 'bg-green-600 text-white',

    // Warning states
    warning: 'bg-yellow-600 text-white',
    pending: 'bg-yellow-600 text-white',
    inProgress: 'bg-yellow-600 text-white',
    review: 'bg-yellow-600 text-white',
    hold: 'bg-yellow-600 text-white',

    // Error states
    error: 'bg-red-600 text-white',
    inactive: 'bg-red-600 text-white',
    rejected: 'bg-red-600 text-white',
    failed: 'bg-red-600 text-white',
    blocked: 'bg-red-600 text-white',
    cancelled: 'bg-red-600 text-white',

    // Info states
    info: 'bg-blue-600 text-white',
    draft: 'bg-blue-600 text-white',
    new: 'bg-blue-600 text-white',

    // Neutral states
    neutral: 'bg-gray-600 text-white',
    archived: 'bg-gray-600 text-white',
    expired: 'bg-gray-600 text-white',

    // Special states
    premium: 'bg-purple-600 text-white',
    vip: 'bg-purple-600 text-white',
    featured: 'bg-purple-600 text-white',
} as const;

const statusVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', {
    variants: {
        variant: variants,
        size: {
            sm: 'text-xs px-2 py-0.5',
            md: 'text-sm px-2.5 py-1',
            lg: 'text-base px-3 py-1.5',
        },
    },
    defaultVariants: {
        variant: 'neutral',
        size: 'sm',
    },
});

export type StatusVariant = keyof typeof variants;

export interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
    status: string;
    className?: string;
}

export function StatusBadge({ status, variant, size, className }: StatusBadgeProps) {
    // Convert status to variant if no variant is provided
    const resolvedVariant = variant || (status.toLowerCase() as StatusVariant);

    return (
        <div className={cn(statusVariants({ variant: resolvedVariant, size }), className)}>
            {getStatusText(status)}
        </div>
    );
}
