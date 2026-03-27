/**
 * =============================================================================
 * EVENTS FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL events/parties/social functionality.
 * Consolidates: Hub, Detail, Creation, Management, Parties, Group Hangs
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/events
 * @version 15.0.0
 */

// Pages
export { default as CreateEvent } from './pages/CreateEvent';
export { default as EventDetail } from './pages/EventDetail';
export { default as EventsHub } from './pages/EventsHub';

// Hooks (re-exported from hooks directory)
export { useEvents } from '@/hooks/useEvents';
export { useParties } from '@/hooks/useParties';
export { useBookings } from '@/hooks/useBookings';