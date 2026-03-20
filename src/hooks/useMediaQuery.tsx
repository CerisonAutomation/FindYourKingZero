import {useEffect, useState} from 'react';
import {BREAKPOINTS} from '@/lib/constants';

/**
 * Hook to check if a media query matches
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Set initial value
        setMatches(mediaQuery.matches);

        // Add listener
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [query]);

    return matches;
}

/**
 * Convenient breakpoint hooks
 */
export function useIsMobile(): boolean {
    return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
}

export function useIsTablet(): boolean {
    return useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
}

export function useIsDesktop(): boolean {
    return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
}

export function useIsLargeDesktop(): boolean {
    return useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
}

/**
 * Check for reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
    return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Check for dark mode preference
 */
export function usePrefersDarkMode(): boolean {
    return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Check for touch device
 */
export function useIsTouchDevice(): boolean {
    return useMediaQuery('(hover: none) and (pointer: coarse)');
}

/**
 * Check for portrait orientation
 */
export function useIsPortrait(): boolean {
    return useMediaQuery('(orientation: portrait)');
}

/**
 * Get current breakpoint name
 */
export function useBreakpoint(): 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
    const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
    const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
    const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
    const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
    const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);

    if (is2xl) return '2xl';
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    return 'sm';
}

/**
 * Get window dimensions
 */
export function useWindowSize(): { width: number; height: number } {
    const [size, setSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

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
