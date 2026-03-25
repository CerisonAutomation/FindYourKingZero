import {Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {ButtonHTMLAttributes} from 'react';
import {forwardRef} from 'react';

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'outline';
    children: React.ReactNode;
}

const sizeMap = {
    sm: 'h-9 px-5 text-[10px]',
    md: 'h-12 px-8 text-[12px]',
    lg: 'h-14 px-10 text-[13px]',
};

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
    ({loading, size = 'md', variant = 'solid', children, className, disabled, ...props}, ref) => {
        const isOutline = variant === 'outline';

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    'inline-flex items-center justify-center gap-2.5',
                    'font-black tracking-[0.1em] uppercase',
                    'transition-all duration-150',
                    'active:scale-[0.96]',
                    'disabled:opacity-50 disabled:pointer-events-none',
                    sizeMap[size],
                    isOutline
                        ? 'bg-transparent border border-[hsl(42_98%_56%_/_0.35)] text-[hsl(var(--gold))]'
                        : 'btn-gold',
                    className,
                )}
                style={
                    !isOutline
                        ? {
                            background: 'var(--gradient-gold)',
                            color: '#fff',
                            boxShadow: '0 4px 24px hsl(42 98% 56% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                        }
                        : undefined
                }
                {...props}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin"/>
                ) : (
                    children
                )}
            </button>
        );
    },
);

GoldButton.displayName = 'GoldButton';
