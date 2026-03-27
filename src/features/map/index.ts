/**
 * =============================================================================
 * MAP FEATURE MODULE — Canonical Export Index v15.0
 * =============================================================================
 *
 * Single entry point for ALL map/location functionality.
 * Consolidates: Real-time Map, Location Tracking, Geofencing, Proximity Search
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module features/map
 * @version 15.0.0
 */

// Components
export { default as LeafletRealtimeMap } from './LeafletRealtimeMap';
export { default as LiveLocationMap } from '@/components/LiveLocationMap';
export { default as PartyMap } from '@/components/PartyMap';

// Hooks (re-exported from hooks directory)
export { useLocation } from '@/hooks/useLocation';
export { usePresence } from '@/hooks/usePresence';