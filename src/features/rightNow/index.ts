/**
 * =============================================================================
 * RIGHT NOW FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL RightNow/immediate meetup functionality.
 * Consolidates: Feed, Map, Real-time Status, MeetNow
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/rightNow
 * @version 15.0.0
 */

// Pages
export { default as RightNowFeed } from './pages/RightNowFeed';
export { default as RightNowMap } from './pages/RightNowMap';

// Hooks (re-exported from hooks directory)
export { useMeetNow } from '@/hooks/useMeetNow';
export { usePresence } from '@/hooks/usePresence';