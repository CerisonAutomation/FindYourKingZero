/**
 * =============================================================================
 * BOOKINGS FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL booking functionality.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/bookings
 * @version 15.0.0
 */

// Pages
export { default as BookingsPage } from './pages/BookingsPage';

// Hooks (re-exported from hooks directory)
export { useBookings } from '@/hooks/useBookings';