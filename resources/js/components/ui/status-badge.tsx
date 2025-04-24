import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const variants = {
    // Success states
    success: 'bg-green-50 text-green-700 border border-green-200',
    active: 'bg-green-50 text-green-700 border border-green-200',
    approved: 'bg-green-50 text-green-700 border border-green-200',
    completed: 'bg-green-50 text-green-700 border border-green-200',
    verified: 'bg-green-50 text-green-700 border border-green-200',
    published: 'bg-green-50 text-green-700 border border-green-200',

    // Warning states
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    inProgress: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    review: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    hold: 'bg-yellow-50 text-yellow-700 border border-yellow-200',

    // Error states
    error: 'bg-red-50 text-red-700 border border-red-200',
    inactive: 'bg-red-50 text-red-700 border border-red-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
    failed: 'bg-red-50 text-red-700 border border-red-200',
    blocked: 'bg-red-50 text-red-700 border border-red-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',

    // Info states
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    draft: 'bg-blue-50 text-blue-700 border border-blue-200',
    new: 'bg-blue-50 text-blue-700 border border-blue-200',

    // Neutral states
    neutral: 'bg-gray-50 text-gray-700 border border-gray-200',
    archived: 'bg-gray-50 text-gray-700 border border-gray-200',
    expired: 'bg-gray-50 text-gray-700 border border-gray-200',

    // Special states
    premium: 'bg-purple-50 text-purple-700 border border-purple-200',
    vip: 'bg-purple-50 text-purple-700 border border-purple-200',
    featured: 'bg-purple-50 text-purple-700 border border-purple-200',
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
            {status}
        </div>
    );
}
