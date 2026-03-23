// ═══════════════════════════════════════════════════════════════
// HOOKS: useProximity — H3 hex grid + adaptive GPS
// Battery-efficient. Real hex clustering for nearby users.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { latLngToCell, cellToLatLng, gridDisk, cellArea } from 'h3-js';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

type GPSMode = 'active' | 'passive' | 'dormant';

interface UseProximityOptions {
  defaultMode?: GPSMode;
  resolution?: number;    // H3 resolution (default 8 = ~461m edge)
  maxRadiusKm?: number;   // Max proximity radius
}

export function useProximity(options: UseProximityOptions = {}) {
  const { defaultMode = 'dormant', resolution = 8, maxRadiusKm = 50 } = options;

  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [h3Hex, setH3Hex] = useState<string | null>(null);
  const [nearbyHexes, setNearbyHexes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<GPSMode>(defaultMode);
  const watchIdRef = useRef<number | null>(null);

  // Compute H3 hex and neighbors when position changes
  useEffect(() => {
    if (!position) return;
    const hex = latLngToCell(position.lat, position.lng, resolution);
    setH3Hex(hex);

    // Calculate ring size: each step ≈ 0.461km at res 8
    const rings = Math.min(Math.ceil(maxRadiusKm / 0.461), 50);
    const neighbors = gridDisk(hex, rings);
    setNearbyHexes(neighbors);
  }, [position, resolution, maxRadiusKm]);

  // Adaptive GPS with battery awareness
  const startWatching = useCallback((gpsMode: GPSMode) => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    // Clear existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const configs: Record<GPSMode, PositionOptions> = {
      active: { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 },
      passive: { enableHighAccuracy: false, maximumAge: 60_000, timeout: 15_000 },
      dormant: { enableHighAccuracy: false, maximumAge: 300_000, timeout: 30_000 },
    };

    if (gpsMode === 'dormant') {
      // Single shot, not watching
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          });
          setError(null);
        },
        (err) => setError(err.message),
        configs.dormant,
      );
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      (err) => setError(err.message),
      configs[gpsMode],
    );
  }, []);

  useEffect(() => {
    startWatching(mode);
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [mode, startWatching]);

  // Convert hex to lat/lng (for map markers)
  const hexToCoords = useCallback((hex: string): [number, number] => {
    const [lat, lng] = cellToLatLng(hex);
    return [lng, lat]; // MapLibre order
  }, []);

  // Check if two hexes are within N rings
  const areNearby = useCallback((hexA: string, hexB: string, maxRings = 2): boolean => {
    try {
      const neighbors = gridDisk(hexA, maxRings);
      return neighbors.includes(hexB);
    } catch {
      return false;
    }
  }, []);

  // H3 cell area in km²
  const getHexArea = useCallback((hex: string): number => {
    return cellArea(hex, 'km2');
  }, []);

  return {
    position,
    h3Hex,
    nearbyHexes,
    error,
    mode,
    setMode,           // Switch GPS mode reactively
    hexToCoords,
    areNearby,
    getHexArea,
  };
}
