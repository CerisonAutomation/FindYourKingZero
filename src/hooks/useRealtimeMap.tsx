/**
 * Enhanced Real-time Map with Leaflet Integration
 * Features: Real-time location updates, clustering, SOS alerts, P2P connections
 * Integrated from external/leaflet-realtime and other map libraries
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from './use-toast'
import { useAuth } from './useAuth'
import { useRealtimeLocationTracking } from './useRealtimeLocationTracking'

// Fix for default Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export interface MapMarker  {
  id: string
  userId: string
  userName: string
  position: L.LatLng
  accuracy: number
  lastUpdate: number
  isOnline: boolean
  isVerified: boolean
  deviceType: 'mobile' | 'desktop' | 'tablet'
  batteryLevel?: number
  isCharging?: boolean
  distance?: number
  profile?: {
    avatar?: string
    age?: number
    interests?: string[]
  }
}

export interface MapCluster  {
  id: string
  position: L.LatLng
  markers: MapMarker[]
  count: number
  bounds: L.LatLngBounds
}

export interface SOSMarker  extends MapMarker {
  sosData: {
    message: string
    timestamp: number
    resolved: boolean
  }
}

export interface RealtimeMapState  {
  isLoaded: boolean
  markers: Map<string, MapMarker>
  sosMarkers: Map<string, SOSMarker>
  clusters: Map<string, MapCluster>
  selectedMarker: MapMarker | null
  currentBounds: L.LatLngBounds | null
  userLocation: L.LatLng | null
  isTracking: boolean
  clusteringEnabled: boolean
  showSOSAlerts: boolean
  showOfflineUsers: boolean
}

export function useRealtimeMap(containerId: string = 'map') {
  const { user } = useAuth()
  const { toast } = useToast()
  const locationTracker = useRealtimeLocationTracking()

  const [state, setState] = useState<RealtimeMapState>({
    isLoaded: false,
    markers: new Map(),
    sosMarkers: new Map(),
    clusters: new Map(),
    selectedMarker: null,
    currentBounds: null,
    userLocation: null,
    isTracking: false,
    clusteringEnabled: true,
    showSOSAlerts: true,
    showOfflineUsers: false
  })

  // Refs
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const sosLayerRef = useRef<L.LayerGroup | null>(null)
  const clustersLayerRef = useRef<L.LayerGroup | null>(null)
  const realtimeLayerRef = useRef<any>(null)

  // Device type icons
  const getDeviceIcon = useCallback((deviceType: string, isOnline: boolean, isVerified: boolean) => {
    const iconUrl = deviceType === 'mobile' 
      ? '📱' 
      : deviceType === 'tablet' 
        ? '📋' 
        : '💻'
    
    const color = isOnline 
      ? (isVerified ? '#10b981' : '#3b82f6') 
      : '#6b7280'

    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          position: relative;
        ">
          ${iconUrl}
          ${isVerified ? '<div style="position: absolute; top: -5px; right: -5px; background: #10b981; border: 2px solid white; border-radius: 50%; width: 12px; height: 12px;"></div>' : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
  }, [])

  // SOS alert icon
  const getSOSIcon = useCallback(() => {
    return L.divIcon({
      html: `
        <div style="
          background: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
          animation: pulse 2s infinite;
        ">
          🚨
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>
      `,
      className: 'sos-marker',
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    })
  }, [])

  // Cluster icon
  const getClusterIcon = useCallback((cluster: MapCluster) => {
    const count = cluster.markers.length
    const size = Math.min(60, 30 + count * 2)
    
    return L.divIcon({
      html: `
        <div style="
          background: #8b5cf6;
          border: 3px solid white;
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${Math.max(12, size / 4)}px;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
        ">
          ${count}
        </div>
      `,
      className: 'cluster-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
  }, [])

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!containerId || mapRef.current) return

    try {
      // Create map instance
      const map = L.map(containerId, {
        center: [40.7128, -74.0060], // Default to NYC
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      // Create layers
      markersLayerRef.current = L.layerGroup().addTo(map)
      sosLayerRef.current = L.layerGroup().addTo(map)
      clustersLayerRef.current = L.layerGroup().addTo(map)

      // Store map reference
      mapRef.current = map
      setState(prev => ({ ...prev, isLoaded: true }))

      // Setup real-time layer
      setupRealtimeLayer()

      toast({
        title: 'Map Loaded',
        description: 'Real-time map is ready.',
      })
    } catch (error) {
      console.error('Failed to initialize map:', error)
      toast({
        title: 'Map Error',
        description: 'Failed to load the map.',
        variant: 'destructive'
      })
    }
  }, [containerId, toast])

  // Setup real-time layer for location updates
  const setupRealtimeLayer = useCallback(() => {
    if (!mapRef.current) return

    // Custom real-time layer implementation
    const realtimeLayer = {
      update: async () => {
        try {
          // Fetch active users with locations
          const { data: locations, error } = await supabase
            .from('user_locations')
            .select('*')
            .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
            .order('updated_at', { ascending: false })

          if (error) throw error

          // Update markers
          locations?.forEach(location => {
            const marker: MapMarker = {
              id: location.user_id,
              userId: location.user_id,
              userName: location.user_name || 'Anonymous',
              position: L.latLng(location.latitude, location.longitude),
              accuracy: location.accuracy,
              lastUpdate: new Date(location.updated_at).getTime(),
              isOnline: true,
              isVerified: location.is_verified || false,
              deviceType: location.device_info?.deviceType || 'mobile',
              batteryLevel: location.device_info?.batteryLevel,
              isCharging: location.device_info?.isCharging
            }

            updateMarker(marker)
          })

          // Remove offline markers
          const cutoff = Date.now() - 5 * 60 * 1000
          state.markers.forEach((marker, id) => {
            if (marker.lastUpdate < cutoff) {
              removeMarker(id)
            }
          })

        } catch (error) {
          console.error('Failed to update real-time locations:', error)
        }
      },

      start: () => {
        // Update every 30 seconds
        setInterval(realtimeLayer.update, 30000)
        realtimeLayer.update()
      },

      stop: () => {
        // Implementation for stopping updates
      }
    }

    realtimeLayerRef.current = realtimeLayer
    realtimeLayer.start()
  }, [state.markers])

  // Update marker on map
  const updateMarker = useCallback((marker: MapMarker) => {
    if (!markersLayerRef.current) return

    // Remove existing marker if it exists
    const existingMarker = markersLayerRef.current.getLayers().find(
      layer => (layer as any).markerId === marker.id
    )
    
    if (existingMarker) {
      markersLayerRef.current.removeLayer(existingMarker)
    }

    // Create new marker
    const leafletMarker = L.marker(marker.position, {
      icon: getDeviceIcon(marker.deviceType, marker.isOnline, marker.isVerified)
    })

    leafletMarker.markerId = marker.id

    // Add popup
    const popupContent = `
      <div style="min-width: 200px;">
        <div style="font-weight: bold; margin-bottom: 8px;">${marker.userName}</div>
        <div style="font-size: 12px; color: #666;">
          <div>📍 ${marker.position.lat.toFixed(4)}, ${marker.position.lng.toFixed(4)}</div>
          <div>📱 ${marker.deviceType}</div>
          ${marker.batteryLevel ? `<div>🔋 ${marker.batteryLevel}% ${marker.isCharging ? '⚡' : ''}</div>` : ''}
          <div>🕐 ${new Date(marker.lastUpdate).toLocaleTimeString()}</div>
        </div>
        <div style="margin-top: 8px;">
          <button onclick="window.mapActions?.viewProfile('${marker.userId}')" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            margin-right: 4px;
            cursor: pointer;
          ">View Profile</button>
          <button onclick="window.mapActions?.sendMessage('${marker.userId}')" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
          ">Message</button>
        </div>
      </div>
    `

    leafletMarker.bindPopup(popupContent)
    leafletMarker.addTo(markersLayerRef.current)

    // Update state
    setState(prev => ({
      ...prev,
      markers: new Map(prev.markers).set(marker.id, marker)
    }))
  }, [getDeviceIcon])

  // Remove marker from map
  const removeMarker = useCallback((markerId: string) => {
    if (!markersLayerRef.current) return

    const marker = markersLayerRef.current.getLayers().find(
      layer => (layer as any).markerId === markerId
    )
    
    if (marker) {
      markersLayerRef.current.removeLayer(marker)
    }

    setState(prev => {
      const newMarkers = new Map(prev.markers)
      newMarkers.delete(markerId)
      return { ...prev, markers: newMarkers }
    })
  }, [])

  // Add SOS marker
  const addSOSMarker = useCallback((sosMarker: SOSMarker) => {
    if (!sosLayerRef.current) return

    const leafletMarker = L.marker(sosMarker.position, {
      icon: getSOSIcon()
    })

    leafletMarker.markerId = sosMarker.id

    const popupContent = `
      <div style="min-width: 250px;">
        <div style="color: #ef4444; font-weight: bold; margin-bottom: 8px;">🚨 EMERGENCY ALERT</div>
        <div style="font-weight: bold; margin-bottom: 8px;">${sosMarker.userName}</div>
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
          <div>📍 ${sosMarker.position.lat.toFixed(4)}, ${sosMarker.position.lng.toFixed(4)}</div>
          <div>🕐 ${new Date(sosMarker.sosData.timestamp).toLocaleString()}</div>
          <div>${sosMarker.sosData.message}</div>
        </div>
        <div style="margin-top: 8px;">
          <button onclick="window.mapActions?.helpUser('${sosMarker.userId}')" style="
            background: #ef4444;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
          ">Offer Help</button>
        </div>
      </div>
    `

    leafletMarker.bindPopup(popupContent)
    leafletMarker.addTo(sosLayerRef.current)

    setState(prev => ({
      ...prev,
      sosMarkers: new Map(prev.sosMarkers).set(sosMarker.id, sosMarker)
    }))
  }, [getSOSIcon])

  // Cluster markers
  const clusterMarkers = useCallback(() => {
    if (!state.clusteringEnabled || !mapRef.current) return

    const markers = Array.from(state.markers.values())
    const clusters = new Map<string, MapCluster>()

    // Simple clustering algorithm
    markers.forEach(marker => {
      const gridKey = `${Math.floor(marker.position.lat * 100)},${Math.floor(marker.position.lng * 100)}`
      
      if (!clusters.has(gridKey)) {
        clusters.set(gridKey, {
          id: gridKey,
          position: marker.position,
          markers: [],
          count: 0,
          bounds: L.latLngBounds(marker.position, marker.position)
        })
      }

      const cluster = clusters.get(gridKey)!
      cluster.markers.push(marker)
      cluster.count++
      cluster.bounds.extend(marker.position)
    })

    // Create cluster markers
    clustersLayerRef.current?.clearLayers()
    
    clusters.forEach(cluster => {
      if (cluster.count > 1) {
        const clusterMarker = L.marker(cluster.position, {
          icon: getClusterIcon(cluster)
        })

        const popupContent = `
          <div style="text-align: center;">
            <div style="font-weight: bold;">${cluster.count} Users Nearby</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              ${cluster.markers.slice(0, 3).map(m => m.userName).join(', ')}
              ${cluster.markers.length > 3 ? ` +${cluster.markers.length - 3} more` : ''}
            </div>
          </div>
        `

        clusterMarker.bindPopup(popupContent)
        clusterMarker.addTo(clustersLayerRef.current!)
      }
    })

    setState(prev => ({ ...prev, clusters }))
  }, [state.markers, state.clusteringEnabled, getClusterIcon])

  // Center map on user location
  const centerOnUser = useCallback(() => {
    if (!mapRef.current || !locationTracker.state.currentLocation) return

    const userLocation = L.latLng(
      locationTracker.state.currentLocation.latitude,
      locationTracker.state.currentLocation.longitude
    )

    mapRef.current.setView(userLocation, 15)
    setState(prev => ({ ...prev, userLocation }))
  }, [locationTracker.state.currentLocation])

  // Center on bounds
  const fitToBounds = useCallback(() => {
    if (!mapRef.current || state.markers.size === 0) return

    const bounds = L.latLngBounds(Array.from(state.markers.values()).map(m => m.position))
    mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    
    setState(prev => ({ ...prev, currentBounds: bounds }))
  }, [state.markers])

  // Toggle clustering
  const toggleClustering = useCallback(() => {
    const newState = !state.clusteringEnabled
    setState(prev => ({ ...prev, clusteringEnabled: newState }))
    
    if (newState) {
      clusterMarkers()
    } else {
      clustersLayerRef.current?.clearLayers()
    }
  }, [state.clusteringEnabled, clusterMarkers])

  // Initialize map on mount
  useEffect(() => {
    initializeMap()

    // Expose global actions for popup buttons
    window.mapActions = {
      viewProfile: (userId: string) => {
        console.log('View profile:', userId)
        // Navigate to profile
      },
      sendMessage: (userId: string) => {
        console.log('Send message:', userId)
        // Open chat
      },
      helpUser: (userId: string) => {
        console.log('Help user:', userId)
        // Offer help for SOS
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      delete window.mapActions
    }
  }, [initializeMap])

  // Update clustering when markers change
  useEffect(() => {
    if (state.clusteringEnabled) {
      clusterMarkers()
    }
  }, [state.markers, state.clusteringEnabled, clusterMarkers])

  // Listen for SOS alerts
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('sos_alerts')
      .on('broadcast', { event: 'sos_alert' }, (payload) => {
        const sosData = payload.payload
        const sosMarker: SOSMarker = {
          id: sosData.id,
          userId: sosData.userId,
          userName: sosData.userName,
          position: L.latLng(sosData.location.latitude, sosData.location.longitude),
          accuracy: sosData.location.accuracy,
          lastUpdate: sosData.timestamp,
          isOnline: true,
          isVerified: false,
          deviceType: 'mobile',
          sosData: {
            message: sosData.message,
            timestamp: sosData.timestamp,
            resolved: sosData.resolved
          }
        }

        addSOSMarker(sosMarker)

        toast({
          title: '🚨 Emergency Alert',
          description: `${sosMarker.userName} needs help nearby!`,
          variant: 'destructive'
        })
      })

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, addSOSMarker, toast])

  return {
    // State
    state,
    
    // Map controls
    initializeMap,
    centerOnUser,
    fitToBounds,
    toggleClustering,
    
    // Marker management
    updateMarker,
    removeMarker,
    addSOSMarker,
    
    // Getters
    map: mapRef.current,
    markersLayer: markersLayerRef.current,
    sosLayer: sosLayerRef.current,
    clustersLayer: clustersLayerRef.current,
    
    // Utility
    isSupported: typeof L !== 'undefined'
  }
}
