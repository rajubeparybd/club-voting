import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { HTMLMotionProps, motion } from 'framer-motion';
import { memo } from 'react';

const sectionHeadingVariants = cva(
    'group inline-flex h-10 cursor-pointer items-center justify-center rounded-full  text-sm font-semibold text-white shadow-sm transition-all px-6 py-2 hover:-translate-y-0.5 hover:shadow-lg bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-r from-slate-50 to-blue-400',
                error: 'bg-gradient-to-r from-slate-50 to-red-400',
                purple: 'bg-gradient-to-r from-slate-50 to-purple-400',
                blue: 'bg-gradient-to-r from-slate-50 to-blue-400',
                warning: 'bg-gradient-to-r from-slate-50 to-amber-300',
                success: 'bg-gradient-to-r from-slate-50 to-green-300',
                info: 'bg-gradient-to-r from-slate-50 to-purple-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

interface SectionHeadingProps {
    title: string;
    description: string;
}

const SectionHeading = memo(
    ({ title, description, className, variant }: HTMLMotionProps<'div'> & VariantProps<typeof sectionHeadingVariants> & SectionHeadingProps) => {
        return (
            <motion.div
                className={cn('mb-12 text-center', className)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5 }}
            >
                <h2 className={cn(sectionHeadingVariants({ variant, className }))}>{title}</h2>
                <p className="mx-auto max-w-2xl text-gray-300">{description}</p>
            </motion.div>
        );
    },
);

SectionHeading.displayName = 'SectionHeading';

export default SectionHeading;
