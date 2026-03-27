/**
 * =============================================================================
 * ADMIN FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL admin dashboard functionality.
 * Consolidates: Reports, Moderation, Audit, Metrics
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/admin
 * @version 15.0.0
 */

// Pages
export { default as AdminAudit } from './pages/AdminAudit';
export { default as AdminHome } from './pages/AdminHome';
export { default as AdminMetrics } from './pages/AdminMetrics';
export { default as AdminModeration } from './pages/AdminModeration';
export { default as AdminReports } from './pages/AdminReports';

// Components (re-exported from components directory)
export { default as AnalyticsDashboard } from '@/components/AnalyticsDashboard';

// Hooks (re-exported from hooks directory)
export { useReports } from '@/hooks/useReports';