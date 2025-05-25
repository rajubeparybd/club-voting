import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { cva, VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const animatedButtonVariants = cva(
    'group inline-flex h-10 cursor-pointer items-center justify-center rounded-full  text-sm font-semibold text-white shadow-sm transition-all px-6 py-2 hover:-translate-y-0.5 hover:shadow-lg',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-r from-blue-500 to-blue-800 hover:bg-primary/90',
                primary: 'bg-gradient-to-r from-blue-500 to-blue-800 hover:bg-primary/90',
                warning: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:bg-primary/90',
                success: 'bg-gradient-to-r from-green-500 to-green-600 hover:bg-primary/90',
                warningLight: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:bg-primary/90',
                danger: 'bg-gradient-to-r from-red-500 to-red-700 hover:bg-primary/90',
                outline: 'border border-[rgba(59,130,246,0.3)] bg-transparent hover:bg-[rgba(59,130,246,0.1)]',
            },
            size: {
                default: 'h-10',
                sm: 'h-8',
                lg: 'h-12',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

interface AnimatedButtonProps {
    href?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
}

const AnimatedButton = ({
    href,
    children,
    className,
    icon,
    variant,
    size,
    iconPosition = 'right',
    onClick,
}: React.ComponentProps<'button'> & VariantProps<typeof animatedButtonVariants> & AnimatedButtonProps) => {
    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
            {href ? (
                <Link href={href} className={cn(animatedButtonVariants({ variant, className, size }))}>
                    {icon && iconPosition === 'left' && (
                        <motion.div
                            animate={{ x: [0, 4, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                        >
                            {icon}
                        </motion.div>
                    )}
                    {children}
                    {icon && iconPosition === 'right' && (
                        <motion.div
                            animate={{ x: [0, 4, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                        >
                            {icon}
                        </motion.div>
                    )}
                </Link>
            ) : (
                <button className={cn(animatedButtonVariants({ variant, className, size }))} onClick={onClick}>
                    {icon && iconPosition === 'left' && (
                        <motion.div
                            animate={{ x: [0, 4, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                        >
                            {icon}
                        </motion.div>
                    )}
                    {children}
                    {icon && iconPosition === 'right' && (
                        <motion.div
                            animate={{ x: [0, 4, 0], rotate: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
                        >
                            {icon}
                        </motion.div>
                    )}
                </button>
            )}
        </motion.div>
    );
};

export default AnimatedButton;
