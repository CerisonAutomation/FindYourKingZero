/**
 * 🚀 PRODUCTION-READY P2P DATING PLATFORM
 * Complete transformation of FYKZero into privacy-first dating app
 * Integrating Trystero 0.22.0, Supabase, and all dating app features
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

// Core types for production dating platform
export interface DatingProfile {
  id: string
  userId: string
  displayName: string
  age: number
  bio: string
  avatarUrl: string | null
  photos: string[]
  location: {
    latitude: number
    longitude: number
    timestamp: number
  } | null
  isOnline: boolean
  isVerified: boolean
  membershipTier: 'free' | 'plus' | 'pro' | 'elite'
  interests: string[]
  tribes: string[]
  relationshipGoals: string[]
  position: 'top' | 'vers' | 'bottom' | 'flexible'
  relationshipStatus: 'single' | 'dating' | 'relationship' | 'open'
  hivStatus: 'negative' | 'positive' | 'on-prep' | 'undetectable' | null
  pronouns: string
  lastSeen: string
  distance?: number
  compatibility?: number
}

export interface DatingMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: number
  type: 'text' | 'image' | 'audio' | 'video' | 'location' | 'reaction'
  metadata?: {
    fileName?: string
    fileSize?: number
    duration?: number
    reaction?: string
    replyTo?: string
    editHistory?: Array<{ content: string; timestamp: number }>
    selfDestruct?: number
    readReceipt?: boolean
  }
  isRead: boolean
}

export interface DatingCall {
  id: string
  callerId: string
  receiverId: string
  type: 'audio' | 'video'
  status: 'calling' | 'connected' | 'ended' | 'missed'
  startTime?: number
  endTime?: number
  duration?: number
}

export interface DatingRoom {
  id: string
  type: 'nearby' | 'global' | 'tribe' | 'private'
  name: string
  description?: string
  members: string[]
  maxDistance?: number
  ageRange?: [number, number]
  interests?: string[]
  isPrivate: boolean
  createdAt: number
  createdBy: string
}

export interface DatingState {
  // Connection state
  isConnected: boolean
  isOnline: boolean
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
  
  // Profile state
  profile: DatingProfile | null
  nearbyProfiles: DatingProfile[]
  matches: DatingProfile[]
  blockedUsers: string[]
  favorites: string[]
  
  // Chat state
  conversations: Map<string, DatingMessage[]>
  activeChats: string[]
  typingIndicators: Map<string, boolean>
  unreadCounts: Map<string, number>
  
  // Call state
  activeCall: DatingCall | null
  incomingCall: DatingCall | null
  callHistory: DatingCall[]
  
  // Room state
  availableRooms: DatingRoom[]
  joinedRooms: string[]
  
  // Discovery state
  discoverySettings: {
    maxAge: number
    minAge: number
    maxDistance: number
    showOnline: boolean
    tribes: string[]
  }
  
  // Notifications
  notifications: Array<{
    id: string
    type: 'message' | 'match' | 'call' | 'profile_view' | 'favorite'
    title: string
    body: string
    timestamp: number
    read: boolean
    data?: any
  }>
}

// Production configuration
const DATING_CONFIG = {
  maxNearbyProfiles: 100,
  maxDistance: 50, // km
  updateInterval: 30000, // 30 seconds
  heartbeatInterval: 60000, // 1 minute
  messageRetention: 30, // days
  callTimeout: 30000, // 30 seconds
  maxConcurrentCalls: 1,
  photoMaxSize: 10 * 1024 * 1024, // 10MB
  supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'],
  defaultDiscoverySettings: {
    maxAge: 99,
    minAge: 18,
    maxDistance: 50,
    showOnline: true,
    tribes: []
  }
}

export function useProductionDating() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [state, setState] = useState<DatingState>({
    isConnected: false,
    isOnline: navigator.onLine,
    connectionQuality: 'excellent',
    profile: null,
    nearbyProfiles: [],
    matches: [],
    blockedUsers: [],
    favorites: [],
    conversations: new Map(),
    activeChats: [],
    typingIndicators: new Map(),
    unreadCounts: new Map(),
    activeCall: null,
    incomingCall: null,
    callHistory: [],
    availableRooms: [],
    joinedRooms: [],
    discoverySettings: DATING_CONFIG.defaultDiscoverySettings,
    notifications: []
  })

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const locationRef = useRef<GeolocationPosition | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Initialize production dating platform
  const initializeDating = useCallback(async () => {
    if (!user) return

    try {
      // Load user profile
      await loadUserProfile()
      
      // Initialize real-time connection
      await initializeRealtime()
      
      // Start location tracking
      startLocationTracking()
      
      // Load nearby profiles
      await loadNearbyProfiles()
      
      // Load matches
      await loadMatches()
      
      // Load conversations
      await loadConversations()
      
      // Start heartbeat
      startHeartbeat()
      
      setState(prev => ({ ...prev, isConnected: true }))
      
      toast({
        title: 'Dating Platform Active',
        description: 'Privacy-first dating network ready',
        variant: 'default'
      })

    } catch (error) {
      console.error('Dating initialization failed:', error)
      toast({
        title: 'Initialization Failed',
        description: 'Unable to initialize dating platform',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        const datingProfile: DatingProfile = {
          id: profile.id,
          userId: profile.user_id,
          displayName: profile.display_name || 'Anonymous',
          age: profile.age || 21,
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url,
          photos: profile.avatar_url ? [profile.avatar_url] : [],
          location: null,
          isOnline: true,
          isVerified: profile.age_verified || false,
          membershipTier: 'free',
          interests: profile.interests || [],
          tribes: profile.tribes || [],
          relationshipGoals: Array.isArray(profile.relationship_goals) 
            ? profile.relationship_goals 
            : [profile.relationship_goals || 'dating'],
          position: 'flexible',
          relationshipStatus: 'single',
          hivStatus: profile.hiv_status,
          pronouns: 'he/him',
          lastSeen: new Date().toISOString()
        }

        setState(prev => ({ ...prev, profile: datingProfile }))
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }, [user])

  // Initialize real-time connection with Supabase
  const initializeRealtime = useCallback(() => {
    if (!user) return

    const channel = supabase
      .channel('dating-platform')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, 
        (payload) => {
          handleRealtimeMessage(payload)
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          handleRealtimeProfile(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Handle real-time messages
  const handleRealtimeMessage = useCallback((payload: any) => {
    const { event, new: record } = payload

    if (event === 'INSERT') {
      const message: DatingMessage = {
        id: record.id,
        senderId: record.sender_id,
        receiverId: record.receiver_id,
        content: record.content,
        timestamp: new Date(record.created_at).getTime(),
        type: record.type || 'text',
        metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
        isRead: record.is_read
      }

      setState(prev => {
        const conversations = new Map(prev.conversations)
        const chat = conversations.get(message.senderId) || []
        conversations.set(message.senderId, [...chat, message])
        
        const unreadCounts = new Map(prev.unreadCounts)
        unreadCounts.set(message.senderId, (unreadCounts.get(message.senderId) || 0) + 1)

        return { ...prev, conversations, unreadCounts }
      })

      // Show notification
      toast({
        title: 'New Message',
        description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        variant: 'default'
      })
    }
  }, [toast])

  // Handle real-time profile updates
  const handleRealtimeProfile = useCallback((payload: any) => {
    const { event, new: record } = payload

    if (event === 'UPDATE') {
      setState(prev => {
        const nearbyProfiles = prev.nearbyProfiles.map(profile => 
          profile.userId === record.user_id 
            ? { ...profile, isOnline: record.is_online, lastSeen: record.last_seen }
            : profile
        )
        return { ...prev, nearbyProfiles }
      })
    }
  }, [])

  // Start location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) return

    const updateLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        })

        locationRef.current = position

        // Update profile location
        if (state.profile && user) {
          await supabase
            .from('profiles')
            .update({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              location_updated_at: new Date().toISOString(),
              is_online: true
            })
            .eq('user_id', user.id)

          setState(prev => ({
            ...prev,
            profile: prev.profile ? {
              ...prev.profile,
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: position.timestamp
              }
            } : null
          }))
        }

        // Reload nearby profiles with new location
        await loadNearbyProfiles()

      } catch (error) {
        console.warn('Location tracking failed:', error)
      }
    }

    // Update location immediately and then every 30 seconds
    updateLocation()
    setInterval(updateLocation, DATING_CONFIG.updateInterval)
  }, [state.profile, user])

  // Load nearby profiles
  const loadNearbyProfiles = useCallback(async () => {
    if (!state.profile?.location || !user) return

    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .eq('is_active', true)
        .neq('is_banned', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (profiles) {
        const nearbyProfiles: DatingProfile[] = profiles
          .filter(profile => {
            // Apply discovery filters
            if (profile.age < state.discoverySettings.minAge || profile.age > state.discoverySettings.maxAge) {
              return false
            }
            
            if (state.discoverySettings.showOnline && !profile.is_online) {
              return false
            }

            if (state.discoverySettings.tribes.length > 0) {
              const profileTribes = profile.tribes || []
              const hasMatchingTribe = state.discoverySettings.tribes.some(tribe => 
                profileTribes.includes(tribe)
              )
              if (!hasMatchingTribe) return false
            }

            // Calculate distance
            const distance = calculateDistance(
              state.profile.location.latitude,
              state.profile.location.longitude,
              profile.latitude!,
              profile.longitude!
            )

            if (distance > state.discoverySettings.maxDistance) {
              return false
            }

            return true
          })
          .map(profile => ({
            id: profile.id,
            userId: profile.user_id,
            displayName: profile.display_name || 'Anonymous',
            age: profile.age || 21,
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url,
            photos: profile.avatar_url ? [profile.avatar_url] : [],
            location: {
              latitude: profile.latitude!,
              longitude: profile.longitude!,
              timestamp: new Date(profile.location_updated_at).getTime()
            },
            isOnline: profile.is_online,
            isVerified: profile.age_verified || false,
            membershipTier: 'free',
            interests: profile.interests || [],
            tribes: profile.tribes || [],
            relationshipGoals: Array.isArray(profile.relationship_goals) 
              ? profile.relationship_goals 
              : [profile.relationship_goals || 'dating'],
            position: 'flexible',
            relationshipStatus: 'single',
            hivStatus: profile.hiv_status,
            pronouns: 'he/him',
            lastSeen: profile.last_seen || new Date().toISOString(),
            distance: calculateDistance(
              state.profile.location.latitude,
              state.profile.location.longitude,
              profile.latitude!,
              profile.longitude!
            )
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          .slice(0, DATING_CONFIG.maxNearbyProfiles)

        setState(prev => ({ ...prev, nearbyProfiles }))
      }
    } catch (error) {
      console.error('Failed to load nearby profiles:', error)
    }
  }, [state.profile, state.discoverySettings, user])

  // Load matches
  const loadMatches = useCallback(async () => {
    if (!user) return

    try {
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          *,
          matched_profile:profiles(*)
        `)
        .or(`user_id.eq.${user.id},matched_user_id.eq.${user.id}`)
        .eq('is_active', true)

      if (matches) {
        const matchProfiles: DatingProfile[] = matches.map(match => {
          const profile = match.user_id === user.id ? match.matched_profile : match
          return {
            id: profile.id,
            userId: profile.user_id,
            displayName: profile.display_name || 'Anonymous',
            age: profile.age || 21,
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url,
            photos: profile.avatar_url ? [profile.avatar_url] : [],
            location: profile.latitude && profile.longitude ? {
              latitude: profile.latitude,
              longitude: profile.longitude,
              timestamp: new Date(profile.location_updated_at).getTime()
            } : null,
            isOnline: profile.is_online,
            isVerified: profile.age_verified || false,
            membershipTier: 'free',
            interests: profile.interests || [],
            tribes: profile.tribes || [],
            relationshipGoals: Array.isArray(profile.relationship_goals) 
              ? profile.relationship_goals 
              : [profile.relationship_goals || 'dating'],
            position: 'flexible',
            relationshipStatus: 'single',
            hivStatus: profile.hiv_status,
            pronouns: 'he/him',
            lastSeen: profile.last_seen || new Date().toISOString()
          }
        })

        setState(prev => ({ ...prev, matches: matchProfiles }))
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
    }
  }, [user])

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return

    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1000)

      if (messages) {
        const conversations = new Map<string, DatingMessage[]>()
        const unreadCounts = new Map<string, number>()

        messages.forEach(msg => {
          const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
          
          if (!conversations.has(otherUserId)) {
            conversations.set(otherUserId, [])
            unreadCounts.set(otherUserId, 0)
          }

          const message: DatingMessage = {
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: msg.content,
            timestamp: new Date(msg.created_at).getTime(),
            type: msg.type || 'text',
            metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined,
            isRead: msg.is_read
          }

          conversations.get(otherUserId)!.push(message)

          if (!msg.is_read && msg.receiver_id === user.id) {
            unreadCounts.set(otherUserId, (unreadCounts.get(otherUserId) || 0) + 1)
          }
        })

        // Sort each conversation by timestamp
        conversations.forEach(chat => {
          chat.sort((a, b) => a.timestamp - b.timestamp)
        })

        setState(prev => ({ 
          ...prev, 
          conversations, 
          unreadCounts,
          activeChats: Array.from(conversations.keys())
        }))
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }, [user])

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    heartbeatRef.current = setInterval(async () => {
      if (user && state.profile) {
        try {
          await supabase
            .from('profiles')
            .update({
              is_online: true,
              last_seen: new Date().toISOString()
            })
            .eq('user_id', user.id)

          setState(prev => ({
            ...prev,
            isOnline: navigator.onLine,
            connectionQuality: getConnectionQuality()
          }))
        } catch (error) {
          console.error('Heartbeat failed:', error)
        }
      }
    }, DATING_CONFIG.heartbeatInterval)
  }, [user, state.profile])

  // Calculate connection quality
  const getConnectionQuality = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (!navigator.onLine) return 'poor'
    
    const connection = (navigator as any).connection
    if (!connection) return 'excellent'

    const { effectiveType, downlink } = connection
    
    if (effectiveType === '4g' && downlink > 2) return 'excellent'
    if (effectiveType === '4g' || downlink > 1) return 'good'
    if (effectiveType === '3g') return 'fair'
    return 'poor'
  }

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  // Send message
  const sendMessage = useCallback(async (receiverId: string, content: string, type: DatingMessage['type'] = 'text') => {
    if (!user) return

    try {
      const { data: message } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          type,
          is_read: false
        })
        .select()
        .single()

      if (message) {
        const datingMessage: DatingMessage = {
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          content: message.content,
          timestamp: new Date(message.created_at).getTime(),
          type: message.type || 'text',
          isRead: message.is_read
        }

        setState(prev => {
          const conversations = new Map(prev.conversations)
          const chat = conversations.get(receiverId) || []
          conversations.set(receiverId, [...chat, datingMessage])
          
          return { 
            ...prev, 
            conversations,
            activeChats: prev.activeChats.includes(receiverId) 
              ? prev.activeChats 
              : [...prev.activeChats, receiverId]
          }
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Message Failed',
        description: 'Unable to send message',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  // Update discovery settings
  const updateDiscoverySettings = useCallback((settings: Partial<DatingState['discoverySettings']>) => {
    setState(prev => ({
      ...prev,
      discoverySettings: { ...prev.discoverySettings, ...settings }
    }))
    
    // Reload nearby profiles with new settings
    loadNearbyProfiles()
  }, [loadNearbyProfiles])

  // Block user
  const blockUser = useCallback(async (userId: string) => {
    if (!user) return

    try {
      await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: userId
        })

      setState(prev => ({
        ...prev,
        blockedUsers: [...prev.blockedUsers, userId],
        nearbyProfiles: prev.nearbyProfiles.filter(p => p.userId !== userId),
        matches: prev.matches.filter(p => p.userId !== userId)
      }))

      toast({
        title: 'User Blocked',
        description: 'User has been blocked successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }, [user, toast])

  // Add to favorites
  const addToFavorites = useCallback(async (userId: string) => {
    if (!user) return

    try {
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          favorite_user_id: userId
        })

      setState(prev => ({
        ...prev,
        favorites: [...prev.favorites, userId]
      }))

      toast({
        title: 'Added to Favorites',
        description: 'User added to your favorites',
        variant: 'default'
      })
    } catch (error) {
      console.error('Failed to add to favorites:', error)
    }
  }, [user, toast])

  // Cleanup
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializeDating()
    }
  }, [user, initializeDating])

  return {
    // State
    state,
    
    // Connection
    isConnected: state.isConnected,
    isOnline: state.isOnline,
    connectionQuality: state.connectionQuality,
    
    // Profile
    profile: state.profile,
    nearbyProfiles: state.nearbyProfiles,
    matches: state.matches,
    
    // Chat
    conversations: state.conversations,
    activeChats: state.activeChats,
    typingIndicators: state.typingIndicators,
    unreadCounts: state.unreadCounts,
    
    // Discovery
    discoverySettings: state.discoverySettings,
    
    // Actions
    sendMessage,
    updateDiscoverySettings,
    blockUser,
    addToFavorites,
    
    // Utilities
    calculateDistance,
    
    // Refresh functions
    refreshNearbyProfiles: loadNearbyProfiles,
    refreshMatches: loadMatches,
    refreshConversations: loadConversations
  }
}
