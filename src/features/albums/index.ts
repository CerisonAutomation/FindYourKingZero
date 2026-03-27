/**
 * =============================================================================
 * ALBUMS FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL albums/photo management functionality.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/albums
 * @version 15.0.0
 */

// Pages
export { default as AlbumsPage } from './pages/AlbumsPage';

// Components (re-exported from components directory)
export { default as PhotoAlbums } from '@/components/PhotoAlbums';

// Hooks (re-exported from hooks directory)
export { useAlbums } from '@/hooks/useAlbums';
export { useProfilePhotos } from '@/hooks/useProfilePhotos';
export { useFileUpload } from '@/hooks/useFileUpload';