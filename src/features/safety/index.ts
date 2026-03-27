/**
 * =============================================================================
 * SAFETY FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL safety/security functionality.
 * Consolidates: Safety Center, Blocked Users, Reports
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/safety
 * @version 15.0.0
 */

// Pages
export { default as BlockedPage } from './pages/BlockedPage';
export { default as ReportsPage } from './pages/ReportsPage';
export { default as SafetyPage } from './pages/SafetyPage';

// Hooks (re-exported from hooks directory)
export { useSafetyFeatures } from '@/hooks/useSafetyFeatures';
export { useBlocks } from '@/hooks/useBlocks';
export { useReports } from '@/hooks/useReports';
export { useGDPR } from '@/hooks/useGDPR';