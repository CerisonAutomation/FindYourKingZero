/**
 * =============================================================================
 * SETTINGS FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL settings functionality.
 * Consolidates: Account, Security, Privacy, Notifications, Content, Subscription
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/settings
 * @version 15.0.0
 */

// Pages
export { default as SettingsPage } from './pages/SettingsPage';
export { default as SettingsAccount } from './pages/SettingsAccount';
export { default as SettingsContent } from './pages/SettingsContent';
export { default as SettingsNotifications } from './pages/SettingsNotifications';
export { default as SettingsPrivacy } from './pages/SettingsPrivacy';
export { default as SettingsSecurity } from './pages/SettingsSecurity';
export { default as SubscriptionPage } from './pages/SubscriptionPage';

// Components (re-exported from components directory)
export { default as SettingsPanel } from '@/components/SettingsPanel';
export { default as SubscriptionPlans } from '@/components/SubscriptionPlans';

// Hooks (re-exported from hooks directory)
export { useSubscription } from '@/hooks/useSubscription';
export { usePayments } from '@/hooks/usePayments';