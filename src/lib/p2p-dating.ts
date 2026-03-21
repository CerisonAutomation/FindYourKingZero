/**
 * Peer-to-Peer Dating System
 * Real-time P2P connections for dating platform
 */

import { Room, Peer } from 'peerjs'
import { useEffect, useState, useCallback, useRef } from 'react'

// Types
export type P = 2PProfile {
  id: string
  name: string
  age: number
  bio: string
  photos: string[]
  isOnline: boolean
  isVerified: boolean
  membershipTier: 'free' | 'premium' | 'vip'
  lastSeen: string
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

export type P = 2PCallState {
  status: 'idle' | 'calling' | 'connected' | 'ended'
  peerId?: string
  stream?: MediaStream
}

interface P2PState {
  profile: P2PProfile | null
  peers: Map<string, P2PProfile>
  conversations: Map<string, P2PMessage[]>
  activeCall: P2PCallState
  isMatching: boolean
  nearbyPeers: P2PProfile[]
}

export function useP2PDating(roomId?: string) {
  const [state, setState] = useState<P2PState>({
    profile: null,
    peers: new Map(),
    conversations: new Map(),
    activeCall: { status: 'idle' },
    isMatching: false,
    nearbyPeers: []
  })

  const roomRef = useRef<Room | null>(null)
  const peerRef = useRef<Peer | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Initialize P2P connection
  useEffect(() => {
    if (!roomId) return

    const initializeP2P = async () => {
      try {
        // Initialize PeerJS
        const peer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        })

        peerRef.current = peer

        // Join room
        const room = peer.join(roomId, {
          mode: 'mesh',
          stream: await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          })
        })

        roomRef.current = room

        // Handle room events
        room.on('peer', (peer) => {
          console.log('Peer joined:', peer.id)
        })

        room.on('stream', (stream) => {
          console.log('Received stream from peer')
        })

      } catch (error) {
        console.error('Failed to initialize P2P:', error)
      }
    }

    initializeP2P()

    return () => {
      if (roomRef.current) {
        roomRef.current.close()
      }
      if (peerRef.current) {
        peerRef.current.destroy()
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [roomId])

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // This would load from Supabase in real implementation
        const mockProfile: P2PProfile = {
          id: 'user123',
          name: 'John Doe',
          age: 28,
          bio: 'Looking for meaningful connections',
          photos: [],
          isOnline: true,
          isVerified: false,
          membershipTier: 'free',
          lastSeen: new Date().toISOString(),
          interests: ['music', 'travel', 'fitness'],
          tribes: ['gay', 'professional'],
          lookingFor: ['dating', 'friendship'],
          position: 'vers',
          status: 'single',
          pronouns: 'he/him'
        }

        setState(prev => ({ ...prev, profile: mockProfile }))
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    loadProfile()
  }, [])

  // Message handling
  const sendMessage = useCallback((peerId: string, content: string) => {
    const message: P2PMessage = {
      id: Date.now().toString(),
      senderId: state.profile?.id || '',
      receiverId: peerId,
      content,
      timestamp: Date.now(),
      type: 'text'
    }

    setState(prev => {
      const conversations = new Map(prev.conversations)
      const chat = conversations.get(peerId) || []
      conversations.set(peerId, [...chat, message])
      return { ...prev, conversations }
    })

    // Send via P2P in real implementation
    console.log('Sending message:', message)
  }, [state.profile])

  // Call handling
  const startCall = useCallback(async (peerId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      setState(prev => ({
        ...prev,
        activeCall: { status: 'calling', peerId, stream }
      }))

      // Initiate P2P call in real implementation
      console.log('Starting call with:', peerId)
    } catch (error) {
      console.error('Failed to start call:', error)
    }
  }, [])

  const endCall = useCallback(() => {
    if (state.activeCall.stream) {
      state.activeCall.stream.getTracks().forEach(track => track.stop())
    }

    setState(prev => ({
      ...prev,
      activeCall: { status: 'idle' }
    }))
  }, [state.activeCall.stream])

  // Location-based matching
  const findNearbyPeers = useCallback(async (radius: number = 10) => {
    setState(prev => ({ ...prev, isMatching: true }))

    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      // Find nearby peers in real implementation
      console.log('Finding peers near:', position.coords, `within ${radius}km`)

      // Mock nearby peers for demo
      const mockNearby: P2PProfile[] = [
        {
          id: 'nearby1',
          name: 'Alex',
          age: 26,
          bio: 'Coffee enthusiast and dog lover',
          photos: [],
          isOnline: true,
          isVerified: true,
          membershipTier: 'premium',
          lastSeen: new Date().toISOString(),
          interests: ['coffee', 'dogs', 'hiking'],
          tribes: ['gay', 'creative'],
          lookingFor: ['dating'],
          position: 'bottom',
          status: 'single',
          pronouns: 'they/them'
        }
      ]

      setState(prev => ({ 
        ...prev, 
        nearbyPeers: mockNearby,
        isMatching: false 
      }))
    } catch (error) {
      console.error('Failed to find nearby peers:', error)
      setState(prev => ({ ...prev, isMatching: false }))
    }
  }, [])

  return {
    // State
    profile: state.profile,
    peers: Array.from(state.peers.values()),
    conversations: Object.fromEntries(state.conversations),
    activeCall: state.activeCall,
    isMatching: state.isMatching,
    nearbyPeers: state.nearbyPeers,

    // Actions
    sendMessage,
    startCall,
    endCall,
    findNearbyPeers,

    // Utilities
    isConnected: !!peerRef.current,
    isInCall: state.activeCall.status !== 'idle'
  }
}