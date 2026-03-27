/**
 * =============================================================================
 * ONBOARDING FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL onboarding flow functionality.
 * Consolidates: Welcome, Basics, Photos, Tribes, Preferences, Location, Privacy, Notifications, Consent, Finish
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/onboarding
 * @version 15.0.0
 */

// Pages
export { default as OnboardingBasics } from './pages/OnboardingBasics';
export { default as OnboardingConsent } from './pages/OnboardingConsent';
export { default as OnboardingFinish } from './pages/OnboardingFinish';
export { default as OnboardingLocation } from './pages/OnboardingLocation';
export { default as OnboardingNotifications } from './pages/OnboardingNotifications';
export { default as OnboardingPhotos } from './pages/OnboardingPhotos';
export { default as OnboardingPreferences } from './pages/OnboardingPreferences';
export { default as OnboardingPrivacy } from './pages/OnboardingPrivacy';
export { default as OnboardingTribes } from './pages/OnboardingTribes';
export { default as OnboardingWelcome } from './pages/OnboardingWelcome';

// Hooks (re-exported from hooks directory)
export { useOnboarding } from '@/hooks/useOnboarding';
export { useConsent } from '@/hooks/useConsent';