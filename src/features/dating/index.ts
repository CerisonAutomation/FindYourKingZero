/**
 * =============================================================================
 * DATING FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL dating/matching functionality.
 * Consolidates: Grid, Profiles, Filters, Matching, Preferences, Taps, Footprints
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/dating
 * @version 15.0.0
 */

// Hooks
export { useOptimizedQuery } from './hooks/useOptimizedQuery';

// Store
export { useDatingStore } from './store/useDatingStore';

// Hooks (re-exported from hooks directory)
export { useDating } from '@/hooks/useDating';
export { useP2PMatchmaking } from '@/hooks/useP2PMatchmaking';
export { useMatches } from '@/hooks/useMatches';
export { useFavorites } from '@/hooks/useFavorites';
export { useAdvancedMatching } from '@/hooks/useAdvancedMatching';
export { useProfileGrid } from '@/hooks/useProfileGrid';
export { useSwipe } from '@/hooks/useSwipe';

// Components (re-exported from components directory)
export { default as DatingGrid } from '@/components/DatingGrid';
export { default as MatchesGrid } from '@/components/MatchesGrid';
export { default as ProfileCard } from '@/components/ProfileCard';
export { default as ProfileDetail } from '@/components/ProfileDetail';
export { default as ProfileView } from '@/components/ProfileView';
export { default as FilterDialog } from '@/components/FilterDialog';

// Types
export type {
  DatingStore,
  FilterState,
  Profile,
  Match,
  Location,
  DatingActions,
} from './types';