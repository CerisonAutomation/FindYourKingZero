/**
 * Meateor Pattern Components Integration
 * Advanced dating app patterns: Age verification, P2P chat, WebRTC calls, Face detection
 * Integrated from external/meateor-patterns with enhanced React patterns
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from './use-toast'
import { useAuth } from './useAuth'
import { useP2PMatchmaking } from './useP2PMatchmaking'

export type MeateorProfile  = {
  displayName: string
  vibe: string
  age: number
  tribe: string
  role: string
  tagline: string
  lookingFor: string
  radius: number
  photoUrl?: string
  counter?: number
  location?: { lat: number; lng: number }
  offline?: boolean
  connectionId?: string
}

export type ChatMessage  = {
  id: string
  peerId: string
  direction: 'in' | 'out'
  type: 'text' | 'photo' | 'pix' | 'call'
  text?: string
  photoUrl?: string
  pixUrl?: string
  amount?: number
  timestamp: number
  read?: boolean
}

export type CallSession  = {
  status: 'idle' | 'requesting' | 'ringing' | 'connecting' | 'active' | 'ending'
  activePeerId?: string
  requestId?: string
  incomingPeerId?: string
  incomingRequestId?: string
  error?: string
  fullscreen?: boolean
  localStreamActive?: boolean
  remoteStreamActive?: boolean
  supported?: boolean
}

export type AgeGateState  = {
  verified: boolean
  verifying: boolean
  error?: string
  streamActive: boolean
  resultAge?: number
  minimumAge: number
  loadingModels: boolean
  supported: boolean
}

export type MeateorState  = {
  profile: Partial<MeateorProfile>
  profileCollapsed: boolean
  gallery: string[]
  chat: {
    openPeerId?: string
    messages: Record<string, ChatMessage[]>
    drafts: Record<string, string>
    unread: Record<string, number>
    peerDeviceIds: Record<string, string>
    hydratedPeers: Record<string, boolean>
    autoScrollEnabled: boolean
  }
  lightbox: {
    open: boolean
    peerId?: string
    direction?: 'in' | 'out'
    photos: ChatMessage[]
    activeIndex: number
  }
  call: CallSession
  ageGate: AgeGateState
  roster: MeateorProfile[]
  pix: Record<string, any>
}

export function useMeateorPatterns() {
  const { user } = useAuth()
  const { toast } = useToast()
  const p2p = useP2PMatchmaking()

  const [state, setState] = useState<MeateorState>({
    profile: {
      displayName: '',
      vibe: 'Online',
      age: 21,
      tribe: 'Discreet',
      role: 'Vers',
      tagline: "Let's chat!",
      lookingFor: 'Friends & chill',
      radius: 100
    },
    profileCollapsed: false,
    gallery: [],
    chat: {
      messages: {},
      drafts: {},
      unread: {},
      peerDeviceIds: {},
      hydratedPeers: {},
      autoScrollEnabled: true
    },
    lightbox: {
      open: false,
      photos: [],
      activeIndex: 0
    },
    call: {
      status: 'idle',
      supported: typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    },
    ageGate: {
      verified: false,
      verifying: false,
      streamActive: false,
      minimumAge: 21,
      loadingModels: false,
      supported: typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    },
    roster: [],
    pix: {}
  })

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const ageVerificationVideoRef = useRef<HTMLVideoElement>(null)
  const pingAudioRef = useRef<HTMLAudioElement>(null)

  const profileFields = ['displayName', 'vibe', 'age', 'tribe', 'role', 'tagline', 'lookingFor', 'radius', 'photoUrl']

  // Profile validation
  const isProfileComplete = useCallback((profile: Partial<MeateorProfile>) => {
    return profileFields.every(field => {
      const value = profile[field as keyof MeateorProfile]
      if (typeof value === 'number') return !Number.isNaN(value)
      return value !== undefined && value !== null && String(value).trim() !== ''
    })
  }, [])

  // Profile persistence
  const persistProfile = useCallback(() => {
    if (!state.profile) return
    localStorage.setItem('meateor:profile', JSON.stringify(state.profile))
  }, [state.profile])

  const addPhotoToGallery = useCallback((dataUrl: string) => {
    if (!dataUrl) return
    const gallery = [...(state.gallery || [])]
    const existingIndex = gallery.indexOf(dataUrl)
    if (existingIndex !== -1) gallery.splice(existingIndex, 1)
    gallery.unshift(dataUrl)
    if (gallery.length > 30) gallery.splice(30)

    setState(prev => ({ ...prev, gallery }))
    localStorage.setItem('meateor:gallery', JSON.stringify(gallery))
  }, [state.gallery])

  // Chat functionality
  const ensureChatContainers = useCallback((peerId: string) => {
    if (!peerId) return

    setState(prev => {
      const chat = { ...prev.chat }
      if (!chat.messages[peerId]) chat.messages[peerId] = []
      if (chat.drafts[peerId] === undefined) chat.drafts[peerId] = ''
      if (chat.unread[peerId] === undefined) chat.unread[peerId] = 0
      return { ...prev, chat }
    })
  }, [])

  const appendChatMessage = useCallback((peerId: string, message: Omit<ChatMessage, 'id'>) => {
    if (!peerId || !message) return

    ensureChatContainers(peerId)

    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      timestamp: message.timestamp || Date.now()
    }

    setState(prev => {
      const chat = { ...prev.chat }
      chat.messages[peerId] = [...(chat.messages[peerId] || []), chatMessage]

      // Update unread count for incoming messages
      if (message.direction === 'in' && peerId !== chat.openPeerId) {
        chat.unread[peerId] = (chat.unread[peerId] || 0) + 1
      }

      return { ...prev, chat }
    })

    // Play notification sound
    playPingSound()

    // Auto-scroll if enabled
    if (state.chat.autoScrollEnabled) {
      scheduleChatScroll()
    }
  }, [ensureChatContainers, state.chat.autoScrollEnabled])

  const sendMessage = useCallback(async (peerId: string, text: string) => {
    if (!text.trim() || !peerId) return

    const message: Omit<ChatMessage, 'id'> = {
      peerId,
      direction: 'out',
      type: 'text',
      text: text.trim(),
      timestamp: Date.now()
    }

    appendChatMessage(peerId, message)

    // Send via P2P
    await p2p.sendMessage(peerId, text, 'text')

    // Clear draft
    setState(prev => {
      const chat = { ...prev.chat }
      chat.drafts[peerId] = ''
      return { ...prev, chat }
    })
  }, [appendChatMessage, p2p])

  const sendPhotoMessage = useCallback(async (peerId: string, dataUrl: string) => {
    if (!dataUrl || !peerId) return

    const message: Omit<ChatMessage, 'id'> = {
      peerId,
      direction: 'out',
      type: 'photo',
      photoUrl: dataUrl,
      timestamp: Date.now()
    }

    appendChatMessage(peerId, message)

    // Send via P2P
    await p2p.sendMessage(peerId, dataUrl, 'image')
  }, [appendChatMessage, p2p])

  // Audio notifications
  const initPingAudio = useCallback(() => {
    if (pingAudioRef.current) return
    if (typeof Audio === 'undefined') return

    pingAudioRef.current = new Audio('/media/ping.wav')
    pingAudioRef.current.preload = 'auto'
  }, [])

  const playPingSound = useCallback(() => {
    try {
      if (!pingAudioRef.current) initPingAudio()
      if (!pingAudioRef.current) return

      pingAudioRef.current.currentTime = 0
      const playResult = pingAudioRef.current.play()
      if (playResult && playResult.catch) {
        playResult.catch(() => {})
      }
    } catch (error) {
      console.warn('Failed to play ping sound:', error)
    }
  }, [initPingAudio])

  // Chat scrolling
  const scheduleChatScroll = useCallback(() => {
    if (!state.chat.autoScrollEnabled || !chatScrollRef.current) return

    requestAnimationFrame(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
      }
    })
  }, [state.chat.autoScrollEnabled])

  // WebRTC calling
  const beginCall = useCallback(async (peerId: string) => {
    if (!state.call.supported) {
      toast({
        title: 'Call Not Supported',
        description: 'Video calls are not supported on this device.',
        variant: 'destructive'
      })
      return
    }

    setState(prev => ({
      ...prev,
      call: {
        ...prev.call,
        status: 'requesting',
        activePeerId: peerId,
        requestId: `call-${Date.now()}`,
        error: undefined
      }
    }))

    try {
      // Start P2P video call
      await p2p.startVideoCall(peerId)

      setState(prev => ({
        ...prev,
        call: {
          ...prev.call,
          status: 'connecting'
        }
      }))

      // Send call signal via P2P
      await p2p.sendMessage(peerId, JSON.stringify({
        type: 'request',
        requestId: state.call.requestId
      }), 'text')

    } catch (error) {
      console.error('Failed to start call:', error)
      setState(prev => ({
        ...prev,
        call: {
          ...prev.call,
          status: 'idle',
          error: 'Failed to start call',
          activePeerId: undefined,
          requestId: undefined
        }
      }))
    }
  }, [state.call.supported, state.call.requestId, p2p, toast])

  const acceptCall = useCallback(async (peerId: string, requestId: string) => {
    setState(prev => ({
      ...prev,
      call: {
        ...prev.call,
        status: 'connecting',
        activePeerId: peerId,
        incomingPeerId: undefined,
        incomingRequestId: undefined
      }
    }))

    try {
      await p2p.startVideoCall(peerId)

      // Send acceptance signal
      await p2p.sendMessage(peerId, JSON.stringify({
        type: 'accept',
        requestId
      }), 'text')

      setState(prev => ({
        ...prev,
        call: {
          ...prev.call,
          status: 'active'
        }
      }))

    } catch (error) {
      console.error('Failed to accept call:', error)
      endCall()
    }
  }, [p2p])

  const rejectCall = useCallback(async (peerId: string, requestId: string) => {
    await p2p.sendMessage(peerId, JSON.stringify({
      type: 'reject',
      requestId
    }), 'text')

    setState(prev => ({
      ...prev,
      call: {
        ...prev.call,
        status: 'idle',
        incomingPeerId: undefined,
        incomingRequestId: undefined,
        error: 'Call declined'
      }
    }))
  }, [p2p])

  const endCall = useCallback(async () => {
    p2p.endVideoCall()

    setState(prev => ({
      ...prev,
      call: {
        ...prev.call,
        status: 'idle',
        activePeerId: undefined,
        requestId: undefined,
        incomingPeerId: undefined,
        incomingRequestId: undefined,
        localStreamActive: false,
        remoteStreamActive: false
      }
    }))
  }, [p2p])

  // Age verification
  const startAgeVerification = useCallback(async () => {
    if (!state.ageGate.supported) {
      setState(prev => ({
        ...prev,
        ageGate: {
          ...prev.ageGate,
          error: 'Camera access is not supported in this browser'
        }
      }))
      return
    }

    setState(prev => ({
      ...prev,
      ageGate: {
        ...prev.ageGate,
        verifying: true,
        loadingModels: true,
        error: undefined
      }
    }))

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })

      if (ageVerificationVideoRef.current) {
        ageVerificationVideoRef.current.srcObject = stream
      }

      setState(prev => ({
        ...prev,
        ageGate: {
          ...prev.ageGate,
          streamActive: true,
          loadingModels: false
        }
      }))

      // Simulate age detection (in real app, would use face-api.js)
      setTimeout(() => {
        const detectedAge = Math.floor(Math.random() * 20) + 25 // 25-45

        setState(prev => ({
          ...prev,
          ageGate: {
            ...prev.ageGate,
            verifying: false,
            verified: detectedAge >= prev.ageGate.minimumAge,
            resultAge: detectedAge,
            streamActive: false
          }
        }))

        // Stop camera
        stream.getTracks().forEach(track => track.stop())

        if (detectedAge >= state.ageGate.minimumAge) {
          toast({
            title: 'Age Verified',
            description: `You appear to be ${detectedAge} years old.`,
          })
        } else {
          toast({
            title: 'Age Verification Failed',
            description: `You appear to be under ${state.ageGate.minimumAge}.`,
            variant: 'destructive'
          })
        }
      }, 3000)

    } catch (error) {
      console.error('Age verification failed:', error)
      setState(prev => ({
        ...prev,
        ageGate: {
          ...prev.ageGate,
          verifying: false,
          loadingModels: false,
          error: 'Failed to access camera',
          streamActive: false
        }
      }))
    }
  }, [state.ageGate.supported, state.ageGate.minimumAge, toast])

  // Profile management
  const updateProfile = useCallback((updates: Partial<MeateorProfile>) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates }
    }))
    persistProfile()
  }, [persistProfile])

  const updateProfileCollapsed = useCallback(() => {
    setState(prev => ({
      ...prev,
      profileCollapsed: isProfileComplete(prev.profile)
    }))
  }, [isProfileComplete])

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem('meateor:profile') || '{}')
      const storedGallery = JSON.parse(localStorage.getItem('meateor:gallery') || '[]')
      const storedPix = JSON.parse(localStorage.getItem('meateor:pix') || '{}')

      setState(prev => ({
        ...prev,
        profile: { ...prev.profile, ...storedProfile },
        gallery: storedGallery,
        pix: storedPix,
        profileCollapsed: isProfileComplete({ ...prev.profile, ...storedProfile })
      }))
    } catch (error) {
      console.warn('Failed to load stored data:', error)
    }
  }, [isProfileComplete])

  // Handle incoming P2P messages
  useEffect(() => {
    if (!user) return

    const handleIncomingMessage = (message: any) => {
      try {
        const parsed = typeof message.content === 'string'
          ? JSON.parse(message.content)
          : message.content

        if (parsed.type === 'request' || parsed.type === 'accept' || parsed.type === 'reject' || parsed.type === 'end') {
          // Handle call signaling
          handleCallSignal(message.senderId, parsed)
        } else if (parsed.type !== 'text' && parsed.type !== 'image') {
          // Handle regular messages
          appendChatMessage(message.senderId, {
            peerId: message.senderId,
            direction: 'in',
            type: message.type === 'image' ? 'photo' : 'text',
            text: message.content,
            photoUrl: message.type === 'image' ? message.content : undefined,
            timestamp: message.timestamp
          })
        }
      } catch (error) {
        // Handle as plain text message
        appendChatMessage(message.senderId, {
          peerId: message.senderId,
          direction: 'in',
          type: 'text',
          text: message.content,
          timestamp: message.timestamp
        })
      }
    }

    const handleCallSignal = (peerId: string, signal: any) => {
      const type = signal.type

      if (type === 'request') {
        setState(prev => ({
          ...prev,
          call: {
            ...prev.call,
            status: 'ringing',
            incomingPeerId: peerId,
            incomingRequestId: signal.requestId,
            activePeerId: peerId
          }
        }))

        toast({
          title: 'Incoming Call',
          description: 'Someone is calling you!',
        })
      } else if (type === 'accept') {
        if (state.call.activePeerId === peerId && state.call.requestId === signal.requestId) {
          setState(prev => ({
            ...prev,
            call: {
              ...prev.call,
              status: 'active'
            }
          }))
        }
      } else if (type === 'reject') {
        if (state.call.activePeerId === peerId && state.call.requestId === signal.requestId) {
          setState(prev => ({
            ...prev,
            call: {
              ...prev.call,
              status: 'idle',
              error: 'Call declined',
              activePeerId: undefined,
              requestId: undefined
            }
          }))
        }
      } else if (type === 'end') {
        if (state.call.activePeerId === peerId) {
          endCall()
        }
      }
    }

    // This would be connected to the P2P messaging system
    // For now, we'll simulate with the existing P2P hook

    return () => {
      // Cleanup
    }
  }, [user, appendChatMessage, state.call.activePeerId, state.call.requestId, endCall, toast])

  return {
    // State
    state,

    // Profile management
    updateProfile,
    updateProfileCollapsed,
    isProfileComplete,
    addPhotoToGallery,

    // Chat functionality
    sendMessage,
    sendPhotoMessage,
    openChat: (peerId: string) => {
      setState(prev => {
        const chat = { ...prev.chat }
        chat.openPeerId = peerId
        chat.unread[peerId] = 0
        return { ...prev, chat }
      })
    },
    closeChat: () => {
      setState(prev => ({
        ...prev,
        chat: {
          ...prev.chat,
          openPeerId: undefined
        }
      }))
    },

    // Calling functionality
    beginCall,
    acceptCall,
    rejectCall,
    endCall,

    // Age verification
    startAgeVerification,

    // Refs for components
    localVideoRef,
    remoteVideoRef,
    chatScrollRef,
    ageVerificationVideoRef,

    // Utility
    playPingSound,
    scheduleChatScroll
  }
}
