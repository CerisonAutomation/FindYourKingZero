import type {ReactNode} from 'react';
import {useRef, useState} from 'react';
import {motion, useMotionValue, useTransform} from 'framer-motion';
import {Loader2} from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    className?: string;
}

export function PullToRefresh({onRefresh, children, className}: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullProgress, setPullProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);
    const y = useMotionValue(0);

    const THRESHOLD = 80;

    const rotation = useTransform(y, [0, THRESHOLD], [0, 360]);
    const opacity = useTransform(y, [0, THRESHOLD * 0.5, THRESHOLD], [0, 0.5, 1]);
    const scale = useTransform(y, [0, THRESHOLD], [0.5, 1]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isRefreshing) return;
        if (containerRef.current?.scrollTop !== 0) return;

        currentY.current = e.touches[0].clientY;
        const diff = Math.max(0, currentY.current - startY.current);
        const dampedDiff = Math.min(diff * 0.5, THRESHOLD * 1.5);

        y.set(dampedDiff);
        setPullProgress(Math.min(dampedDiff / THRESHOLD, 1));
    };

    const handleTouchEnd = async () => {
        if (pullProgress >= 1 && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
        y.set(0);
        setPullProgress(0);
    };

    return (
        <div className="relative">
            {/* Pull indicator */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
                style={{
                    height: y,
                    opacity,
                }}
            >
                <motion.div
                    style={{rotate: isRefreshing ? undefined : rotation, scale}}
                    animate={isRefreshing ? {rotate: 360} : undefined}
                    transition={isRefreshing ? {duration: 1, repeat: Infinity, ease: 'linear'} : undefined}
                >
                    <Loader2 className="w-6 h-6 text-primary"/>
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
                ref={containerRef}
                className={className}
                style={{y}}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </motion.div>
        </div>
    );
}
