import React, { useCallback } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderAction {
    icon: React.ElementType;
    onClick: () => void;
    label?: string;
    badge?: number;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Show back arrow — navigates to `backTo` or browser back */
    back?: boolean | string;
    /** Right-side action buttons */
    actions?: PageHeaderAction[];
    /** Inline search toggle */
    search?: { value: string; onChange: (v: string) => void; placeholder?: string };
    /** Show filter button */
    filter?: boolean | (() => void);
    /** Left-align title instead of center */
    leftAligned?: boolean;
    /** Extra className */
    className?: string;
    children?: React.ReactNode;
}

export function PageHeader({
    title,
    subtitle,
    back,
    actions = [],
    search,
    filter,
    leftAligned = false,
    className,
    children,
}: PageHeaderProps) {
    const navigate = useNavigate();

    const handleBack = useCallback(() => {
        if (typeof back === 'string') {
            navigate(back);
        } else {
            navigate(-1);
        }
    }, [back, navigate]);

    const showBack = !!back;
    const showFilter = !!filter;

    return (
        <header
            className={cn(
                'sticky top-0 z-30 glass-nav',
                'flex flex-col justify-center',
                'px-4',
                'pt-[env(safe-area-inset-top,0px)]',
                'min-h-14',
                className,
            )}
        >
            <div className="flex items-center gap-3 h-14">
                {/* Left: Back button (44px touch target) */}
                {showBack ? (
                    <button
                        onClick={handleBack}
                        aria-label="Go back"
                        className={cn(
                            'flex items-center justify-center',
                            'w-11 h-11 -ml-2 shrink-0',
                            'rounded-full',
                            'text-muted-foreground hover:text-foreground',
                            'hover:bg-surface-2',
                            'transition-colors duration-120',
                            'active:scale-95',
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
                    </button>
                ) : (
                    /* Spacer when no back to keep title alignment consistent */
                    !leftAligned && <div className="w-9 shrink-0" />
                )}

                {/* Center / Left: Title + subtitle */}
                <div
                    className={cn(
                        'flex-1 min-w-0',
                        leftAligned ? 'text-left' : 'text-center',
                    )}
                >
                    <h1
                        className={cn(
                            'text-xl font-black tracking-tight leading-tight truncate',
                            'text-foreground',
                        )}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {showFilter && (
                        <button
                            onClick={typeof filter === 'function' ? filter : undefined}
                            aria-label="Filter"
                            className={cn(
                                'flex items-center justify-center',
                                'w-11 h-11 rounded-full',
                                'text-muted-foreground hover:text-foreground',
                                'hover:bg-surface-2',
                                'transition-colors duration-120',
                                'active:scale-95',
                            )}
                        >
                            <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
                        </button>
                    )}

                    {actions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={i}
                                onClick={action.onClick}
                                aria-label={action.label}
                                className={cn(
                                    'relative flex items-center justify-center',
                                    'w-11 h-11 rounded-full',
                                    'text-muted-foreground hover:text-foreground',
                                    'hover:bg-surface-2',
                                    'transition-colors duration-120',
                                    'active:scale-95',
                                )}
                            >
                                <Icon className="w-5 h-5" strokeWidth={2} />
                                {action.badge != null && action.badge > 0 && (
                                    <span
                                        className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
                                        style={{
                                            background: 'var(--gradient-primary)',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            color: '#fff',
                                        }}
                                    >
                                        {action.badge > 99 ? '99+' : action.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Default search action if search prop exists */}
                    {search && !actions.some(a => a.icon === Search) && (
                        <button
                            aria-label="Search"
                            className={cn(
                                'flex items-center justify-center',
                                'w-11 h-11 rounded-full',
                                'text-muted-foreground hover:text-foreground',
                                'hover:bg-surface-2',
                                'transition-colors duration-120',
                                'active:scale-95',
                            )}
                        >
                            <Search className="w-5 h-5" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            {/* Optional inline search expansion */}
            <AnimatePresence>
                {search && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search.value}
                                    onChange={e => search.onChange(e.target.value)}
                                    placeholder={search.placeholder || 'Search…'}
                                    autoComplete="off"
                                    className={cn(
                                        'w-full h-11 pl-10 pr-4',
                                        'bg-surface-2 border border-border rounded-xl',
                                        'text-sm text-foreground placeholder:text-muted-foreground',
                                        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50',
                                        'transition-all duration-120',
                                    )}
                                />
                                {search.value && (
                                    <button
                                        onClick={() => search.onChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slot for children (e.g. FilterBar) */}
            {children}
        </header>
    );
}
