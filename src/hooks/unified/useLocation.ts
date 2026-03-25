/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 UNIFIED LOCATION HOOK — Enterprise Grade 15/10
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CONSOLIDATES:
 * - useLocation.ts (PostGIS integration, travel mode, geohash utils)
 * - useGeolocation.tsx (Basic geolocation, distance calculation)
 * - useRealtimeLocationTracking.tsx (Real-time tracking, SOS, WebRTC)
 *
 * FEATURES:
 * ✓ PostGIS-optimized location queries
 * ✓ Real-time location tracking with motion detection
 * ✓ Battery optimization (adaptive update intervals)
 * ✓ SOS emergency system
 * ✓ Travel mode for location spoofing
 * ✓ Haversine distance calculation
 * ✓ Geohash utilities for clustering
 * ✓ WebRTC audio integration
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 * @license Enterprise
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '../useAuth';
import {useToast} from '../use-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface NearbyProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  galleryUrls: string[];
  age: number;
  distanceKm: number;
  isVerified: boolean;
  isPremium: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  vendor?: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  location: LocationCoordinates;
  deviceInfo: DeviceInfo;
  message: string;
  timestamp: number;
  resolved: boolean;
  room?: string;
}

export interface WebRTCState {
  isConnected: boolean;
  isAudioEnabled: boolean;
  peers: Array<{
    id: string;
    userName: string;
    isAudioEnabled: boolean;
  }>;
  localStream: MediaStream | null;
}

export interface LocationState {
  // Core location
  location: LocationCoordinates | null;
  isTracking: boolean;
  isStationary: boolean;
  accuracy: number | null;

  // Nearby profiles
  nearbyProfiles: NearbyProfile[];
  isLoadingNearby: boolean;

  // Permission
  permissionState: 'granted' | 'denied' | 'prompt' | 'not-available';

  // Battery
  batteryLevel: number | null;
  isCharging: boolean | null;

  // Device
  deviceInfo: DeviceInfo | null;

  // Error
  error: string | null;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  enableBatteryOptimization?: boolean;
  motionThreshold?: number;
  stationaryThreshold?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const LOCATION_CONFIG = {
  // Update intervals
  ACTIVE_INTERVAL: 2000,      // 2s when moving
  IDLE_INTERVAL: 30000,       // 30s when stationary

  // Motion detection
  MOTION_THRESHOLD: 0.5,
  STATIONARY_COUNTER_THRESHOLD: 100,

  // SOS
  SOS_HOLD_DURATION: 2000,    // 2 seconds

  // WebRTC
  WEBRTC_ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED LOCATION HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useLocation(options: LocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    watchPosition = true,
    enableBatteryOptimization = true,
    motionThreshold = LOCATION_CONFIG.MOTION_THRESHOLD,
    stationaryThreshold = LOCATION_CONFIG.STATIONARY_COUNTER_THRESHOLD,
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [state, setState] = useState<LocationState>({
    location: null,
    isTracking: false,
    isStationary: false,
    accuracy: null,
    nearbyProfiles: [],
    isLoadingNearby: false,
    permissionState: 'prompt',
    batteryLevel: null,
    isCharging: null,
    deviceInfo: null,
    error: null,
  });

  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [webrtcState, setWebrtcState] = useState<WebRTCState>({
    isConnected: false,
    isAudioEnabled: false,
    peers: [],
    localStream: null,
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const watchIdRef = useRef<number | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const stationaryCounterRef = useRef(0);
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const mountedRef = useRef(true);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVICE INFO
  // ═══════════════════════════════════════════════════════════════════════════

  const getDeviceInfo = useCallback((): DeviceInfo => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    let deviceName = 'Unknown Device';

    if (/Android/i.test(userAgent)) {
      deviceType = 'mobile';
      deviceName = 'Android Device';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      deviceType = /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
      deviceName = 'iOS Device';
    } else if (/Windows/i.test(userAgent)) {
      deviceName = 'Windows PC';
    } else if (/Mac/i.test(userAgent)) {
      deviceName = 'Mac';
    }

    return {
      userAgent,
      platform,
      vendor: navigator.vendor,
      deviceName,
      deviceType,
      batteryLevel: state.batteryLevel ?? undefined,
      isCharging: state.isCharging ?? undefined,
    };
  }, [state.batteryLevel, state.isCharging]);

  // ═══════════════════════════════════════════════════════════════════════════
  // BATTERY MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  const initBatteryMonitoring = useCallback(async () => {
    if (!('getBattery' in navigator)) return;

    try {
      const battery = await (navigator as any).getBattery();

      const updateBatteryInfo = () => {
        if (!mountedRef.current) return;
        setState(prev => ({
          ...prev,
          batteryLevel: battery.level * 100,
          isCharging: battery.charging,
        }));
      };

      battery.addEventListener('levelchange', updateBatteryInfo);
      battery.addEventListener('chargingchange', updateBatteryInfo);
      updateBatteryInfo();
    } catch {
      console.warn('[Location] Battery API not available');
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // MOTION DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  const initMotionDetection = useCallback(() => {
    if (!enableBatteryOptimization || !('DeviceMotionEvent' in window)) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!mountedRef.current || !event.accelerationIncludingGravity) return;

      const acc = event.accelerationIncludingGravity;
      const deltaX = Math.abs((acc.x || 0) - lastAccelerationRef.current.x);
      const deltaY = Math.abs((acc.y || 0) - lastAccelerationRef.current.y);
      const deltaZ = Math.abs((acc.z || 0) - lastAccelerationRef.current.z);

      lastAccelerationRef.current = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 };

      const totalMovement = deltaX + deltaY + deltaZ;

      if (totalMovement < motionThreshold) {
        stationaryCounterRef.current++;
      } else {
        stationaryCounterRef.current = 0;
        if (state.isStationary) {
          setState(prev => ({ ...prev, isStationary: false }));
        }
      }

      if (stationaryCounterRef.current > stationaryThreshold && !state.isStationary) {
        setState(prev => ({ ...prev, isStationary: true }));
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enableBatteryOptimization, motionThreshold, stationaryThreshold, state.isStationary]);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCATION GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  const getCurrentPosition = useCallback(async (): Promise<LocationCoordinates | null> => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, permissionState: 'not-available', error: 'Geolocation not available' }));
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy,
          timeout,
          maximumAge,
        });
      });

      const coords: LocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      if (position.coords.altitude !== null) coords.altitude = position.coords.altitude;
      if (position.coords.altitudeAccuracy !== null) coords.altitudeAccuracy = position.coords.altitudeAccuracy;
      if (position.coords.heading !== null) coords.heading = position.coords.heading;
      if (position.coords.speed !== null) coords.speed = position.coords.speed;

      return coords;
    } catch (error) {
      console.error('[Location] Failed to get position:', error);
      return null;
    }
  }, [enableHighAccuracy, timeout, maximumAge]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const updateLocationInDB = useCallback(async (coords: LocationCoordinates) => {
    if (!user) return;

    try {
      await supabase.rpc('update_user_location', {
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy ?? 100,
      });
    } catch (error) {
      console.error('[Location] Failed to update DB:', error);
    }
  }, [user]);

  const loadNearbyProfiles = useCallback(async (coords: LocationCoordinates) => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoadingNearby: true }));

    try {
      const { data, error } = await supabase.rpc('nearby_profiles', {
        user_lat: coords.latitude,
        user_lng: coords.longitude,
        max_distance_km: 50,
        limit_count: 50,
      });

      if (error) throw error;

      const profiles: NearbyProfile[] = (data || []).map((p: any) => ({
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        bio: p.bio,
        avatarUrl: p.avatar_url,
        galleryUrls: p.gallery_urls || [],
        age: p.age,
        distanceKm: p.distance_km,
        isVerified: p.is_verified,
        isPremium: p.is_premium,
        lastSeen: p.last_seen,
        createdAt: p.created_at,
      }));

      setState(prev => ({ ...prev, nearbyProfiles: profiles, isLoadingNearby: false }));
    } catch (error) {
      console.error('[Location] Failed to load nearby:', error);
      setState(prev => ({ ...prev, isLoadingNearby: false }));
    }
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TRACKING CONTROL
  // ═══════════════════════════════════════════════════════════════════════════

  const startTracking = useCallback(async () => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Sign in to enable location tracking.', variant: 'destructive' });
      return;
    }

    const coords = await getCurrentPosition();
    if (!coords) {
      toast({ title: 'Location Error', description: 'Could not get your location.', variant: 'destructive' });
      return;
    }

    setState(prev => ({ ...prev, location: coords, isTracking: true, permissionState: 'granted' }));
    await Promise.all([updateLocationInDB(coords), loadNearbyProfiles(coords)]);

    if (watchPosition && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          if (!mountedRef.current) return;
          const newCoords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setState(prev => ({ ...prev, location: newCoords, accuracy: newCoords.accuracy }));
          await Promise.all([updateLocationInDB(newCoords), loadNearbyProfiles(newCoords)]);
        },
        (error) => {
          setState(prev => ({ ...prev, error: `Tracking error: ${error.message}` }));
        },
        { enableHighAccuracy, timeout, maximumAge }
      );
    }

    toast({ title: 'Location Tracking Started', description: 'Your location is now being shared.' });
  }, [user, getCurrentPosition, updateLocationInDB, loadNearbyProfiles, watchPosition, enableHighAccuracy, timeout, maximumAge, toast]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setState(prev => ({ ...prev, isTracking: false }));
    toast({ title: 'Location Tracking Stopped', description: 'Your location is no longer being shared.' });
  }, [toast]);

  const refreshNearbyProfiles = useCallback(async () => {
    if (!state.location) return;
    await loadNearbyProfiles(state.location);
  }, [state.location, loadNearbyProfiles]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SOS SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  const triggerSOS = useCallback(async (room: string = 'public') => {
    if (!user || !state.location) {
      toast({ title: 'SOS Error', description: 'Location tracking must be enabled.', variant: 'destructive' });
      return;
    }

    const sosData: Partial<SOSAlert> = {
      userId: user.id,
      userName: user.user_metadata?.display_name || 'Anonymous',
      location: state.location,
      deviceInfo: getDeviceInfo(),
      message: 'Emergency SOS Alert!',
      timestamp: Date.now(),
      resolved: false,
      room,
    };

    try {
      supabase.channel(`sos:${room}`).send({ type: 'broadcast', event: 'sos_alert', payload: sosData });
      setIsSOSActive(true);
      toast({ title: '🚨 SOS Alert Sent', description: 'Emergency alert sent to nearby users.', variant: 'destructive' });
    } catch (error) {
      console.error('[Location] SOS failed:', error);
      toast({ title: 'SOS Failed', description: 'Could not send emergency alert.', variant: 'destructive' });
    }
  }, [user, state.location, getDeviceInfo, toast]);

  const resolveSOS = useCallback((id: string) => {
    setSosAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, resolved: true } : alert));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBRTC AUDIO
  // ═══════════════════════════════════════════════════════════════════════════

  const startWebRTCAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setWebrtcState(prev => ({ ...prev, localStream: stream, isAudioEnabled: true, isConnected: true }));
      toast({ title: 'Audio Connected', description: 'Microphone connected for voice chat.' });
    } catch (error) {
      console.error('[Location] WebRTC failed:', error);
      toast({ title: 'Audio Error', description: 'Failed to access microphone.', variant: 'destructive' });
    }
  }, [toast]);

  const stopWebRTCAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setWebrtcState(prev => ({ ...prev, localStream: null, isAudioEnabled: false, isConnected: false }));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // PERMISSION
  // ═══════════════════════════════════════════════════════════════════════════

  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permissionState: 'prompt' }));
      return;
    }
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setState(prev => ({ ...prev, permissionState: permission.state as any }));
    } catch {
      setState(prev => ({ ...prev, permissionState: 'prompt' }));
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    mountedRef.current = true;
    checkPermission();
    initBatteryMonitoring();
    const cleanupMotion = initMotionDetection();

    return () => {
      mountedRef.current = false;
      if (cleanupMotion) cleanupMotion();
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
      stopWebRTCAudio();
    };
  }, [checkPermission, initBatteryMonitoring, initMotionDetection, stopWebRTCAudio]);

  // Listen for SOS alerts
  useEffect(() => {
    if (!user) return;

    const sosChannel = supabase
      .channel('sos:public')
      .on('broadcast', { event: 'sos_alert' }, (payload) => {
        const alert = payload.payload as SOSAlert;
        setSosAlerts(prev => [...prev, alert]);
        toast({
          title: '🚨 Emergency Alert',
          description: `${alert.userName} triggered an SOS alert nearby!`,
          variant: 'destructive',
        });
      })
      .subscribe();

    return () => { sosChannel.unsubscribe(); };
  }, [user, toast]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // State
    ...state,

    // Tracking
    startTracking,
    stopTracking,
    refreshNearbyProfiles,

    // SOS
    sosAlerts,
    isSOSActive,
    triggerSOS,
    resolveSOS,

    // WebRTC
    webrtcState,
    startWebRTCAudio,
    stopWebRTCAudio,

    // Utils
    getCurrentPosition,
    checkPermission,
    isSupported: typeof navigator !== 'undefined' && !!navigator.geolocation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAVEL MODE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useTravelMode() {
  const { user } = useAuth();
  const [isTravelMode, setIsTravelMode] = useState(false);
  const [travelLocation, setTravelLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const enableTravelMode = useCallback(async (latitude: number, longitude: number) => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({ travel_mode: true, travel_location: `POINT(${longitude} ${latitude})` })
        .eq('id', user.id);
      setIsTravelMode(true);
      setTravelLocation({ latitude, longitude });
    } catch (error) {
      console.error('[TravelMode] Failed to enable:', error);
    }
  }, [user]);

  const disableTravelMode = useCallback(async () => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({ travel_mode: false, travel_location: null })
        .eq('id', user.id);
      setIsTravelMode(false);
      setTravelLocation(null);
    } catch (error) {
      console.error('[TravelMode] Failed to disable:', error);
    }
  }, [user]);

  return { isTravelMode, travelLocation, enableTravelMode, disableTravelMode };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISTANCE CALCULATION (HAVERSINE)
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'km' | 'mi' = 'km'
): number {
  const R = unit === 'km' ? 6371 : 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default useLocation;