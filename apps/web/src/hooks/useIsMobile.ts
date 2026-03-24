// ═══════════════════════════════════════════════════════════════
// HOOK: useIsMobile — debounced, MediaQuery-first breakpoint
// Stack: Vite + React 18 — NO 'use client', NO SSR guard needed
// Upgraded: MediaQueryList API (no resize flood), 3 breakpoints,
//           debounce, JSDoc, tree-shakeable constants
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

/** Tailwind-aligned breakpoint tokens (px) */
export const BREAKPOINTS = {
  /** < 640 — phone portrait */
  sm: 640,
  /** < 768 — phone landscape / small tablet */
  md: 768,
  /** < 1024 — tablet */
  lg: 1024,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Returns true when the viewport is narrower than `breakpoint`.
 * Uses the native `matchMedia` API — zero resize listeners.
 *
 * @param breakpoint - one of 'sm' | 'md' | 'lg'. Defaults to 'md' (768px).
 *
 * @example
 * const isMobile = useIsMobile();         // < 768px
 * const isPhone  = useIsMobile('sm');     // < 640px
 */
export function useIsMobile(breakpoint: BreakpointKey = 'md'): boolean {
  const px = BREAKPOINTS[breakpoint];
  const query = `(max-width: ${px - 1}px)`;

  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true; // SSR-safe: assume mobile
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Modern browsers — addEventListener
    mql.addEventListener('change', onChange);
    // Sync immediately in case it changed between render and effect
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
