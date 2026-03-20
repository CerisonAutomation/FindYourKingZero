/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 LOCATION HOOKS - PostGIS-Optimized Location Services
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Replaces complex location system with PostGIS-optimized queries.
 * Inspired by Zenith Connect's efficient geospatial implementation.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface LocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

export interface NearbyProfile {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string
  gallery_urls: string[]
  age: number
  distance_km: number
  is_verified: boolean
  is_premium: boolean
  last_seen: string
  created_at: string
}

export interface LocationUpdateOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export interface UseLocationState {
  location: LocationCoordinates | null
  nearbyProfiles: NearbyProfile[]
  isLoading: boolean
  error: string | null
  permissionState: 'granted' | 'denied' | 'prompt' | 'not-available'
}

/**
 * Core location hook with PostGIS integration
 */
export function useLocation(options: LocationUpdateOptions = {}) {
  const { user } = useAuth()
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
  } = options

  const [state, setState] = useState<UseLocationState>({
    location: null,
    nearbyProfiles: [],
    isLoading: false,
    error: null,
    permissionState: 'prompt',
  })

  const watchIdRef = useRef<number>()
  const updateIntervalRef = useRef<NodeJS.Timeout>()

  // Get current position
  const getCurrentPosition = useCallback(async (): Promise<LocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not available'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }
          resolve(coords)
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )
    })
  }, [enableHighAccuracy, timeout, maximumAge])

  // Update location in database
  const updateLocationInDB = useCallback(async (coords: LocationCoordinates) => {
    if (!user) return

    try {
      const { error } = await supabase.rpc('update_user_location', {
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy ?? 100,
      })

      if (error) throw error
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }, [user])

  // Load nearby profiles using PostGIS
  const loadNearbyProfiles = useCallback(async (coords: LocationCoordinates) => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data, error } = await supabase.rpc('nearby_profiles', {
        user_lat: coords.latitude,
        user_lng: coords.longitude,
        max_distance_km: 50,
        limit_count: 50,
      })

      if (error) throw error

      setState(prev => ({
        ...prev,
        nearbyProfiles: data || [],
        isLoading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load nearby profiles',
        isLoading: false,
      }))
    }
  }, [user])

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        permissionState: 'not-available',
        error: 'Geolocation not available',
      }))
      return
    }

    try {
      // Get initial position
      const coords = await getCurrentPosition()
      setState(prev => ({ ...prev, location: coords }))

      // Update database and load nearby profiles
      await Promise.all([
        updateLocationInDB(coords),
        loadNearbyProfiles(coords),
      ])

      // Start watching for position changes
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const newCoords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          setState(prev => ({ ...prev, location: newCoords }))

          // Update database and nearby profiles
          await Promise.all([
            updateLocationInDB(newCoords),
            loadNearbyProfiles(newCoords),
          ])
        },
        (error) => {
          setState(prev => ({
            ...prev,
            error: `Location tracking error: ${error.message}`,
          }))
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )

      setState(prev => ({ ...prev, permissionState: 'granted' }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        permissionState: 'denied',
        error: error instanceof Error ? error.message : 'Location access denied',
      }))
    }
  }, [getCurrentPosition, updateLocationInDB, loadNearbyProfiles, enableHighAccuracy, timeout, maximumAge])

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = undefined
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = undefined
    }
  }, [])

  // Refresh nearby profiles
  const refreshNearbyProfiles = useCallback(async () => {
    if (!state.location) return
    await loadNearbyProfiles(state.location)
  }, [state.location, loadNearbyProfiles])

  // Check permission state
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permissionState: 'prompt' }))
      return
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setState(prev => ({ ...prev, permissionState: permission.state as any }))
    } catch (error) {
      setState(prev => ({ ...prev, permissionState: 'prompt' }))
    }
  }, [])

  // Initialize
  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  // Cleanup
  useEffect(() => {
    return stopTracking
  }, [stopTracking])

  return {
    ...state,
    startTracking,
    stopTracking,
    refreshNearbyProfiles,
    checkPermission,
  }
}

/**
 * Travel mode hook for location spoofing
 */
export function useTravelMode() {
  const { user } = useAuth()
  const [isTravelMode, setIsTravelMode] = useState(false)
  const [travelLocation, setTravelLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const enableTravelMode = useCallback(async (latitude: number, longitude: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          travel_mode: true,
          travel_location: `POINT(${longitude} ${latitude})`,
        })
        .eq('id', user.id)

      if (error) throw error

      setIsTravelMode(true)
      setTravelLocation({ latitude, longitude })
    } catch (error) {
      console.error('Failed to enable travel mode:', error)
    }
  }, [user])

  const disableTravelMode = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          travel_mode: false,
          travel_location: null,
        })
        .eq('id', user.id)

      if (error) throw error

      setIsTravelMode(false)
      setTravelLocation(null)
    } catch (error) {
      console.error('Failed to disable travel mode:', error)
    }
  }, [user])

  return {
    isTravelMode,
    travelLocation,
    enableTravelMode,
    disableTravelMode,
  }
}

/**
 * Geohash utilities for efficient clustering
 */
export const geohashUtils = {
  /**
   * Get geohash for coordinates (7 precision = ~150m accuracy)
   */
  getGeohash: (latitude: number, longitude: number, precision: number = 7): string => {
    // Simple geohash implementation - in production use a proper library
    const lat = latitude + 90
    const lng = longitude + 180
    const latBits = this.decimalToBinary(lat / 180, precision * 2)
    const lngBits = this.decimalToBinary(lng / 360, precision * 2)
    
    let geohash = ''
    for (let i = 0; i < precision * 2; i++) {
      geohash += i % 2 === 0 ? lngBits[i] : latBits[i]
    }
    
    return geohash
  },

  /**
   * Get neighboring geohashes
   */
  getNeighbors: (geohash: string): string[] => {
    // Simplified neighbor calculation
    const base = geohash.slice(0, -1)
    const lastChar = geohash.slice(-1)
    const neighbors = []
    
    // This is a simplified implementation
    // In production, use a proper geohash library
    for (let i = 0; i < 8; i++) {
      neighbors.push(base + String.fromCharCode(lastChar.charCodeAt(0) + i - 4))
    }
    
    return neighbors.filter(n => n >= '0' && n <= 'z')
  },

  /**
   * Convert decimal to binary string
   */
  decimalToBinary: (num: number, bits: number): string => {
    const binary = num.toString(2).padStart(bits, '0')
    return binary.slice(-bits)
  },
}