/**
 * =============================================================================
 * NOTIFICATIONS FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL notification functionality.
 * Consolidates: Notifications Page, Push, Preferences
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/notifications
 * @version 15.0.0
 */

// Pages
export { default as NotificationsPage } from './pages/NotificationsPage';

// Components (re-exported from components directory)
export { default as NotificationsPanel } from '@/components/NotificationsPanel';

// Hooks (re-exported from hooks directory)
export { useNotifications } from '@/hooks/useNotifications';