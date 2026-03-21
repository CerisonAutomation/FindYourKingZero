import {Crown} from 'lucide-react';
import {cn} from '@/lib/utils';

interface CrownBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    label?: string;
}

const sizeMap = {
    sm: {container: 'w-5 h-5', icon: 'w-2.5 h-2.5', text: 'text-[7px]'},
    md: {container: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-[8px]'},
    lg: {container: 'w-7 h-7', icon: 'w-3.5 h-3.5', text: 'text-[9px]'},
};

export function CrownBadge({size = 'sm', className, label}: CrownBadgeProps) {
    const s = sizeMap[size];

    return (
        <div className={cn('inline-flex items-center gap-1', className)}>
            <div
                className={cn(
                    s.container,
                    'flex items-center justify-center shrink-0',
                )}
                style={{
                    background: 'var(--gradient-gold)',
                    boxShadow: '0 0 10px hsl(42 98% 56% / 0.4)',
                }}
            >
                <Crown className={cn(s.icon, 'text-white')} strokeWidth={2.5}/>
            </div>
            {label && (
                <span
                    className={cn(
                        s.text,
                        'font-black tracking-[0.1em] uppercase',
                    )}
                    style={{color: 'hsl(var(--gold))'}}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
