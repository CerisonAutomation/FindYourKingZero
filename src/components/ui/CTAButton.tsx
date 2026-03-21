import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CTAButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type CTAButtonSize = 'sm' | 'md' | 'lg' | 'full';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: CTAButtonVariant;
    size?: CTAButtonSize;
    icon?: React.ElementType;
    loading?: boolean;
    children: React.ReactNode;
}

const variantClasses: Record<CTAButtonVariant, string> = {
    primary: [
        'text-white',
        'shadow-[0_1px_2px_hsl(0_0%_0%/0.5),inset_0_1px_0_hsl(0_0%_100%/0.1)]',
        'hover:opacity-90 hover:-translate-y-px',
    ].join(' '),
    secondary: [
        'bg-surface-2 text-foreground',
        'border border-border/40',
        'hover:bg-surface-3 hover:border-border/70',
    ].join(' '),
    ghost: [
        'bg-transparent text-foreground',
        'hover:bg-surface-2',
    ].join(' '),
    destructive: [
        'bg-destructive text-destructive-foreground',
        'hover:opacity-90',
        'shadow-sm',
    ].join(' '),
};

const sizeClasses: Record<CTAButtonSize, string> = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-[52px] px-6 text-base',
    full: 'h-11 w-full px-5 text-sm',
};

export function CTAButton({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    loading = false,
    disabled,
    children,
    className,
    style,
    ...props
}: CTAButtonProps) {
    const isPrimary = variant === 'primary';
    const isDestructive = variant === 'destructive';

    const gradientStyle =
        isPrimary
            ? { background: 'var(--gradient-primary)', ...style }
            : isDestructive
              ? { background: 'var(--gradient-red)', ...style }
              : style;

    return (
        <button
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2',
                'font-bold tracking-wide',
                'rounded-xl',
                'transition-all duration-120',
                'active:scale-[0.97]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-40',
                'whitespace-nowrap',
                '[&_svg]:pointer-events-none [&_svg]:shrink-0',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            style={gradientStyle}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
        </button>
    );
}
