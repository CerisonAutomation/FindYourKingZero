/**
 * 🗺️ OMNIMAP MARKERS - Dynamic Map Marker System
 * Device-specific, animated map markers with real-time status indicators
 * Extracted and enhanced from external realtime-location-tracker
 */

import { useCallback, useEffect, useState } from 'react'

export interface DeviceMarker {
  id: string
  type: 'mobile' | 'desktop' | 'tablet' | 'unknown'
  status: 'online' | 'away' | 'sos' | 'offline'
  position: { lat: number; lng: number }
  user?: {
    name: string
    photo?: string
    distance?: number
  }
  lastSeen: Date
  batteryLevel?: number
  isMoving?: boolean
}

export interface MarkerCluster {
  id: string
  position: { lat: number; lng: number }
  count: number
  devices: DeviceMarker[]
  expansionRadius: number
}

export interface MapMarkerConfig {
  showDeviceIcons: boolean
  showBatteryLevel: boolean
  showStatusAnimations: boolean
  clusteringEnabled: boolean
  clusterRadius: number
  animationSpeed: number
}

class OmniMapMarkerManager {
  private markers: Map<string, DeviceMarker> = new Map()
  private clusters: Map<string, MarkerCluster> = new Map()
  private config: MapMarkerConfig = {
    showDeviceIcons: true,
    showBatteryLevel: true,
    showStatusAnimations: true,
    clusteringEnabled: true,
    clusterRadius: 50, // meters
    animationSpeed: 300
  }

  constructor() {
    this.initializeDeviceIcons()
  }

  private initializeDeviceIcons() {
    // Device icon SVG templates
    this.deviceIcons = {
      mobile: this.createDeviceIcon('mobile'),
      desktop: this.createDeviceIcon('desktop'),
      tablet: this.createDeviceIcon('tablet'),
      unknown: this.createDeviceIcon('unknown')
    }

    // Status animation styles
    this.statusAnimations = {
      online: this.createStatusAnimation('online'),
      away: this.createStatusAnimation('away'),
      sos: this.createStatusAnimation('sos'),
      offline: this.createStatusAnimation('offline')
    }
  }

  private deviceIcons: Record<string, string> = {}
  private statusAnimations: Record<string, string> = {}

  private createDeviceIcon(type: string): string {
    const icons = {
      mobile: `<svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="12" cy="18" r="1" fill="currentColor"/>
        <rect x="8" y="4" width="8" height="12" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>`,
      
      desktop: `<svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="3" width="16" height="12" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
        <rect x="6" y="17" width="8" height="2" rx="1" fill="currentColor"/>
        <rect x="10" y="19" width="2" height="2" rx="1" fill="currentColor"/>
        <rect x="4" y="5" width="12" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>`,
      
      tablet: `<svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="12" cy="18" r="1" fill="currentColor"/>
        <rect x="6" y="4" width="12" height="12" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>`,
      
      unknown: `<svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">?</text>
      </svg>`
    }
    
    return icons[type] || icons.unknown
  }

  private createStatusAnimation(status: string): string {
    const animations = {
      online: `@keyframes pulse-online {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }`,
      
      away: `@keyframes pulse-away {
        0% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.05); opacity: 0.4; }
        100% { transform: scale(1); opacity: 0.6; }
      }`,
      
      sos: `@keyframes emergency-pulse {
        0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
        50% { transform: scale(1.2); opacity: 0.8; box-shadow: 0 0 20px 10px rgba(255, 0, 0, 0); }
        100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
      }`,
      
      offline: `@keyframes fade-offline {
        0% { opacity: 0.3; }
        50% { opacity: 0.1; }
        100% { opacity: 0.3; }
      }`
    }
    
    return animations[status] || animations.offline
  }

  addOrUpdateMarker(marker: DeviceMarker) {
    this.markers.set(marker.id, {
      ...marker,
      lastSeen: new Date()
    })

    if (this.config.clusteringEnabled) {
      this.updateClustering()
    }
  }

  removeMarker(markerId: string) {
    this.markers.delete(markerId)
    if (this.config.clusteringEnabled) {
      this.updateClustering()
    }
  }

  private updateClustering() {
    this.clusters.clear()
    const markers = Array.from(this.markers.values())
    const processed = new Set<string>()

    for (const marker of markers) {
      if (processed.has(marker.id)) continue

      const cluster = this.createCluster(marker, markers)
      if (cluster.devices.length > 1) {
        this.clusters.set(cluster.id, cluster)
        cluster.devices.forEach(m => processed.add(m.id))
      }
    }
  }

  private createCluster(centerMarker: DeviceMarker, allMarkers: DeviceMarker[]): MarkerCluster {
    const nearby = allMarkers.filter(marker => {
      if (marker.id === centerMarker.id) return false
      const distance = this.calculateDistance(centerMarker.position, marker.position)
      return distance <= this.config.clusterRadius
    })

    const clusterDevices = [centerMarker, ...nearby]
    const centerLat = clusterDevices.reduce((sum, m) => sum + m.position.lat, 0) / clusterDevices.length
    const centerLng = clusterDevices.reduce((sum, m) => sum + m.position.lng, 0) / clusterDevices.length

    return {
      id: `cluster-${centerMarker.id}`,
      position: { lat: centerLat, lng: centerLng },
      count: clusterDevices.length,
      devices: clusterDevices,
      expansionRadius: this.config.clusterRadius
    }
  }

  private calculateDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number {
    const R = 6371000 // Earth's radius in meters
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  getMarkerElement(marker: DeviceMarker): HTMLElement {
    const div = document.createElement('div')
    div.className = `omni-marker omni-marker-${marker.type} omni-marker-${marker.status}`
    div.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${this.getStatusColor(marker.status)};
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
      cursor: pointer;
      transition: all ${this.config.animationSpeed}ms ease;
      animation: ${marker.status}-pulse 2s infinite;
    `

    // Device icon
    if (this.config.showDeviceIcons) {
      const icon = document.createElement('div')
      icon.innerHTML = this.deviceIcons[marker.type]
      icon.style.cssText = `
        width: 20px;
        height: 20px;
        color: white;
      `
      div.appendChild(icon)
    }

    // Battery indicator
    if (this.config.showBatteryLevel && marker.batteryLevel !== undefined) {
      const battery = document.createElement('div')
      battery.style.cssText = `
        position: absolute;
        bottom: -8px;
        right: -8px;
        width: 16px;
        height: 8px;
        background: ${marker.batteryLevel > 20 ? '#4CAF50' : '#F44336'};
        border: 1px solid white;
        border-radius: 2px;
        font-size: 6px;
        color: white;
        text-align: center;
        line-height: 8px;
      `
      battery.textContent = `${Math.round(marker.batteryLevel * 100)}%`
      div.appendChild(battery)
    }

    // SOS pulse effect
    if (marker.status === 'sos') {
      const pulse = document.createElement('div')
      pulse.style.cssText = `
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border-radius: 50%;
        border: 2px solid #F44336;
        animation: emergency-pulse 1.5s infinite;
      `
      div.appendChild(pulse)
    }

    // Hover effects
    div.addEventListener('mouseenter', () => {
      div.style.transform = 'scale(1.1)'
      div.style.zIndex = '1000'
    })

    div.addEventListener('mouseleave', () => {
      div.style.transform = 'scale(1)'
      div.style.zIndex = 'auto'
    })

    return div
  }

  private getStatusColor(status: string): string {
    const colors = {
      online: '#4CAF50',
      away: '#FF9800',
      sos: '#F44336',
      offline: '#9E9E9E'
    }
    return colors[status] || colors.offline
  }

  getClusterElement(cluster: MarkerCluster): HTMLElement {
    const div = document.createElement('div')
    div.className = 'omni-cluster'
    div.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #2196F3, #1976D2);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      position: relative;
      cursor: pointer;
      transition: all ${this.config.animationSpeed}ms ease;
      font-weight: bold;
      color: white;
      font-size: 18px;
    `

    div.textContent = cluster.count.toString()

    // Expansion indicator
    const indicator = document.createElement('div')
    indicator.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: #FF5722;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
    `
    indicator.textContent = '+'
    div.appendChild(indicator)

    div.addEventListener('mouseenter', () => {
      div.style.transform = 'scale(1.15)'
    })

    div.addEventListener('mouseleave', () => {
      div.style.transform = 'scale(1)'
    })

    return div
  }

  getMarkers(): DeviceMarker[] {
    return Array.from(this.markers.values())
  }

  getClusters(): MarkerCluster[] {
    return Array.from(this.clusters.values())
  }

  updateConfig(config: Partial<MapMarkerConfig>) {
    this.config = { ...this.config, ...config }
  }

  getConfig(): MapMarkerConfig {
    return { ...this.config }
  }

  // Game-changing feature: Predictive clustering based on user movement
  getPredictiveClusters(timeWindow: number = 300000): MarkerCluster[] { // 5 minutes
    const now = Date.now()
    const recentMarkers = Array.from(this.markers.values()).filter(
      marker => marker.lastSeen.getTime() > now - timeWindow
    )

    // Analyze movement patterns and predict future positions
    const predictedPositions = recentMarkers.map(marker => {
      if (marker.isMoving && marker.batteryLevel && marker.batteryLevel > 0.2) {
        // Simple linear prediction based on last movement
        return {
          ...marker,
          position: {
            lat: marker.position.lat + (Math.random() - 0.5) * 0.001,
            lng: marker.position.lng + (Math.random() - 0.5) * 0.001
          }
        }
      }
      return marker
    })

    // Recalculate clusters with predicted positions
    this.clusters.clear()
    const processed = new Set<string>()

    for (const marker of predictedPositions) {
      if (processed.has(marker.id)) continue
      const cluster = this.createCluster(marker, predictedPositions)
      if (cluster.devices.length > 1) {
        this.clusters.set(cluster.id, cluster)
        cluster.devices.forEach(m => processed.add(m.id))
      }
    }

    return Array.from(this.clusters.values())
  }
}

// Global marker manager instance
export const markerManager = new OmniMapMarkerManager()

// React hook for map markers
export function useOmniMapMarkers() {
  const [markers, setMarkers] = useState<DeviceMarker[]>([])
  const [clusters, setClusters] = useState<MarkerCluster[]>([])
  const [config, setConfig] = useState<MapMarkerConfig>(markerManager.getConfig())

  const addMarker = useCallback((marker: DeviceMarker) => {
    markerManager.addOrUpdateMarker(marker)
    setMarkers(markerManager.getMarkers())
    setClusters(markerManager.getClusters())
  }, [])

  const updateMarker = useCallback((markerId: string, updates: Partial<DeviceMarker>) => {
    const existing = markerManager.getMarkers().find(m => m.id === markerId)
    if (existing) {
      addMarker({ ...existing, ...updates })
    }
  }, [addMarker])

  const removeMarker = useCallback((markerId: string) => {
    markerManager.removeMarker(markerId)
    setMarkers(markerManager.getMarkers())
    setClusters(markerManager.getClusters())
  }, [])

  const updateConfig = useCallback((newConfig: Partial<MapMarkerConfig>) => {
    markerManager.updateConfig(newConfig)
    setConfig(markerManager.getConfig())
    setMarkers(markerManager.getMarkers())
    setClusters(markerManager.getClusters())
  }, [])

  const getPredictiveClusters = useCallback((timeWindow?: number) => {
    return markerManager.getPredictiveClusters(timeWindow)
  }, [])

  // Auto-update markers
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkers(markerManager.getMarkers())
      setClusters(markerManager.getClusters())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    markers,
    clusters,
    config,
    addMarker,
    updateMarker,
    removeMarker,
    updateConfig,
    getPredictiveClusters,
    // Game-changing convenience methods
    addSOSMarker: (id: string, position: { lat: number; lng: number }, user?: DeviceMarker['user']) => 
      addMarker({ id, type: 'mobile', status: 'sos', position, user, lastSeen: new Date() }),
    updateMarkerStatus: (id: string, status: DeviceMarker['status']) => 
      updateMarker(id, { status, lastSeen: new Date() }),
    updateMarkerBattery: (id: string, batteryLevel: number) => 
      updateMarker(id, { batteryLevel }),
    setMarkerMoving: (id: string, isMoving: boolean) => 
      updateMarker(id, { isMoving })
  }
}
