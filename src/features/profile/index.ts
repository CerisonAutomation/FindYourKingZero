/**
 * =============================================================================
 * PROFILE FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL profile functionality.
 * Consolidates: Profile View, Edit, Photos, Albums
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/profile
 * @version 15.0.0
 */

// Pages
export { default as EditProfile } from './pages/EditProfile';
export { default as MePage } from './pages/MePage';
export { default as ProfilePhotosPage } from './pages/ProfilePhotosPage';
export { default as ViewProfile } from './pages/ViewProfile';

// Hooks (re-exported from hooks directory)
export { useProfile } from '@/hooks/useProfile';
export { useProfilePhotos } from '@/hooks/useProfilePhotos';
export { useAlbums } from '@/hooks/useAlbums';