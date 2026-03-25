import React from 'react';
import {cn} from '@/lib/utils';
import {BaseSkeletonProps} from '@/types/base-props';

// Loading spinner variants
const spinnerVariants = {
  size: {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  },
  variant: {
    default: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    destructive: 'border-destructive border-t-transparent',
  },
};

// Loading spinner component
export interface LoadingSpinnerProps  extends BaseSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'secondary' | 'destructive';
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  text,
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      {...props}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2',
          spinnerVariants.size[size],
          spinnerVariants.variant[variant]
        )}
      />
      {text && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

// Skeleton card component
export interface SkeletonCardProps  extends BaseSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  showButton?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
}

export function SkeletonCard({
  lines = 3,
  showAvatar = true,
  showButton = false,
  avatarSize = 'md',
  className,
  ...props
}: SkeletonCardProps) {
  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn('p-4 border rounded-lg space-y-3', className)}
      {...props}
    >
      {showAvatar && (
        <div className="flex items-center gap-3">
          <div className={cn('rounded-full bg-muted animate-pulse', avatarSizes[avatarSize])} />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 bg-muted rounded animate-pulse',
              i === lines - 1 && 'w-2/3'
            )}
          />
        ))}
      </div>

      {showButton && (
        <div className="h-9 bg-muted rounded animate-pulse w-1/3" />
      )}
    </div>
  );
}

// Skeleton list component
export interface SkeletonListProps  extends BaseSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
}

export function SkeletonList({
  items = 5,
  showAvatar = true,
  avatarSize = 'md',
  className,
  ...props
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard
          key={i}
          lines={2}
          showAvatar={showAvatar}
          avatarSize={avatarSize}
          showButton={false}
        />
      ))}
    </div>
  );
}

// Skeleton table component
export interface SkeletonTableProps  extends BaseSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  ...props
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {showHeader && (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded animate-pulse" />
          ))}
        </div>
      )}

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                'h-6 bg-muted rounded animate-pulse',
                colIndex === 0 && 'w-3/4'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Page loading component
export interface PageLoadingProps  extends BaseSkeletonProps {
  text?: string;
  showSpinner?: boolean;
  fullScreen?: boolean;
}

export function PageLoading({
  text = 'Loading...',
  showSpinner = true,
  fullScreen = false,
  className,
  ...props
}: PageLoadingProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-8',
        fullScreen && 'min-h-screen',
        className
      )}
      {...props}
    >
      {showSpinner && <LoadingSpinner size="lg" text={text} />}
      {!showSpinner && (
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-muted rounded-full animate-pulse mx-auto" />
          <p className="text-muted-foreground animate-pulse">{text}</p>
        </div>
      )}
    </div>
  );

  return fullScreen ? (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      {content}
    </div>
  ) : (
    content
  );
}

// Content loading wrapper
export interface ContentLoadingProps  extends BaseSkeletonProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeleton?: React.ReactNode;
}

export function ContentLoading({
  isLoading,
  children,
  fallback,
  skeleton,
  className,
  ...props
}: ContentLoadingProps) {
  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)} {...props}>
        {skeleton || fallback || <PageLoading text="Loading content..." />}
      </div>
    );
  }

  return <>{children}</>;
}

// Button loading wrapper
export interface ButtonLoadingProps  extends BaseSkeletonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
}

export function ButtonLoading({
  isLoading,
  children,
  loadingText = 'Loading...',
  disabled = false,
  className,
  ...props
}: ButtonLoadingProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isLoading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
}

// Image loading component
export interface ImageLoadingProps  extends BaseSkeletonProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ImageLoading({
  src,
  alt,
  fallbackSrc,
  onLoad,
  onError,
  className,
  loading: skeletonLoading,
  children,
  avatar,
  paragraph,
  active,
  round,
  testId,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabeledBy,
  ...imgProps
}: ImageLoadingProps) {
  const [imageState, setImageState] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = React.useState(src);

  React.useEffect(() => {
    setImageState('loading');
    setCurrentSrc(src);

    const img = new Image();
    img.onload = () => {
      setImageState('loaded');
      onLoad?.();
    };
    img.onerror = () => {
      setImageState('error');
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        // Retry with fallback
        setTimeout(() => {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setImageState('loaded');
          };
          fallbackImg.onerror = () => {
            setImageState('error');
            onError?.();
          };
          fallbackImg.src = fallbackSrc;
        }, 100);
      } else {
        onError?.();
      }
    };
    img.src = src;
  }, [src, fallbackSrc, currentSrc, onLoad, onError]);

  if (imageState === 'loading') {
    return (
      <div
        className={cn('bg-muted rounded animate-pulse', className)}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabeledBy}
      />
    );
  }

  if (imageState === 'error') {
    return (
      <div
        className={cn(
          'bg-muted rounded flex items-center justify-center text-muted-foreground',
          className
        )}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabeledBy}
      >
        <span className="text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn('transition-opacity duration-300', className)}
      onLoad={() => setImageState('loaded')}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-labelledby={ariaLabeledBy}
      {...imgProps}
    />
  );
}

export default {
  LoadingSpinner,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  PageLoading,
  ContentLoading,
  ButtonLoading,
  ImageLoading,
};
