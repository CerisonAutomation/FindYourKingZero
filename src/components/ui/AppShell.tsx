import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ════════════════════════════════════════════════════════════════
   ERROR BOUNDARY
   ════════════════════════════════════════════════════════════════ */

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

class ShellErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <AlertTriangle className="w-10 h-10 text-destructive" />
                        <div>
                            <p className="text-lg font-bold text-foreground">Something went wrong</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>
                        <button
                            onClick={this.handleRetry}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2',
                                'bg-surface-2 border border-border rounded-xl',
                                'text-sm font-semibold text-foreground',
                                'hover:bg-surface-3 transition-colors',
                            )}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}

/* ════════════════════════════════════════════════════════════════
   LOADING SKELETON
   ════════════════════════════════════════════════════════════════ */

function Skeleton({ className: cls }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-surface-2',
                cls,
            )}
        />
    );
}

function DefaultSkeleton() {
    return (
        <div className="flex-1 px-4 py-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-3 mt-6">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl" />
            </div>
            <Skeleton className="h-32 rounded-xl mt-4" />
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   PULL TO REFRESH
   ════════════════════════════════════════════════════════════════ */

interface PullToRefreshConfig {
    onRefresh: () => Promise<void> | void;
    threshold?: number;
}

function usePullToRefresh(
    containerRef: React.RefObject<HTMLDivElement | null>,
    config?: PullToRefreshConfig,
) {
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef(0);
    const pulling = useRef(false);

    const threshold = config?.threshold ?? 80;

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !config) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (el.scrollTop <= 0) {
                startY.current = e.touches[0].clientY;
                pulling.current = true;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!pulling.current || refreshing) return;
            const delta = e.touches[0].clientY - startY.current;
            if (delta > 0) {
                setPullDistance(Math.min(delta * 0.5, threshold * 1.5));
            }
        };

        const handleTouchEnd = async () => {
            if (!pulling.current) return;
            pulling.current = false;

            if (pullDistance >= threshold && !refreshing) {
                setRefreshing(true);
                try {
                    await config.onRefresh();
                } finally {
                    setRefreshing(false);
                    setPullDistance(0);
                }
            } else {
                setPullDistance(0);
            }
        };

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: true });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [containerRef, config, threshold, pullDistance, refreshing]);

    return { pullDistance, refreshing };
}

/* ════════════════════════════════════════════════════════════════
   APP SHELL
   ════════════════════════════════════════════════════════════════ */

interface AppShellProps {
    children: React.ReactNode;
    /** Sticky header content (e.g. PageHeader) */
    header?: React.ReactNode;
    /** Fixed bottom content (e.g. BottomNav) */
    footer?: React.ReactNode;
    /** Loading state — shows skeleton */
    loading?: boolean;
    /** Custom skeleton component */
    skeleton?: React.ReactNode;
    /** Pull-to-refresh handler */
    onRefresh?: () => Promise<void> | void;
    /** Content padding override */
    padded?: boolean;
    /** Extra className on the scroll container */
    className?: string;
}

export function AppShell({
    children,
    header,
    footer,
    loading = false,
    skeleton,
    onRefresh,
    padded = true,
    className,
}: AppShellProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { pullDistance, refreshing } = usePullToRefresh(scrollRef, onRefresh ? { onRefresh } : undefined);

    return (
        <ShellErrorBoundary>
            <div className="page-shell">
                {/* Header slot */}
                {header}

                {/* Pull-to-refresh indicator */}
                <AnimatePresence>
                    {(pullDistance > 0 || refreshing) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: pullDistance || 48, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex items-center justify-center overflow-hidden"
                        >
                            <Loader2
                                className={cn(
                                    'w-5 h-5 text-primary',
                                    refreshing && 'animate-spin',
                                )}
                                style={
                                    !refreshing
                                        ? { transform: `rotate(${pullDistance * 3}deg)` }
                                        : undefined
                                }
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scrollable content */}
                <div
                    ref={scrollRef}
                    className={cn(
                        'flex-1 overflow-y-auto',
                        'overscroll-behavior-y-contain',
                        '-webkit-overflow-scrolling-touch',
                        padded && 'page-body',
                        footer && 'pb-nav',
                        className,
                    )}
                    style={{ transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined }}
                >
                    {loading ? (skeleton ?? <DefaultSkeleton />) : children}
                </div>

                {/* Footer slot */}
                {footer}
            </div>
        </ShellErrorBoundary>
    );
}
