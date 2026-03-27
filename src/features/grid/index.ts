/**
 * =============================================================================
 * GRID FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL grid/nearby functionality.
 * Consolidates: Grid View, Profile Cards, Filtering, Proximity Search
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/grid
 * @version 15.0.0
 */

// Pages
export { default as GridPage } from './pages/GridPage';

// Components (re-exported from components directory)
export { default as DatingGrid } from '@/components/DatingGrid';
export { default as ProfileCard } from '@/components/ProfileCard';
export { default as FilterDialog } from '@/components/FilterDialog';

// Hooks (re-exported from hooks directory)
export { useProfileGrid } from '@/hooks/useProfileGrid';
export { useSwipe } from '@/hooks/useSwipe';