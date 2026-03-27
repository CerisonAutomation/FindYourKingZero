/**
 * =============================================================================
 * COMPONENTS — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL components.
 * Consolidates all component subdirectories.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module components
 * @version 15.0.0
 */

// AI Components
export * from './ai';

// Auth Components (re-exports from canonical auth)
export * from './auth';

// Chat Components
export * from './chat';

// Dating Components
export * from './dating';

// Effects Components
export * from './effects';

// GDPR Components
export * from './gdpr';

// Maps Components
export * from './maps';

// Marketing Components
export * from './marketing';

// Onboarding Components
export * from './onboarding';

// Profile Components
export * from './profile';

// Settings Components
export * from './settings';

// Tabs Components
export * from './tabs';

// Transitions Components
export * from './transitions';

// UI Components
export * from './ui';

// Verification Components
export * from './verification';

// Voice Components
export * from './voice';

// Root-level components (legacy/standalone)
export { default as AIAssistant } from './AIAssistant';
export { default as AICoachingPanel } from './AICoachingPanel';
export { default as AIFloatingButton } from './AIFloatingButton';
export { default as AIKing } from './AIKing';
export { default as AnalyticsDashboard } from './AnalyticsDashboard';
export { default as DatingGrid } from './DatingGrid';
export { default as EnterpriseMainApp } from './EnterpriseMainApp';
export { default as FilterDialog } from './FilterDialog';
export { default as LiveLocationMap } from './LiveLocationMap';
export { default as MatchesGrid } from './MatchesGrid';
export { default as MessageReactions } from './MessageReactions';
export { default as MessagingInterface } from './MessagingInterface';
export { default as NavLink } from './NavLink';
export { default as NotificationsPanel } from './NotificationsPanel';
export { default as PartyMap } from './PartyMap';
export { default as PhotoAlbums } from './PhotoAlbums';
export { default as ProfileCard } from './ProfileCard';
export { default as ProfileDetail } from './ProfileDetail';
export { default as ProfilePhotosGallery } from './ProfilePhotosGallery';
export { default as ProfileView } from './ProfileView';
export { default as PWAInstallBanner } from './PWAInstallBanner';
export { default as PWAUpdatePrompt } from './PWAUpdatePrompt';
export { default as SettingsPanel } from './SettingsPanel';
export { default as SubscriptionPlans } from './SubscriptionPlans';
export { default as ThemeFactory } from './ThemeFactory';