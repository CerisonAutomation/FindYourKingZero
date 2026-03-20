import {Skeleton} from './skeleton';
import {motion} from 'framer-motion';

export function ProfileCardSkeleton() {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border/50"
        >
            {/* Image skeleton */}
            <Skeleton className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted"/>

            {/* Shimmer effect */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"/>

            {/* Content skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24"/>
                    <Skeleton className="h-5 w-5 rounded-full"/>
                </div>
                <Skeleton className="h-4 w-20"/>
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full"/>
                    <Skeleton className="h-5 w-16 rounded-full"/>
                </div>
            </div>
        </motion.div>
    );
}

export function ProfileGridSkeleton({count = 8}: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {Array.from({length: count}).map((_, i) => (
                <ProfileCardSkeleton key={i}/>
            ))}
        </div>
    );
}

export function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton className="w-14 h-14 rounded-full"/>
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32"/>
                <Skeleton className="h-3 w-48"/>
            </div>
            <Skeleton className="h-3 w-10"/>
        </div>
    );
}

export function ConversationListSkeleton({count = 5}: { count?: number }) {
    return (
        <div className="divide-y divide-border/50">
            {Array.from({length: count}).map((_, i) => (
                <ConversationSkeleton key={i}/>
            ))}
        </div>
    );
}
