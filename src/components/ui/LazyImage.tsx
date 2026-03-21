import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  fallbackSrc?: string;
  /** Show shimmer placeholder while loading */
  shimmer?: boolean;
  /** Fade-in duration in ms */
  fadeInMs?: number;
  /** Root margin for IntersectionObserver (pre-load distance) */
  rootMargin?: string;
  /** Object-fit style */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage — IntersectionObserver-based lazy image loader.
 * - Shimmer placeholder while out of viewport / loading
 * - Smooth fade-in once loaded
 * - Graceful error fallback
 */
export function LazyImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackSrc = "/placeholder.svg",
  shimmer = true,
  fadeInMs = 400,
  rootMargin = "200px",
  objectFit = "cover",
  onLoad,
  onError,
}: LazyImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Intersection Observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  }, [onError]);

  const resolvedSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-muted", wrapperClassName)}
    >
      {/* Shimmer placeholder */}
      {shimmer && !isLoaded && (
        <div className="absolute inset-0 shimmer-bg animate-shimmer" />
      )}

      {/* Actual image — only mounted when in view */}
      {isInView && (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          style={{
            objectFit,
            transitionDuration: `${fadeInMs}ms`,
          }}
        />
      )}

      {/* Error fallback overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <svg
            className="w-8 h-8 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default LazyImage;
