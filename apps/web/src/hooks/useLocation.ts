// ═══════════════════════════════════════════════════════════════
// HOOK: useLocation — GPS watcher with watchPosition + cleanup
// Stack: Vite + React 18 — NO Next.js, NO 'use client'
// Upgraded: continuous watch, accuracy, permission-state API,
//           loading flag, full JSDoc, strict TypeScript
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeoState {
  /** WGS-84 latitude, null until first fix */
  latitude: number | null;
  /** WGS-84 longitude, null until first fix */
  longitude: number | null;
  /** Accuracy radius in metres */
  accuracy: number | null;
  /** ISO error message if denied/unavailable */
  error: string | null;
  /** True while waiting for first fix */
  loading: boolean;
  /** Browser permission state — 'granted' | 'denied' | 'prompt' | null */
  permission: PermissionState | null;
}

const INITIAL: GeoState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  error: null,
  loading: true,
  permission: null,
};

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 30_000,
};

/**
 * Continuously watches the user's GPS position.
 * Falls back gracefully when geolocation is unavailable or denied.
 *
 * @example
 * const { latitude, longitude, error, loading } = useLocation();
 */
export function useLocation(): GeoState & { refresh: () => void } {
  const [state, setState] = useState<GeoState>(INITIAL);
  const watchIdRef = useRef<number | null>(null);

  const startWatch = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    // Clear any existing watch before starting a new one
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setState({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          error: null,
          loading: false,
          permission: 'granted',
        });
      },
      (err) => {
        const permission: PermissionState =
          err.code === err.PERMISSION_DENIED ? 'denied' : 'prompt';
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message,
          permission,
        }));
      },
      GEO_OPTIONS,
    );

    // Query permission state if supported
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setState((s) => ({ ...s, permission: result.state }));
          result.onchange = () =>
            setState((s) => ({ ...s, permission: result.state }));
        })
        .catch(() => {/* permission API not available — silently ignore */});
    }
  }, []);

  useEffect(() => {
    startWatch();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startWatch]);

  return { ...state, refresh: startWatch };
}
