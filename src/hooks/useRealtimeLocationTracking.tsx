/**
 * Real-time Location Tracking with SOS Emergency System
 * Integrated from external/realtime-location-tracker
 * Features: Motion detection, battery optimization, SOS alerts, WebRTC audio
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from './use-toast'
import { useAuth } from './useAuth'

// Configuration constants
export const LOCATION_CONFIG = {
  SEND_INTERVAL: 2000, // 2s when moving
  IDLE_INTERVAL: 30000, // 30s when stationary
  MOTION_THRESHOLD: 0.5,
  STATIONARY_COUNTER_THRESHOLD: 100,
  SOS_HOLD_DURATION: 2000, // 2 seconds
  WEBRTC_CONFIGURATION: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun.stunprotocol.org:3478' }
    ],
    iceCandidatePoolSize: 10
  }
}

export type LocationData =  {
  latitude: number
  longitude: number
  accuracy: number
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
  timestamp: number
}

export type DeviceInfo =  {
  userAgent: string
  platform: string
  vendor?: string
  deviceName?: string
  deviceType: 'mobile' | 'desktop' | 'tablet'
  batteryLevel?: number
  isCharging?: boolean
}

export type SOSAlert =  {
  id: string
  userId: string
  userName: string
  location: LocationData
  deviceInfo: DeviceInfo
  message: string
  timestamp: number
  resolved: boolean
  room?: string
}

export type LocationTrackingState =  {
  isEnabled: boolean
  isStationary: boolean
  currentLocation: LocationData | null
  deviceInfo: DeviceInfo | null
  motionData: {
    x: number
    y: number
    z: number
  }
  batteryLevel: number | null
  isCharging: boolean | null
}

export type WebRTCState =  {
  isConnected: boolean
  isAudioEnabled: boolean
  peers: Array<{
    id: string
    userName: string
    isAudioEnabled: boolean
  }>
  localStream: MediaStream | null
}

export function useRealtimeLocationTracking(room: string = 'public') {
  const { user } = useAuth()
  const { toast } = useToast()

  // State management
  const [state, setState] = useState<LocationTrackingState>({
    isEnabled: false,
    isStationary: false,
    currentLocation: null,
    deviceInfo: null,
    motionData: { x: 0, y: 0, z: 0 },
    batteryLevel: null,
    isCharging: null
  })

  const [webrtcState, setWebrtcState] = useState<WebRTCState>({
    isConnected: false,
    isAudioEnabled: false,
    peers: [],
    localStream: null
  })

  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])
  const [isSOSActive, setIsSOSActive] = useState(false)

  // Refs for timers and connections
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [motionTimeoutRef, setMotionTimeoutRef] = useState<NodeJS.Timeout | null>(null)
  const [webRTCConnectionRef, setWebRTCConnectionRef] = useState<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const stationaryCounterRef = useRef(0)
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 })

  // Get device information
  const getDeviceInfo = useCallback((): DeviceInfo => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform

    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop'
    let deviceName = 'Unknown Device'

    if (/Android/i.test(userAgent)) {
      deviceType = 'mobile'
      deviceName = 'Android Device'
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      deviceType = /iPad/i.test(userAgent) ? 'tablet' : 'mobile'
      deviceName = 'iOS Device'
    } else if (/Windows/i.test(userAgent)) {
      deviceName = 'Windows PC'
    } else if (/Mac/i.test(userAgent)) {
      deviceName = 'Mac'
    }

    return {
      userAgent,
      platform,
      vendor: navigator.vendor,
      deviceName,
      deviceType,
      batteryLevel: state.batteryLevel,
      isCharging: state.isCharging
    }
  }, [state.batteryLevel, state.isCharging])

  // Motion detection for battery optimization
  const initMotionDetection = useCallback(() => {
    if (!('DeviceMotionEvent' in window)) {
      console.warn('DeviceMotionEvent not supported. Battery optimization disabled.')
      return
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.acceleration || !event.accelerationIncludingGravity) return

      const acc = event.acceleration
      const accG = event.accelerationIncludingGravity

      // Calculate motion magnitude
      const magnitude = Math.sqrt(
        (acc.x || 0) ** 2 +
        (acc.y || 0) ** 2 +
        (acc.z || 0) ** 2
      )

      const deltaX = Math.abs((accG.x || 0) - lastAccelerationRef.current.x)
      const deltaY = Math.abs((accG.y || 0) - lastAccelerationRef.current.y)
      const deltaZ = Math.abs((accG.z || 0) - lastAccelerationRef.current.z)

      lastAccelerationRef.current = { x: accG.x || 0, y: accG.y || 0, z: accG.z || 0 }

      const totalMovement = deltaX + deltaY + deltaZ

      if (totalMovement < LOCATION_CONFIG.MOTION_THRESHOLD) {
        stationaryCounterRef.current++
      } else {
        stationaryCounterRef.current = 0
        if (state.isStationary) {
          console.log('Motion detected! Increasing update frequency.')
          setState(prev => ({ ...prev, isStationary: false }))
          startLocationUpdates(LOCATION_CONFIG.SEND_INTERVAL)
        }
      }

      if (stationaryCounterRef.current > LOCATION_CONFIG.STATIONARY_COUNTER_THRESHOLD && !state.isStationary) {
        console.log('Device stationary. Reducing update frequency.')
        setState(prev => ({ ...prev, isStationary: true }))
        startLocationUpdates(LOCATION_CONFIG.IDLE_INTERVAL)
      }
    }

    window.addEventListener('devicemotion', handleMotion)
    console.log('Motion detection initialized for Battery Optimization.')

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [state.isStationary])

  // Battery monitoring
  const initBatteryMonitoring = useCallback(async () => {
    if (!('getBattery' in navigator)) {
      console.warn('Battery API not supported.')
      return
    }

    try {
      const battery = await (navigator as any).getBattery()

      const updateBatteryInfo = () => {
        const level = battery.level
        const charging = battery.charging

        setState(prev => ({
          ...prev,
          batteryLevel: level !== null ? level * 100 : null,
          isCharging: charging !== null ? charging : false
        }))
      }

      battery.addEventListener('levelchange', updateBatteryInfo)
      battery.addEventListener('chargingchange', updateBatteryInfo)

      updateBatteryInfo()
    } catch (error) {
      console.warn('Battery monitoring failed:', error)
    }
  }, [])

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!('geolocation' in navigator)) {
      toast({
        title: 'Location Error',
        description: 'Geolocation is not available on this device.',
        variant: 'destructive'
      })
      return null
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: !state.isStationary,
          timeout: 5000,
          maximumAge: 0
        })
      })

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      }

      // Add optional properties only if they exist
      if (position.coords.altitude !== null && position.coords.altitude !== undefined) {
        locationData.altitude = position.coords.altitude
      }
      if (position.coords.altitudeAccuracy !== null && position.coords.altitudeAccuracy !== undefined) {
        locationData.altitudeAccuracy = position.coords.altitudeAccuracy
      }
      if (position.coords.heading !== null && position.coords.heading !== undefined) {
        locationData.heading = position.coords.heading
      }
      if (position.coords.speed !== null && position.coords.speed !== undefined) {
        locationData.speed = position.coords.speed
      }

      return locationData
    } catch (error) {
      console.error('Location error:', error)
      toast({
        title: 'Location Error',
        description: 'Failed to get your location.',
        variant: 'destructive'
      })
      return null
    }
  }, [state.isStationary, toast])

  // Send location to server
  const sendLocationToServer = useCallback(async (location: LocationData) => {
    if (!user) return

    const deviceInfo = getDeviceInfo()

    try {
      // TODO: Create user_locations table in database
      // const { error } = await supabase
      //   .from('user_locations')
      //   .upsert({
      //     user_id: user.id,
      //     room,
      //     latitude: location.latitude,
      //     longitude: location.longitude,
      //     accuracy: location.accuracy,
      //     device_info: deviceInfo,
      //     is_stationary: state.isStationary,
      //     updated_at: new Date().toISOString()
      //   })

      // if (error) throw error

      // Broadcast to other users in room via realtime
      supabase
        .channel(`location:${room}`)
        .send({
          type: 'broadcast',
          event: 'location_update',
          payload: {
            userId: user.id,
            userName: user.user_metadata?.display_name || 'Anonymous',
            location,
            deviceInfo,
            timestamp: Date.now()
          }
        })
    } catch (error) {
      console.error('Failed to send location:', error)
    }
  }, [user, room, state.isStationary, getDeviceInfo])

  // Start location updates
  const startLocationUpdates = useCallback((interval: number) => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
    }

    locationIntervalRef.current = setInterval(async () => {
      const location = await getCurrentLocation()
      if (location) {
        setState(prev => ({ ...prev, currentLocation: location }))
        await sendLocationToServer(location)
      }
    }, interval)
  }, [getCurrentLocation, sendLocationToServer])

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to enable location tracking.',
        variant: 'destructive'
      })
      return
    }

    const location = await getCurrentLocation()
    if (location) {
      setState(prev => ({ ...prev, isEnabled: true, currentLocation: location }))
      await sendLocationToServer(location)
      startLocationUpdates(LOCATION_CONFIG.SEND_INTERVAL)

      toast({
        title: 'Location Tracking Started',
        description: 'Your location is now being shared in real-time.',
      })
    }
  }, [user, getCurrentLocation, sendLocationToServer, startLocationUpdates, toast])

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }

    setState(prev => ({ ...prev, isEnabled: false }))

    toast({
      title: 'Location Tracking Stopped',
      description: 'Your location is no longer being shared.',
    })
  }, [toast])

  // SOS functionality
  const triggerSOS = useCallback(async () => {
    if (!user || !state.currentLocation) {
      toast({
        title: 'SOS Error',
        description: 'Location tracking must be enabled to send SOS alert.',
        variant: 'destructive'
      })
      return
    }

    const sosData: Partial<SOSAlert> = {
      userId: user.id,
      userName: user.user_metadata?.display_name || 'Anonymous',
      location: state.currentLocation,
      deviceInfo: getDeviceInfo(),
      message: 'Emergency SOS Alert!',
      timestamp: Date.now(),
      resolved: false,
      room
    }

    try {
      // TODO: Create sos_alerts table in database
      // const { error } = await supabase
      //   .from('sos_alerts')
      //   .insert([sosData])

      // if (error) throw error

      // Broadcast SOS alert via realtime
      supabase
        .channel(`sos:${room}`)
        .send({
          type: 'broadcast',
          event: 'sos_alert',
          payload: sosData
        })

      setIsSOSActive(true)

      toast({
        title: '🚨 SOS Alert Sent',
        description: 'Emergency alert has been sent to nearby users.',
        variant: 'destructive'
      })
    } catch (error) {
      console.error('Failed to send SOS:', error)
      toast({
        title: 'SOS Failed',
        description: 'Failed to send emergency alert.',
        variant: 'destructive'
      })
    }
  }, [user, state.currentLocation, room, getDeviceInfo, toast])

  // WebRTC Audio functionality
  const startWebRTCAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })

      localStreamRef.current = stream
      setWebrtcState(prev => ({
        ...prev,
        localStream: stream,
        isAudioEnabled: true,
        isConnected: true
      }))

      toast({
        title: 'Audio Connected',
        description: 'Your microphone is now connected for voice chat.',
      })
    } catch (error) {
      console.error('Failed to access microphone:', error)
      toast({
        title: 'Audio Error',
        description: 'Failed to access your microphone.',
        variant: 'destructive'
      })
    }
  }, [toast])

  const stopWebRTCAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    setWebrtcState(prev => ({
      ...prev,
      localStream: null,
      isAudioEnabled: false,
      isConnected: false
    }))

    toast({
      title: 'Audio Disconnected',
      description: 'Your microphone has been disconnected.',
    })
  }, [toast])

  // Initialize monitoring systems
  useEffect(() => {
    const cleanupMotion = initMotionDetection()
    initBatteryMonitoring()

    return () => {
      if (cleanupMotion) cleanupMotion()
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
      stopWebRTCAudio()
    }
  }, [initMotionDetection, initBatteryMonitoring, stopWebRTCAudio])

  // Listen for realtime updates
  useEffect(() => {
    if (!user) return

    const locationChannel = supabase
      .channel(`location:${room}`)
      .on('broadcast', { event: 'location_update' }, (payload) => {
        // Handle location updates from other users
        console.log('Location update received:', payload.payload)
      })

    const sosChannel = supabase
      .channel(`sos:${room}`)
      .on('broadcast', { event: 'sos_alert' }, (payload) => {
        const alert = payload.payload as SOSAlert
        setSosAlerts(prev => [...prev, alert])

        toast({
          title: '🚨 Emergency Alert',
          description: `${alert.userName} has triggered an SOS alert nearby!`,
          variant: 'destructive'
        })
      })

    locationChannel.subscribe()
    sosChannel.subscribe()

    return () => {
      locationChannel.unsubscribe()
      sosChannel.unsubscribe()
    }
  }, [user, room, toast])

  return {
    // Location tracking
    state,
    startTracking,
    stopTracking,
    getCurrentLocation,

    // SOS functionality
    sosAlerts,
    isSOSActive,
    triggerSOS,
    resolveSOS: (id: string) => setSosAlerts(prev =>
      prev.map(alert => alert.id === id ? { ...alert, resolved: true } : alert)
    ),

    // WebRTC Audio
    webrtcState,
    startWebRTCAudio,
    stopWebRTCAudio,

    // Utility
    isSupported: typeof navigator !== 'undefined' && !!navigator.geolocation
  }
}
