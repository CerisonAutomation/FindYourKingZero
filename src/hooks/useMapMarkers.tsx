/**
 * Map Markers and Location Features
 * Real-time location-based interactions
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

export type MapMarker  = {
  id: string
  userId: string
  latitude: number
  longitude: number
  type: 'user' | 'event' | 'venue' | 'meeting'
  title: string
  description?: string
  isActive: boolean
  lastUpdated: string
  metadata?: {
    age?: number
    interests?: string[]
    vibe?: string
    distance?: number
  }
}

export type LocationEvent  = {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  startTime: string
  endTime: string
  attendees: number
  maxAttendees: number
  type: 'party' | 'meetup' | 'date' | 'social'
  description: string
}

export function useMapMarkers() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [events, setEvents] = useState<LocationEvent[]>([])
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user location
  const getCurrentLocation = useCallback(() => {
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
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [])

  // Load nearby markers
  const loadNearbyMarkers = useCallback(async (radius: number = 10) => {
    setIsLoading(true)
    setError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)

      // In production, this would query a real location service
      // For now, generate mock markers
      const mockMarkers: MapMarker[] = [
        {
          id: 'marker1',
          userId: 'user1',
          latitude: location.latitude + (Math.random() - 0.5) * 0.01,
          longitude: location.longitude + (Math.random() - 0.5) * 0.01,
          type: 'user',
          title: 'Alex, 28',
          description: 'Looking for connection',
          isActive: true,
          lastUpdated: new Date().toISOString(),
          metadata: {
            age: 28,
            interests: ['music', 'travel'],
            vibe: 'adventurous',
            distance: Math.floor(Math.random() * 5000) // meters
          }
        },
        {
          id: 'marker2',
          userId: 'user2',
          latitude: location.latitude + (Math.random() - 0.5) * 0.01,
          longitude: location.longitude + (Math.random() - 0.5) * 0.01,
          type: 'user',
          title: 'Sam, 25',
          description: 'Coffee and conversations',
          isActive: true,
          lastUpdated: new Date().toISOString(),
          metadata: {
            age: 25,
            interests: ['coffee', 'art'],
            vibe: 'casual',
            distance: Math.floor(Math.random() * 5000)
          }
        }
      ]

      setMarkers(mockMarkers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load markers')
    } finally {
      setIsLoading(false)
    }
  }, [getCurrentLocation])

  // Load nearby events
  const loadNearbyEvents = useCallback(async () => {
    if (!userLocation) return

    try {
      // In production, query real events from database
      const mockEvents: LocationEvent[] = [
        {
          id: 'event1',
          name: 'Gay Singles Mixer',
          location: {
            latitude: userLocation.latitude + 0.005,
            longitude: userLocation.longitude + 0.005,
            address: '123 Main St, City'
          },
          startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Tomorrow + 2 hours
          attendees: 12,
          maxAttendees: 30,
          type: 'meetup',
          description: 'Meet other gay singles in a relaxed setting'
        },
        {
          id: 'event2',
          name: 'LGBTQ+ Art Gallery Opening',
          location: {
            latitude: userLocation.latitude - 0.003,
            longitude: userLocation.longitude + 0.003,
            address: '456 Art Ave, City'
          },
          startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          endTime: new Date(Date.now() + 172800000 + 10800000).toISOString(), // + 3 hours
          attendees: 45,
          maxAttendees: 100,
          type: 'social',
          description: 'Celebrate LGBTQ+ artists and community'
        }
      ]

      setEvents(mockEvents)
    } catch (err) {
      console.error('Failed to load events:', err)
    }
  }, [userLocation])

  // Create user marker
  const createUserMarker = useCallback(async (isVisible: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !userLocation) return null

      const marker: MapMarker = {
        id: user.id,
        userId: user.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        type: 'user',
        title: 'You',
        isActive: isVisible,
        lastUpdated: new Date().toISOString()
      }

      // In production, save to database
      console.log('Creating user marker:', marker)

      return marker
    } catch (err) {
      console.error('Failed to create user marker:', err)
      return null
    }
  }, [userLocation])

  // Join event
  const joinEvent = useCallback(async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Record event attendance
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        })

      if (error) throw error

      // Update local state
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, attendees: event.attendees + 1 }
          : event
      ))

      return true
    } catch (err) {
      console.error('Failed to join event:', err)
      return false
    }
  }, [])

  // Initialize location
  useEffect(() => {
    loadNearbyMarkers()
  }, [loadNearbyMarkers])

  // Load events when location is available
  useEffect(() => {
    if (userLocation) {
      loadNearbyEvents()
    }
  }, [userLocation, loadNearbyEvents])

  return {
    markers,
    events,
    userLocation,
    isLoading,
    error,
    loadNearbyMarkers,
    loadNearbyEvents,
    createUserMarker,
    joinEvent,
    refreshLocation: getCurrentLocation
  }
}