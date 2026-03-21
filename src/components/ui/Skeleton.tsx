// =====================================================
// SKELETON — Shimmer-animated loading placeholders
// SkeletonCard, SkeletonList, SkeletonText
// =====================================================
import { cn } from '@/lib/utils';

// ─── Base Skeleton ──────────────────────────────────
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted shimmer-bg',
        className,
      )}
      {...props}
    />
  );
}

// ─── SkeletonCard — Profile card placeholder ────────
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border/50',
        className,
      )}
    >
      {/* Image area shimmer */}
      <Skeleton className="absolute inset-0 rounded-none" />

      {/* Content area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── SkeletonGrid — Multiple card placeholders ─────
function SkeletonGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── SkeletonList — Message/conversation placeholder ─
function SkeletonList({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('divide-y divide-border/50', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="w-14 h-14 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── SkeletonText — Text block placeholder ──────────
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ['w-full', 'w-11/12', 'w-9/12', 'w-10/12', 'w-8/12'];

  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

// ─── LoadingMore — Infinite scroll loading indicator ─
function LoadingMore() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 animate-in fade-in-50">
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonGrid,
  SkeletonList,
  SkeletonText,
  LoadingMore,
};

export default Skeleton;
