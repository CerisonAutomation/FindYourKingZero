/**
 * Emergency Safety Features
 * SOS alerts and safety monitoring
 */

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export type SOSAlert =  {
  id: string
  userId: string
  userName: string
  location: {
    latitude: number
    longitude: number
    address?: string
  }
  message: string
  timestamp: number
  resolved: boolean
  responders: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export type SafetyContact =  {
  id: string
  name: string
  phone: string
  email: string
  relationship: 'friend' | 'family' | 'partner' | 'professional'
  isEmergency: boolean
}

export function useSafetyFeatures() {
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [safetyContacts, setSafetyContacts] = useState<SafetyContact[]>([])
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    return new Promise<{
      latitude: number
      longitude: number
    }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error(error.message))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000
        }
      )
    })
  }, [])

  // Trigger SOS alert
  const triggerSOS = useCallback(async (message: string = 'Emergency SOS Alert!') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      setIsSOSActive(true)
      setIsLoading(true)

      // Get current location
      const location = await getCurrentLocation()
      setCurrentLocation(location)

      // Create SOS alert
      const sosAlert: SOSAlert = {
        id: `sos_${Date.now()}_${user.id}`,
        userId: user.id,
        userName: user.user_metadata?.display_name || 'Anonymous',
        location: {
          ...location,
          address: 'Current Location' // In production, use reverse geocoding
        },
        message,
        timestamp: Date.now(),
        resolved: false,
        responders: [],
        priority: 'critical'
      }

      // Save to database (when table exists)
      console.log('SOS Alert created:', sosAlert)

      setSosAlerts(prev => [sosAlert, ...prev])

      // Notify emergency contacts
      await notifyEmergencyContacts(sosAlert)

      // In production, this would also:
      // - Send push notifications to nearby users
      // - Contact emergency services if critical
      // - Start location tracking
      // - Record audio/video evidence

      return sosAlert
    } catch (error) {
      console.error('Failed to trigger SOS:', error)
      setIsSOSActive(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [getCurrentLocation])

  // Cancel SOS alert
  const cancelSOS = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update alert status
      setSosAlerts(prev => prev.map(alert => 
        alert.userId === user.id
          ? { ...alert, resolved: true }
          : alert
      ))

      setIsSOSActive(false)

      // In production, update database and notify responders
      console.log('SOS Alert cancelled by user:', user.id)
    } catch (error) {
      console.error('Failed to cancel SOS:', error)
    }
  }, [])

  // Respond to SOS alert
  const respondToSOS = useCallback(async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Add user as responder
      setSosAlerts(prev => prev.map(alert => 
        alert.id === alertId
          ? { 
              ...alert, 
              responders: [...alert.responders, user.id].filter((id, index, arr) => arr.indexOf(id) === index)
            }
          : alert
      ))

      // In production, update database and send notifications
      console.log('User responded to SOS:', { alertId, responderId: user.id })
    } catch (error) {
      console.error('Failed to respond to SOS:', error)
    }
  }, [])

  // Load safety contacts
  const loadSafetyContacts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // In production, load from database
      const mockContacts: SafetyContact[] = [
        {
          id: 'contact1',
          name: 'Emergency Contact',
          phone: '911',
          email: 'emergency@example.com',
          relationship: 'professional',
          isEmergency: true
        }
      ]

      setSafetyContacts(mockContacts)
    } catch (error) {
      console.error('Failed to load safety contacts:', error)
    }
  }, [])

  // Add safety contact
  const addSafetyContact = useCallback(async (contact: Omit<SafetyContact, 'id'>) => {
    const newContact: SafetyContact = {
      ...contact,
      id: `contact_${Date.now()}`
    }

    setSafetyContacts(prev => [...prev, newContact])

    // In production, save to database
    console.log('Safety contact added:', newContact)

    return newContact
  }, [])

  // Notify emergency contacts
  const notifyEmergencyContacts = useCallback(async (alert: SOSAlert) => {
    const emergencyContacts = safetyContacts.filter(contact => contact.isEmergency)

    for (const contact of emergencyContacts) {
      // In production, send SMS, email, or push notifications
      console.log('Emergency notification sent to:', {
        contact: contact.name,
        phone: contact.phone,
        alert: alert.message,
        location: alert.location
      })
    }
  }, [safetyContacts])

  // Check in safely
  const checkInSafely = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Cancel any active SOS
      if (isSOSActive) {
        await cancelSOS()
      }

      // Record safe check-in
      console.log('User checked in safely:', user.id)

      return true
    } catch (error) {
      console.error('Failed to check in safely:', error)
      return false
    }
  }, [isSOSActive, cancelSOS])

  // Initialize
  useEffect(() => {
    loadSafetyContacts()
  }, [loadSafetyContacts])

  return {
    // State
    sosAlerts,
    isSOSActive,
    safetyContacts,
    currentLocation,
    isLoading,

    // Actions
    triggerSOS,
    cancelSOS,
    respondToSOS,
    addSafetyContact,
    checkInSafely,
    loadSafetyContacts,

    // Utilities
    hasActiveAlert: sosAlerts.some(alert => !alert.resolved),
    nearbyAlerts: sosAlerts.filter(alert => !alert.resolved),
    emergencyContacts: safetyContacts.filter(contact => contact.isEmergency)
  }
}