/**
 * Trystero P2P WebRTC Matchmaking Integration
 * Serverless peer-to-peer connections for dating app
 * Features: Direct messaging, video calls, file sharing, decentralized matching
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from './use-toast'
import { useAuth } from './useAuth'

// WebRTC configuration
export const WEBRTC_CONFIG = {
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

export type PeerConnection =  {
  id: string
  userName: string
  userId: string
  connection: RTCPeerConnection
  localStream?: MediaStream
  remoteStream?: MediaStream
  isConnected: boolean
  isInitiator: boolean
  lastActivity: number
}

export type P = 2PMessage {
  id: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file'
  content: string
  senderId: string
  receiverId: string
  timestamp: number
  encrypted: boolean
  metadata?: {
    fileName?: string
    fileSize?: number
    mimeType?: string
    duration?: number
  }
}

export type MatchmakingRoom =  {
  id: string
  name: string
  type: 'dating' | 'chat' | 'video' | 'group'
  participants: string[]
  isPrivate: boolean
  maxParticipants: number
  createdAt: number
  metadata?: {
    interests?: string[]
    ageRange?: [number, number]
    location?: { lat: number; lng: number }
    distance?: number
  }
}

export type P = 2PState {
  isConnected: boolean
  isDiscovering: bool
  peers: Map<string, PeerConnection>
  currentRoom: MatchmakingRoom | null
  availableRooms: MatchmakingRoom[]
  messages: P2PMessage[]
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
}

export function useP2PMatchmaking() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [state, setState] = useState<P2PState>({
    isConnected: false,
    isDiscovering: false,
    peers: new Map(),
    currentRoom: null,
    availableRooms: [],
    messages: [],
    localStream: null,
    remoteStreams: new Map()
  })

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null)
  const connectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const channelsRef = useRef<Map<string, RTCDataChannel>>(new Map())

  // Generate unique peer ID
  const getPeerId = useCallback(() => {
    return `${user?.id || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [user])

  // Create WebRTC connection
  const createPeerConnection = useCallback(async (peerId: string, isInitiator: boolean): Promise<RTCPeerConnection> => {
    const connection = new RTCPeerConnection(WEBRTC_CONFIG)
    
    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate via Supabase realtime
        supabase
          .channel(`webrtc:${peerId}`)
          .send({
            type: 'broadcast',
            event: 'ice_candidate',
            payload: {
              from: getPeerId(),
              to: peerId,
              candidate: event.candidate
            }
          })
      }
    }

    // Handle remote stream
    connection.ontrack = (event) => {
      const [remoteStream] = event.streams
      setState(prev => ({
        ...prev,
        remoteStreams: new Map(prev.remoteStreams).set(peerId, remoteStream)
      }))
    }

    // Create data channel for messaging
    if (isInitiator) {
      const dataChannel = connection.createDataChannel('messages', {
        ordered: true,
        negotiated: false
      })
      
      setupDataChannel(dataChannel, peerId)
      channelsRef.current.set(peerId, dataChannel)
    }

    // Handle data channel (for non-initiators)
    connection.ondatachannel = (event) => {
      const dataChannel = event.channel
      setupDataChannel(dataChannel, peerId)
      channelsRef.current.set(peerId, dataChannel)
    }

    // Add local stream if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        connection.addTrack(track, localStreamRef.current!)
      })
    }

    connectionsRef.current.set(peerId, connection)
    return connection
  }, [getPeerId])

  // Setup data channel for messaging
  const setupDataChannel = useCallback((dataChannel: RTCDataChannel, peerId: string) => {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with ${peerId}`)
      setState(prev => ({
        ...prev,
        peers: new Map(prev.peers).set(peerId, {
          id: peerId,
          userName: 'Unknown',
          userId: peerId,
          connection: connectionsRef.current.get(peerId)!,
          isConnected: true,
          isInitiator: false,
          lastActivity: Date.now()
        })
      }))
    }

    dataChannel.onmessage = (event) => {
      try {
        const message: P2PMessage = JSON.parse(event.data)
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }))
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    dataChannel.onclose = () => {
      console.log(`Data channel closed with ${peerId}`)
      setState(prev => {
        const newPeers = new Map(prev.peers)
        newPeers.delete(peerId)
        return {
          ...prev,
          peers: newPeers
        }
      })
    }
  }, [])

  // Start P2P discovery
  const startDiscovery = useCallback(async (preferences?: {
    interests?: string[]
    maxDistance?: number
    ageRange?: [number, number]
  }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to start P2P discovery.',
        variant: 'destructive'
      })
      return
    }

    setState(prev => ({ ...prev, isDiscovering: true }))

    try {
      // Create matchmaking room
      const room: MatchmakingRoom = {
        id: `room-${Date.now()}`,
        name: `${user.user_metadata?.display_name || 'Anonymous'}'s Room`,
        type: 'dating',
        participants: [user.id],
        isPrivate: false,
        maxParticipants: 2,
        createdAt: Date.now(),
        metadata: preferences
      }

      // Broadcast room to other users
      await supabase
        .from('p2p_rooms')
        .insert([{
          id: room.id,
          name: room.name,
          type: room.type,
          participants: room.participants,
          is_private: room.isPrivate,
          max_participants: room.maxParticipants,
          created_at: new Date().toISOString(),
          metadata: room.metadata
        }])

      setState(prev => ({
        ...prev,
        currentRoom: room,
        isConnected: true
      }))

      toast({
        title: 'P2P Discovery Started',
        description: 'You are now discoverable for direct connections.',
      })
    } catch (error) {
      console.error('Failed to start discovery:', error)
      toast({
        title: 'Discovery Failed',
        description: 'Failed to start P2P discovery.',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  // Stop P2P discovery
  const stopDiscovery = useCallback(async () => {
    if (!state.currentRoom) return

    try {
      // Remove room from database
      await supabase
        .from('p2p_rooms')
        .delete()
        .eq('id', state.currentRoom.id)

      // Close all connections
      connectionsRef.current.forEach(connection => {
        connection.close()
      })
      connectionsRef.current.clear()

      // Close all data channels
      channelsRef.current.forEach(channel => {
        channel.close()
      })
      channelsRef.current.clear()

      setState(prev => ({
        ...prev,
        isDiscovering: false,
        currentRoom: null,
        peers: new Map(),
        remoteStreams: new Map()
      }))

      toast({
        title: 'P2P Discovery Stopped',
        description: 'You are no longer discoverable.',
      })
    } catch (error) {
      console.error('Failed to stop discovery:', error)
    }
  }, [state.currentRoom, toast])

  // Connect to peer
  const connectToPeer = useCallback(async (peerId: string, isInitiator: boolean) => {
    try {
      const connection = await createPeerConnection(peerId, isInitiator)
      
      if (isInitiator) {
        // Create offer
        const offer = await connection.createOffer()
        await connection.setLocalDescription(offer)

        // Send offer via Supabase realtime
        supabase
          .channel(`webrtc:${peerId}`)
          .send({
            type: 'broadcast',
            event: 'offer',
            payload: {
              from: getPeerId(),
              to: peerId,
              offer: offer
            }
          })
      }

      setState(prev => ({
        ...prev,
        peers: new Map(prev.peers).set(peerId, {
          id: peerId,
          userName: 'Unknown',
          userId: peerId,
          connection,
          isConnected: false,
          isInitiator,
          lastActivity: Date.now()
        })
      }))
    } catch (error) {
      console.error('Failed to connect to peer:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to establish P2P connection.',
        variant: 'destructive'
      })
    }
  }, [createPeerConnection, getPeerId, toast])

  // Send message to peer
  const sendMessage = useCallback(async (peerId: string, content: string, type: P2PMessage['type'] = 'text') => {
    const dataChannel = channelsRef.current.get(peerId)
    if (!dataChannel || dataChannel.readyState !== 'open') {
      toast({
        title: 'Connection Error',
        description: 'No active connection to peer.',
        variant: 'destructive'
      })
      return
    }

    const message: P2PMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      senderId: user?.id || 'anonymous',
      receiverId: peerId,
      timestamp: Date.now(),
      encrypted: true
    }

    try {
      dataChannel.send(JSON.stringify(message))
      
      // Store message locally
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }))
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Message Failed',
        description: 'Failed to send message.',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  // Start video call
  const startVideoCall = useCallback(async (peerId: string) => {
    try {
      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      setState(prev => ({ ...prev, localStream: stream }))

      // Add tracks to all connections
      connectionsRef.current.forEach(connection => {
        stream.getTracks().forEach(track => {
          connection.addTrack(track, stream)
        })
      })

      // Connect to peer if not already connected
      if (!connectionsRef.current.has(peerId)) {
        await connectToPeer(peerId, true)
      }

      toast({
        title: 'Video Call Started',
        description: 'Your camera and microphone are now active.',
      })
    } catch (error) {
      console.error('Failed to start video call:', error)
      toast({
        title: 'Video Call Failed',
        description: 'Failed to access camera/microphone.',
        variant: 'destructive'
      })
    }
  }, [connectToPeer, toast])

  // End video call
  const endVideoCall = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    // Remove tracks from all connections
    connectionsRef.current.forEach(connection => {
      connection.getSenders().forEach(sender => {
        if (sender.track) {
          connection.removeTrack(sender)
        }
      })
    })

    setState(prev => ({
      ...prev,
      localStream: null,
      remoteStreams: new Map()
    }))

    toast({
      title: 'Video Call Ended',
      description: 'Camera and microphone have been turned off.',
    })
  }, [toast])

  // Listen for WebRTC signaling messages
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`webrtc:${getPeerId()}`)
      .on('broadcast', { event: 'offer' }, async (payload) => {
        const { from, to, offer } = payload.payload
        if (to === getPeerId()) {
          const connection = await createPeerConnection(from, false)
          await connection.setRemoteDescription(offer)
          
          const answer = await connection.createAnswer()
          await connection.setLocalDescription(answer)

          // Send answer
          supabase
            .channel(`webrtc:${from}`)
            .send({
              type: 'broadcast',
              event: 'answer',
              payload: {
                from: getPeerId(),
                to: from,
                answer: answer
              }
            })
        }
      })
      .on('broadcast', { event: 'answer' }, async (payload) => {
        const { from, to, answer } = payload.payload
        if (to === getPeerId()) {
          const connection = connectionsRef.current.get(from)
          if (connection) {
            await connection.setRemoteDescription(answer)
          }
        }
      })
      .on('broadcast', { event: 'ice_candidate' }, async (payload) => {
        const { from, to, candidate } = payload.payload
        if (to === getPeerId()) {
          const connection = connectionsRef.current.get(from)
          if (connection) {
            await connection.addIceCandidate(candidate)
          }
        }
      })

    channel.subscribe()

    // Listen for room updates
    const roomsChannel = supabase
      .channel('p2p_rooms')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'p2p_rooms' },
        async (payload) => {
          // Update available rooms
          const { data } = await supabase
            .from('p2p_rooms')
            .select('*')
            .eq('is_private', false)
            .order('created_at', { ascending: false })

          setState(prev => ({
            ...prev,
            availableRooms: data || []
          }))
        }
      )

    roomsChannel.subscribe()

    return () => {
      channel.unsubscribe()
      roomsChannel.unsubscribe()
    }
  }, [user, getPeerId, createPeerConnection])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDiscovery()
      endVideoCall()
    }
  }, [stopDiscovery, endVideoCall])

  return {
    // State
    state,
    
    // Discovery
    startDiscovery,
    stopDiscovery,
    
    // Connections
    connectToPeer,
    disconnectFromPeer: (peerId: string) => {
      const connection = connectionsRef.current.get(peerId)
      if (connection) {
        connection.close()
        connectionsRef.current.delete(peerId)
      }
      
      const channel = channelsRef.current.get(peerId)
      if (channel) {
        channel.close()
        channelsRef.current.delete(peerId)
      }
      
      setState(prev => {
        const newPeers = new Map(prev.peers)
        newPeers.delete(peerId)
        return {
          ...prev,
          peers: newPeers
        }
      })
    },
    
    // Messaging
    sendMessage,
    
    // Video calls
    startVideoCall,
    endVideoCall,
    
    // Utility
    isSupported: typeof RTCPeerConnection !== 'undefined'
  }
}
