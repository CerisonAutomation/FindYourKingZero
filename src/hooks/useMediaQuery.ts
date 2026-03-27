/**
 * useMediaQuery.ts — Responsive design hook for React
 *
 * Features:
 * - Subscribe to CSS media query changes
 * - SSR-safe with defaultValue option
 * - Works with Tailwind CSS breakpoints
 * - Supports custom media queries
 *
 * Based on:
 * - shadcn/ui useMediaQuery: https://www.shadcn.io/hooks/use-media-query
 * - usehooks-ts implementation: https://usehooks-ts.com/react-hook/use-media-query
 */

import { useState, useEffect, useCallback } from 'react';

interface UseMediaQueryOptions {
  /** Default value for SSR / initial render */
  defaultValue?: boolean;
  /** Whether to initialize with the actual value (can cause hydration mismatch in SSR) */
  initializeWithValue?: boolean;
}

/**
 * Hook to track CSS media query state
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @param options - Configuration options
 * @returns boolean indicating if media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const { defaultValue = false, initializeWithValue = true } = options;

  const [matches, setMatches] = useState(() => {
    if (!initializeWithValue) return defaultValue;

    // Check if window is available (client-side)
    if (typeof window === 'undefined') return defaultValue;

    return window.matchMedia(query).matches;
  });

  // Memoized handler to prevent unnecessary re-renders
  const handleChange = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    // Guard for SSR
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern API (addEventListener)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy API fallback (addListener) for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [query, handleChange]);

  return matches;
}

// Predefined breakpoints matching Tailwind CSS defaults
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

/**
 * Hook for Tailwind CSS breakpoint-based responsive design
 * @returns Object with boolean flags for each breakpoint
 *
 * @example
 * const { isSm, isMd, isLg, isXl, is2xl } = useBreakpoint();
 *
 * return (
 *   <div className={isMd ? 'grid-cols-2' : 'grid-cols-1'}>
 *     Responsive content
 *   </div>
 * );
 */
export function useBreakpoint() {
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const is2xl = useMediaQuery(breakpoints['2xl']);

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    // Utility getters for common patterns
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg,
  };
}

/**
 * Hook for responsive values based on breakpoints
 * @param values - Object with breakpoint keys and their values
 * @returns The value for the current breakpoint
 *
 * @example
 * const cols = useResponsiveValue({
 *   default: 1,
 *   sm: 2,
 *   md: 3,
 *   lg: 4,
 * });
 */
export function useResponsiveValue<T>(values: {
  default: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T {
  const { isSm, isMd, isLg, isXl, is2xl } = useBreakpoint();

  if (is2xl && values['2xl'] !== undefined) return values['2xl'];
  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;

  return values.default;
}

// Common media query hooks for accessibility and features
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', { defaultValue: false });
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)', { defaultValue: false });
}

export function usePrefersLightMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: light)', { defaultValue: true });
}

export function useHoverCapability(): boolean {
  return useMediaQuery('(hover: hover)', { defaultValue: true });
}

export function usePointerFine(): boolean {
  return useMediaQuery('(pointer: fine)', { defaultValue: true });
}

export function usePointerCoarse(): boolean {
  return useMediaQuery('(pointer: coarse)', { defaultValue: false });
}

// Container query hook (for component-level responsiveness)
interface UseContainerQueryOptions {
  width?: number;
  height?: number;
}

/**
 * Hook to observe container size changes
 * Uses ResizeObserver for performant size tracking
 */
export function useContainerQuery(
  ref: React.RefObject<Element>,
  options: UseContainerQueryOptions = {}
): { matches: boolean; width: number; height: number } {
  const { width: targetWidth, height: targetHeight } = options;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [ref]);

  const matchesWidth = targetWidth !== undefined ? dimensions.width >= targetWidth : true;
  const matchesHeight = targetHeight !== undefined ? dimensions.height >= targetHeight : true;

  return {
    matches: matchesWidth && matchesHeight,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * Check if mobile (below md breakpoint)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(breakpoints.md);
}

/**
 * Check if tablet (md to lg breakpoint)
 */
export function useIsTablet(): boolean {
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  return isMd && !isLg;
}

/**
 * Check if desktop (lg and above)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.lg);
}

/**
 * Check for touch device capability
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)', { defaultValue: false });
}

/**
 * Check for portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)', { defaultValue: true });
}

/**
 * Get current window dimensions
 */
export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export default useMediaQuery;
