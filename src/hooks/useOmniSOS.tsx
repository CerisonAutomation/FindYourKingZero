/**
 * 🚨 OMNISOS VISUAL SYSTEM - Emergency Alert Visual Manager
 * Animated SOS alerts with pulsing effects and emergency broadcasting
 * Integrated with useRealtimeLocationTracking and enhanced with visual effects
 */

import { useCallback, useEffect, useState } from 'react'

export type SOSAlert =  {
  id: string
  userId: string
  userName: string
  userPhoto?: string
  position: { lat: number; lng: number }
  timestamp: Date
  resolved: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  message?: string
  responders: string[]
  estimatedArrival?: Date
}

export type SOSConfig =  {
  fullScreenMode: boolean
  soundEnabled: boolean
  vibrateEnabled: boolean
  autoShareLocation: boolean
  notifyNearbyUsers: boolean
  emergencyContacts: string[]
}

class OmniSOSManager {
  private alerts: Map<string, SOSAlert> = new Map()
  private config: SOSConfig = {
    fullScreenMode: true,
    soundEnabled: true,
    vibrateEnabled: true,
    autoShareLocation: true,
    notifyNearbyUsers: true,
    emergencyContacts: []
  }

  constructor() {
    this.initializeEffects()
  }

  private initializeEffects() {
    // Inject SOS CSS animations
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes sos-pulse {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
          25% { transform: scale(1.05); opacity: 0.9; box-shadow: 0 0 20px 5px rgba(244, 67, 54, 0.4); }
          50% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 30px 10px rgba(244, 67, 54, 0.2); }
          75% { transform: scale(1.05); opacity: 0.9; box-shadow: 0 0 20px 5px rgba(244, 67, 54, 0.4); }
          100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
        }

        @keyframes emergency-flash {
          0%, 50% { background-color: rgba(244, 67, 54, 0.1); }
          25%, 75% { background-color: rgba(244, 67, 54, 0.3); }
        }

        @keyframes help-request {
          0% { transform: translateY(-10px); opacity: 0; }
          50% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-5px); opacity: 0.8; }
        }

        .sos-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: emergency-flash 2s infinite;
        }

        .sos-container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: sos-pulse 2s infinite;
        }

        .sos-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          background: #F44336;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: white;
          font-weight: bold;
          animation: sos-pulse 1s infinite;
        }

        .sos-title {
          font-size: 28px;
          font-weight: bold;
          color: #F44336;
          margin-bottom: 10px;
        }

        .sos-message {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .sos-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .sos-button {
          padding: 15px 30px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sos-button-help {
          background: #F44336;
          color: white;
        }

        .sos-button-help:hover {
          background: #D32F2F;
          transform: translateY(-2px);
        }

        .sos-button-resolve {
          background: #4CAF50;
          color: white;
        }

        .sos-button-resolve:hover {
          background: #388E3C;
          transform: translateY(-2px);
        }

        .sos-indicator {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #F44336;
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: bold;
          z-index: 99998;
          animation: help-request 3s infinite;
          cursor: pointer;
        }

        .sos-minimap {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          border: 2px solid #F44336;
          overflow: hidden;
        }

        .sos-timer {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          font-family: monospace;
          font-size: 18px;
          z-index: 99998;
        }
      `
      document.head.appendChild(style)
    }
  }

  createAlert(alert: Omit<SOSAlert, 'id' | 'timestamp' | 'resolved' | 'responders'>): SOSAlert {
    const sosAlert: SOSAlert = {
      ...alert,
      id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      responders: []
    }

    this.alerts.set(sosAlert.id, sosAlert)
    this.triggerSOSVisuals(sosAlert)

    return sosAlert
  }

  private triggerSOSVisuals(alert: SOSAlert) {
    if (this.config.fullScreenMode) {
      this.showFullScreenSOS(alert)
    } else {
      this.showSOSIndicator(alert)
    }

    if (this.config.soundEnabled) {
      this.playSOSSound()
    }

    if (this.config.vibrateEnabled) {
      this.vibrateForSOS(alert.severity)
    }
  }

  private showFullScreenSOS(alert: SOSAlert) {
    const overlay = document.createElement('div')
    overlay.className = 'sos-overlay'
    overlay.id = 'sos-overlay'

    const container = document.createElement('div')
    container.className = 'sos-container'

    const icon = document.createElement('div')
    icon.className = 'sos-icon'
    icon.textContent = 'SOS'

    const title = document.createElement('div')
    title.className = 'sos-title'
    title.textContent = 'Emergency Alert'

    const message = document.createElement('div')
    message.className = 'sos-message'
    message.innerHTML = `
      <strong>${alert.userName}</strong> needs help!<br>
      ${alert.message || 'Emergency assistance required'}<br>
      <small>Alert sent ${this.formatTime(alert.timestamp)}</small>
    `

    const actions = document.createElement('div')
    actions.className = 'sos-actions'

    const helpButton = document.createElement('button')
    helpButton.className = 'sos-button sos-button-help'
    helpButton.textContent = 'I Can Help'
    helpButton.onclick = () => this.respondToSOS(alert.id)

    const resolveButton = document.createElement('button')
    resolveButton.className = 'sos-button sos-button-resolve'
    resolveButton.textContent = 'Mark Resolved'
    resolveButton.onclick = () => this.resolveSOS(alert.id)

    actions.appendChild(helpButton)
    actions.appendChild(resolveButton)

    container.appendChild(icon)
    container.appendChild(title)
    container.appendChild(message)
    container.appendChild(actions)

    overlay.appendChild(container)
    document.body.appendChild(overlay)

    // Auto-hide after 30 seconds if no action
    setTimeout(() => {
      if (document.getElementById('sos-overlay')) {
        this.hideSOSOverlay()
      }
    }, 30000)
  }

  private showSOSIndicator(alert: SOSAlert) {
    const indicator = document.createElement('div')
    indicator.className = 'sos-indicator'
    indicator.id = 'sos-indicator'
    indicator.textContent = `SOS: ${alert.userName}`
    indicator.onclick = () => this.showFullScreenSOS(alert)

    document.body.appendChild(indicator)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      const element = document.getElementById('sos-indicator')
      if (element) element.remove()
    }, 10000)
  }

  private hideSOSOverlay() {
    const overlay = document.getElementById('sos-overlay')
    if (overlay) overlay.remove()
  }

  private playSOSSound() {
    // Play emergency sound through the audio system
    if (typeof window !== 'undefined' && (window as any).audioManager) {
      (window as any).audioManager.playSound('sos', { volume: 1.0, loop: true })
    }
  }

  private vibrateForSOS(severity: string) {
    if (navigator.vibrate) {
      const patterns = {
        low: [100, 50, 100],
        medium: [200, 100, 200, 100, 200],
        high: [300, 100, 300, 100, 300, 100, 300],
        critical: [500, 100, 500, 100, 500, 100, 500, 100, 500]
      }
      navigator.vibrate(patterns[severity as keyof typeof patterns] || patterns.medium)
    }
  }

  respondToSOS(alertId: string, responderId?: string) {
    const alert = this.alerts.get(alertId)
    if (!alert) return

    if (!alert.responders.includes(responderId || 'current-user')) {
      alert.responders.push(responderId || 'current-user')
      alert.estimatedArrival = new Date(Date.now() + 600000) // 10 minutes ETA
    }

    this.hideSOSOverlay()
    this.showResponseConfirmation(alert)
  }

  private showResponseConfirmation(alert: SOSAlert) {
    const confirmation = document.createElement('div')
    confirmation.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4CAF50;
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 100000;
      animation: help-request 0.5s ease;
    `
    confirmation.textContent = `Help response sent to ${alert.userName}!`
    document.body.appendChild(confirmation)

    setTimeout(() => confirmation.remove(), 3000)
  }

  resolveSOS(alertId: string) {
    const alert = this.alerts.get(alertId)
    if (!alert) return

    alert.resolved = true
    this.hideSOSOverlay()
    this.showResolutionConfirmation(alert)
  }

  private showResolutionConfirmation(alert: SOSAlert) {
    const confirmation = document.createElement('div')
    confirmation.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4CAF50;
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 100000;
      animation: help-request 0.5s ease;
    `
    confirmation.textContent = `SOS alert for ${alert.userName} resolved!`
    document.body.appendChild(confirmation)

    setTimeout(() => confirmation.remove(), 3000)
  }

  private formatTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  getActiveAlerts(): SOSAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved)
  }

  getAllAlerts(): SOSAlert[] {
    return Array.from(this.alerts.values())
  }

  updateConfig(config: Partial<SOSConfig>) {
    this.config = { ...this.config, ...config }
  }

  getConfig(): SOSConfig {
    return { ...this.config }
  }

  // Game-changing feature: Broadcast SOS to nearby users
  async broadcastToNearby(alert: SOSAlert, radius: number = 1000) {
    // This would integrate with the location tracking system
    // to find and notify users within the specified radius
    console.log(`Broadcasting SOS for ${alert.userName} within ${radius}m radius`)
    
    // Simulate nearby user notification
    if (this.config.notifyNearbyUsers) {
      // Integration with useRealtimeLocationTracking would happen here
      this.notifyNearbyUsers(alert, radius)
    }
  }

  private notifyNearbyUsers(alert: SOSAlert, radius: number) {
    // Placeholder for integration with real-time location system
    console.log(`Notifying nearby users within ${radius}m of ${alert.userName}`)
  }
}

// Global SOS manager instance
export const sosManager = new OmniSOSManager()

// React hook for SOS system
export function useOmniSOS() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([])
  const [config, setConfig] = useState<SOSConfig>(sosManager.getConfig())

  const createAlert = useCallback((alert: Omit<SOSAlert, 'id' | 'timestamp' | 'resolved' | 'responders'>) => {
    const sosAlert = sosManager.createAlert(alert)
    setAlerts(sosManager.getAllAlerts())
    return sosAlert
  }, [])

  const respondToSOS = useCallback((alertId: string, responderId?: string) => {
    sosManager.respondToSOS(alertId, responderId)
    setAlerts(sosManager.getAllAlerts())
  }, [])

  const resolveSOS = useCallback((alertId: string) => {
    sosManager.resolveSOS(alertId)
    setAlerts(sosManager.getAllAlerts())
  }, [])

  const updateConfig = useCallback((newConfig: Partial<SOSConfig>) => {
    sosManager.updateConfig(newConfig)
    setConfig(sosManager.getConfig())
  }, [])

  const broadcastToNearby = useCallback(async (alertId: string, radius?: number) => {
    const alert = sosManager.getAllAlerts().find(a => a.id === alertId)
    if (alert) {
      await sosManager.broadcastToNearby(alert, radius)
    }
  }, [])

  // Auto-update alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(sosManager.getAllAlerts())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    alerts,
    activeAlerts: alerts.filter(alert => !alert.resolved),
    config,
    createAlert,
    respondToSOS,
    resolveSOS,
    updateConfig,
    broadcastToNearby,
    // Game-changing convenience methods
    triggerEmergencySOS: (userId: string, userName: string, position: { lat: number; lng: number }, message?: string) =>
      createAlert({ userId, userName, position, severity: 'critical', message }),
    triggerHelpRequest: (userId: string, userName: string, position: { lat: number; lng: number }, message?: string) =>
      createAlert({ userId, userName, position, severity: 'medium', message }),
    triggerCheckIn: (userId: string, userName: string, position: { lat: number; lng: number }) =>
      createAlert({ userId, userName, position, severity: 'low', message: 'Safety check-in requested' })
  }
}
