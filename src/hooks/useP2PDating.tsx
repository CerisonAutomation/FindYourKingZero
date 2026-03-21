/**
 * 🚀 P2P DATING HOOK - Production-Ready Privacy-First Dating
 * Trystero 0.22.0 integration with Supabase fallback
 * Complete dating app superset: Grindr/ROMEO/MACHOBB/Meateor features
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { selfId } from 'trystero'
import { joinRoom as joinTrysteroRoom } from 'trystero'
import { WebrtcProvider } from 'y-webrtc-trystero'
import * as Y from 'yjs'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

// Types for P2P dating
export type P = 2PProfile {
  id: string
  name: string
  age: number
  bio: string
  photos: string[]
  location?: {
    latitude: number
    longitude: number
    timestamp: number
  }
  isOnline: boolean
  isVerified: boolean
  membershipTier: 'free' | 'plus' | 'pro' | 'elite'
  lastSeen: string
  distance?: number
  compatibility?: number
  interests: string[]
  tribes: string[]
  lookingFor: string[]
  position: 'top' | 'vers' | 'bottom' | 'flexible'
  status: 'single' | 'dating' | 'relationship' | 'open'
  hivStatus?: 'negative' | 'positive' | 'on-prep' | 'undetectable'
  pronouns: string
}

export type P = 2PMessage {
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
}

export type P = 2PCall {
  id: string
  callerId: string
  receiverId: string
  type: 'audio' | 'video'
  status: 'calling' | 'connected' | 'ended' | 'missed'
  startTime?: number
  endTime?: number
  duration?: number
}

export type P = 2PRoom {
  id: string
  type: 'nearby' | 'global' | 'tribe' | 'private'
  name: string
  members: string[]
  maxDistance?: number
  ageRange?: [number, number]
  interests?: string[]
  isPrivate: boolean
  createdAt: number
}

export type P = 2PDatingState {
  // Connection state
  isConnected: boolean
  currentRoom: string | null
  peers: string[]

  // Profile state
  profile: P2PProfile | null
  nearbyProfiles: P2PProfile[]
  matches: P2PProfile[]
  blockedUsers: string[]

  // Chat state
  conversations: Map<string, P2PMessage[]>
  activeChats: string[]
  typingIndicators: Map<string, boolean>

  // Call state
  activeCall: P2PCall | null
  incomingCall: P2PCall | null
  callHistory: P2PCall[]

  // Room state
  availableRooms: P2PRoom[]
  joinedRooms: string[]

  // Sync state
  sharedState: Y.Doc | null
  crdtProvider: WebrtcProvider | null
}

// Configuration
const P2P_CONFIG = {
  appId: import.meta.env.VITE_SUPABASE_URL || 'findyourking-zero',
  password: import.meta.env.VITE_P2P_PASSWORD || undefined,
  turnConfig: [
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ],
  maxPeers: 50,
  heartbeatInterval: 30000,
  syncInterval: 5000
}

export function useP2PDating() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [state, setState] = useState<P2PDatingState>({
    isConnected: false,
    currentRoom: null,
    peers: [],
    profile: null,
    nearbyProfiles: [],
    matches: [],
    blockedUsers: [],
    conversations: new Map(),
    activeChats: [],
    typingIndicators: new Map(),
    activeCall: null,
    incomingCall: null,
    callHistory: [],
    availableRooms: [],
    joinedRooms: [],
    sharedState: null,
    crdtProvider: null
  })

  const roomRef = useRef<any>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Initialize P2P connection
  const initializeConnection = useCallback(async () => {
    if (!user || roomRef.current) return

    try {
      // Join global room for discovery
      const room = joinTrysteroRoom({
        appId: P2P_CONFIG.appId,
        password: P2P_CONFIG.password,
        turnConfig: P2P_CONFIG.turnConfig
      }, 'global')

      roomRef.current = room

      // Set up Yjs CRDT for shared state
      const ydoc = new Y.Doc()
      const provider = new WebrtcProvider('findyourking-crdt', ydoc, {
        signaling: ['wss://signaling.yjs.dev'],
        maxPeers: P2P_CONFIG.maxPeers
      })

      setState(prev => ({
        ...prev,
        isConnected: true,
        sharedState: ydoc,
        crdtProvider: provider
      }))

      // Set up event listeners
      setupEventListeners(room)

      // Start heartbeat
      startHeartbeat()

      // Load user profile
      await loadUserProfile()

      // Start location sharing
      startLocationSharing()

      toast({
        title: 'P2P Connected',
        description: 'Privacy-first dating network active',
        variant: 'default'
      })

    } catch (error) {
      console.error('P2P connection failed:', error)
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to P2P network',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  // Set up event listeners
  const setupEventListeners = useCallback((room: any) => {
    // Peer join/leave events
    room.onPeerJoin((peerId: string) => {
      console.log('Peer joined:', peerId)
      setState(prev => ({
        ...prev,
        peers: [...prev.peers, peerId]
      }))

      // Request peer profile
      requestPeerProfile(peerId)
    })

    room.onPeerLeave((peerId: string) => {
      console.log('Peer left:', peerId)
      setState(prev => ({
        ...prev,
        peers: prev.peers.filter(id => id !== peerId),
        nearbyProfiles: prev.nearbyProfiles.filter(p => p.id !== peerId)
      }))
    })

    // Set up P2P actions
    setupActions(room)

    // Set up WebRTC streams
    setupWebRTC(room)
  }, [])

  // Set up P2P actions
  const setupActions = useCallback((room: any) => {
    // Profile exchange
    const [sendProfile, getProfile] = room.makeAction('profile')
    const [sendProfileRequest, getProfileRequest] = room.makeAction('profile-request')

    getProfileRequest((_data: any, peerId: string) => {
      if (state.profile) {
        sendProfile(state.profile, peerId)
      }
    })

    getProfile((profile: P2PProfile, peerId: string) => {
      setState(prev => ({
        ...prev,
        nearbyProfiles: [...prev.nearbyProfiles.filter(p => p.id !== profile.id), profile]
      }))
    })

    // Messaging
    const [sendMessage, getMessage] = room.makeAction('message')
    const [sendTyping, getTyping] = room.makeAction('typing')

    getMessage((message: P2PMessage, peerId: string) => {
      setState(prev => {
        const conversations = new Map(prev.conversations)
        const chat = conversations.get(peerId) || []
        conversations.set(peerId, [...chat, message])
        return { ...prev, conversations }
      })
    })

    getTyping((isTyping: boolean, peerId: string) => {
      setState(prev => {
        const typingIndicators = new Map(prev.typingIndicators)
        typingIndicators.set(peerId, isTyping)
        return { ...prev, typingIndicators }
      })
    })

    // Reactions
    const [sendReaction, getReaction] = room.makeAction('reaction')

    getReaction((data: { messageId: string; reaction: string }, peerId: string) => {
      setState(prev => {
        const conversations = new Map(prev.conversations)
        const chat = conversations.get(peerId) || []
        const messageIndex = chat.findIndex(m => m.id === data.messageId)

        if (messageIndex >= 0) {
          const message = chat[messageIndex]
          if (message) {
            const updatedMessage: P2PMessage = {
              ...message,
              metadata: { ...message.metadata, reaction: data.reaction }
            }
            chat[messageIndex] = updatedMessage
          }
          conversations.set(peerId, chat)
        }

        return { ...prev, conversations }
      })
    })

    // Calls
    const [sendCall, getCall] = room.makeAction('call')
    const [sendCallResponse, getCallResponse] = room.makeAction('call-response')

    getCall((call: P2PCall, peerId: string) => {
      setState(prev => ({
        ...prev,
        incomingCall: call
      }))

      toast({
        title: 'Incoming Call',
        description: `${call.type === 'video' ? 'Video' : 'Audio'} call from ${peerId}`,
        variant: 'default'
      })
    })

    // Location updates
    const [sendLocation, getLocation] = room.makeAction('location')

    getLocation((location: { latitude: number; longitude: number; timestamp: number }, peerId: string) => {
      setState(prev => {
        const nearbyProfiles = [...prev.nearbyProfiles]
        const index = nearbyProfiles.findIndex(p => p.id === peerId)

        if (index >= 0) {
          nearbyProfiles[index] = {
            ...nearbyProfiles[index],
            location,
            distance: calculateDistance(
              state.profile?.location?.latitude || 0,
              state.profile?.location?.longitude || 0,
              location.latitude,
              location.longitude
            )
          }
        }

        return { ...prev, nearbyProfiles }
      })
    })

    // Store action handlers for external use
    ;(room as any)._actions = {
      sendProfile,
      sendProfileRequest,
      sendMessage,
      sendTyping,
      sendReaction,
      sendCall,
      sendCallResponse,
      sendLocation
    }
  }, [state.profile])

  // Set up WebRTC for calls
  const setupWebRTC = useCallback(async (room: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })

      localStreamRef.current = stream

      room.onPeerStream((stream: MediaStream, peerId: string) => {
        console.log('Received stream from:', peerId)
        // Handle incoming stream for calls
      })
    } catch (error) {
      console.warn('Camera/mic access denied:', error)
    }
  }, [])

  // Request peer profile
  const requestPeerProfile = useCallback((peerId: string) => {
    const room = roomRef.current
    if (room && (room as any)._actions?.sendProfileRequest) {
      ;(room as any)._actions.sendProfileRequest({}, peerId)
    }
  }, [])

  // Load user profile from Supabase
  const loadUserProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        const p2pProfile: P2PProfile = {
          id: user.id,
          name: profile.display_name || 'Anonymous',
          age: profile.age || 25,
          bio: profile.bio || '',
          photos: profile.avatar_url ? [profile.avatar_url] : [],
          isOnline: true,
          isVerified: profile.age_verified || false,
          membershipTier: 'free', // Default tier
          lastSeen: new Date().toISOString(),
          interests: profile.interests || [],
          tribes: profile.tribes || [],
          lookingFor: Array.isArray(profile.relationship_goals) ? profile.relationship_goals : [profile.relationship_goals || 'dating'],
          position: 'flexible', // Default
          status: profile.relationship_status || 'single',
          pronouns: 'he/him' // Default
        }

        // Only add hivStatus if it's valid
        if (profile.hiv_status === 'negative' || profile.hiv_status === 'positive' || profile.hiv_status === 'on-prep' || profile.hiv_status === 'undetectable') {
          p2pProfile.hivStatus = profile.hiv_status
        }

        setState(prev => ({ ...prev, profile: p2pProfile }))
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }, [user])

  // Start location sharing
  const startLocationSharing = useCallback(() => {
    if (!navigator.geolocation) return

    const shareLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000
          })
        })

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        }

        const room = roomRef.current
        if (room && (room as any)._actions?.sendLocation) {
          ;(room as any)._actions.sendLocation(location)
        }

        // Update own profile location
        setState(prev => {
          if (prev.profile) {
            return {
              ...prev,
              profile: { ...prev.profile, location }
            }
          }
          return prev
        })

      } catch (error) {
        console.warn('Location sharing failed:', error)
      }
    }

    // Share location immediately and then every 30 seconds
    shareLocation()
    setInterval(shareLocation, 30000)
  }, [])

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    heartbeatRef.current = setInterval(() => {
      const room = roomRef.current
      if (room && state.profile) {
        // Update online status
        setState(prev => ({
          ...prev,
          profile: prev.profile ? {
            ...prev.profile,
            lastSeen: new Date().toISOString(),
            isOnline: true
          } : null
        }))
      }
    }, P2P_CONFIG.heartbeatInterval)
  }, [state.profile])

  // Send message
  const sendMessage = useCallback((receiverId: string, content: string, type: P2PMessage['type'] = 'text') => {
    const room = roomRef.current
    if (!room || !state.profile || !(room as any)._actions?.sendMessage) return

    const message: P2PMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: state.profile.id,
      receiverId,
      content,
      timestamp: Date.now(),
      type
    }

    ;(room as any)._actions.sendMessage(message, receiverId)

    // Add to local conversation
    setState(prev => {
      const conversations = new Map(prev.conversations)
      const chat = conversations.get(receiverId) || []
      conversations.set(receiverId, [...chat, message])
      return { ...prev, conversations, activeChats: [...prev.activeChats, receiverId] }
    })
  }, [state.profile])

  // Send typing indicator
  const sendTyping = useCallback((receiverId: string, isTyping: boolean) => {
    const room = roomRef.current
    if (!room || !(room as any)._actions?.sendTyping) return

    ;(room as any)._actions.sendTyping(isTyping, receiverId)
  }, [])

  // Send reaction
  const sendReaction = useCallback((receiverId: string, messageId: string, reaction: string) => {
    const room = roomRef.current
    if (!room || !(room as any)._actions?.sendReaction) return

    ;(room as any)._actions.sendReaction({ messageId, reaction }, receiverId)
  }, [])

  // Start call
  const startCall = useCallback((receiverId: string, type: P2PCall['type']) => {
    const room = roomRef.current
    if (!room || !state.profile || !(room as any)._actions?.sendCall) return

    const call: P2PCall = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callerId: state.profile.id,
      receiverId,
      type,
      status: 'calling',
      startTime: Date.now()
    }

    ;(room as any)._actions.sendCall(call, receiverId)

    setState(prev => ({
      ...prev,
      activeCall: call
    }))
  }, [state.profile])

  // Accept call
  const acceptCall = useCallback(() => {
    const room = roomRef.current
    if (!room || !state.incomingCall || !(room as any)._actions?.sendCallResponse) return

    const response = {
      callId: state.incomingCall.id,
      accepted: true
    }

    ;(room as any)._actions.sendCallResponse(response, state.incomingCall.callerId)

    setState(prev => ({
      ...prev,
      activeCall: { ...state.incomingCall!, status: 'connected', startTime: Date.now() },
      incomingCall: null
    }))
  }, [state.incomingCall])

  // Decline call
  const declineCall = useCallback(() => {
    const room = roomRef.current
    if (!room || !state.incomingCall || !(room as any)._actions?.sendCallResponse) return

    const response = {
      callId: state.incomingCall.id,
      accepted: false
    }

    ;(room as any)._actions.sendCallResponse(response, state.incomingCall.callerId)

    setState(prev => ({
      ...prev,
      incomingCall: null,
      callHistory: [...prev.callHistory, { ...state.incomingCall!, status: 'missed' }]
    }))
  }, [state.incomingCall])

  // End call
  const endCall = useCallback(() => {
    if (!state.activeCall) return

    const endTime = Date.now()
    const duration = state.activeCall.startTime ? endTime - state.activeCall.startTime : 0

    setState(prev => ({
      ...prev,
      activeCall: null,
      callHistory: [...prev.callHistory, {
        ...prev.activeCall!,
        status: 'ended',
        endTime,
        duration
      }]
    }))
  }, [state.activeCall])

  // Join room
  const joinRoom = useCallback((roomId: string) => {
    const room = roomRef.current
    if (!room) return

    // Leave current room and join new one
    room.leave()

    const newRoom = joinRoom({
      appId: P2P_CONFIG.appId,
      password: P2P_CONFIG.password,
      turnConfig: P2P_CONFIG.turnConfig
    }, roomId)

    roomRef.current = newRoom
    setupEventListeners(newRoom)

    setState(prev => ({
      ...prev,
      currentRoom: roomId,
      joinedRooms: [...prev.joinedRooms, roomId]
    }))
  }, [])

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

  // Cleanup
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }

      if (roomRef.current) {
        roomRef.current.leave()
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }

      if (state.crdtProvider) {
        state.crdtProvider.destroy()
      }
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializeConnection()
    }
  }, [user, initializeConnection])

  return {
    // State
    state,

    // Connection
    isConnected: state.isConnected,
    peers: state.peers,

    // Profile
    profile: state.profile,
    nearbyProfiles: state.nearbyProfiles,
    matches: state.matches,

    // Chat
    conversations: state.conversations,
    activeChats: state.activeChats,
    typingIndicators: state.typingIndicators,

    // Calls
    activeCall: state.activeCall,
    incomingCall: state.incomingCall,
    callHistory: state.callHistory,

    // Actions
    sendMessage,
    sendTyping,
    sendReaction,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    joinRoom,

    // Utilities
    calculateDistance,

    // Self ID
    selfId: selfId()
  }
}
