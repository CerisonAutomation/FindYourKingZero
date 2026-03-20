/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 UNIFIED P2P CHAT HOOK - Clean Implementation
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Replaces complex useDating hook with clean P2P chat implementation.
 * Inspired by Zenith Connect's useP2PChat but enhanced for our enterprise features.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChatRoom, getChatRoomId, type ChatRoom, type ChatMessage, type Reaction, type TypingPayload } from '@/lib/trystero/room'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface UseP2PChatOptions {
  autoConnect?: boolean
  enableReactions?: boolean
  enableTyping?: boolean
  enableReadReceipts?: boolean
  messageRetention?: number // hours
}

export interface UseP2PChatReturn {
  // State
  messages: ChatMessage[]
  reactions: Record<string, Reaction[]>
  typingPeers: Set<string>
  peers: string[]
  isConnected: boolean
  isTyping: boolean
  
  // Actions
  sendMessage: (content: string) => void
  sendReaction: (messageId: string, emoji: string) => void
  setTyping: (isTyping: boolean) => void
  editMessage: (messageId: string, content: string) => void
  unsendMessage: (messageId: string) => void
  
  // Room management
  leaveRoom: () => void
  reconnect: () => void
  
  // Utility
  getOtherUserId: () => string | null
}

/**
 * Clean P2P chat hook that replaces the complex useDating hook
 */
export function useP2PChat(
  peerId: string, 
  options: UseP2PChatOptions = {}
): UseP2PChatReturn {
  const { user } = useAuth()
  const {
    autoConnect = true,
    enableReactions = true,
    enableTyping = true,
    enableReadReceipts = true,
    messageRetention = 24 // hours
  } = options

  // Refs
  const roomRef = useRef<ChatRoom | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  const [typingPeers, setTypingPeers] = useState<Set<string>>(new Set())
  const [peers, setPeers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Generate room ID
  const roomId = user ? getChatRoomId(user.id, peerId) : ''

  // Initialize room
  useEffect(() => {
    if (!user || !autoConnect) return

    const chatRoom = roomRef.current = createChatRoom(roomId)
    setIsConnected(chatRoom.isConnected())

    // Message handling
    chatRoom.onMsg((msg) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.find((m) => m.id === msg.id)) return prev
        
        const newMessages = [...prev, msg].sort((a, b) => a.timestamp - b.timestamp)
        
        // Auto-cleanup old messages
        const cutoff = Date.now() - (messageRetention * 60 * 60 * 1000)
        return newMessages.filter(m => m.timestamp > cutoff)
      })

      // Send read receipt
      if (enableReadReceipts) {
        chatRoom.sendReceipt({
          messageId: msg.id,
          readBy: user.id,
          timestamp: Date.now(),
        })
      }
    })

    // Reaction handling
    if (enableReactions) {
      chatRoom.onReaction((reaction) => {
        setReactions((prev) => ({
          ...prev,
          [reaction.messageId]: [
            ...(prev[reaction.messageId] ?? []).filter((r) => r.senderId !== reaction.senderId),
            reaction,
          ],
        }))
      })
    }

    // Typing handling
    if (enableTyping) {
      chatRoom.onTyping((payload) => {
        setTypingPeers((prev) => {
          const next = new Set(prev)
          if (payload.isTyping) next.add(payload.userId)
          else next.delete(payload.userId)
          return next
        })
      })
    }

    // Edit handling
    chatRoom.onEdit(({ messageId, content }) => {
      setMessages((prev) => 
        prev.map((m) => 
          m.id === messageId 
            ? { ...m, content, edited: true }
            : m
        )
      )
    })

    // Unsend handling
    chatRoom.onUnsend(({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    })

    // Peer lifecycle
    chatRoom.onPeerJoin((peerId) => {
      setPeers((p) => [...new Set([...p, peerId])])
      setIsConnected(true)
    })

    chatRoom.onPeerLeave((peerId) => {
      setPeers((p) => p.filter((id) => id !== peerId))
      setIsConnected(chatRoom.isConnected())
    })

    return () => chatRoom.leave()
  }, [user, roomId, autoConnect, enableReactions, enableTyping, enableReadReceipts, messageRetention])

  // Actions
  const sendMessage = useCallback((content: string) => {
    if (!roomRef.current || !user) return

    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.id,
      content: content.trim(),
      timestamp: Date.now(),
      type: 'text',
    }

    roomRef.current.sendMsg(msg)
    setMessages((prev) => [...prev, msg])
  }, [user])

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    if (!roomRef.current || !user || !enableReactions) return

    roomRef.current.sendReaction({
      messageId,
      emoji,
      senderId: user.id,
      timestamp: Date.now(),
    })
  }, [user, enableReactions])

  const setTyping = useCallback((isTyping: boolean) => {
    if (!roomRef.current || !user || !enableTyping) return

    setIsTyping(isTyping)
    roomRef.current.sendTyping({
      userId: user.id,
      isTyping,
    })

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        roomRef.current?.sendTyping({
          userId: user.id,
          isTyping: false,
        })
      }, 3000)
    }
  }, [user, enableTyping])

  const editMessage = useCallback((messageId: string, content: string) => {
    if (!roomRef.current || !user) return

    roomRef.current.sendEdit({
      messageId,
      content: content.trim(),
    })
  }, [user])

  const unsendMessage = useCallback((messageId: string) => {
    if (!roomRef.current || !user) return

    roomRef.current.sendUnsend({ messageId })
  }, [user])

  const leaveRoom = useCallback(() => {
    roomRef.current?.leave()
    roomRef.current = null
    setIsConnected(false)
  }, [])

  const reconnect = useCallback(() => {
    leaveRoom()
    // Re-initialization will happen in useEffect
  }, [leaveRoom])

  const getOtherUserId = useCallback(() => {
    return peerId
  }, [peerId])

  return {
    // State
    messages,
    reactions,
    typingPeers,
    peers,
    isConnected,
    isTyping,
    
    // Actions
    sendMessage,
    sendReaction,
    setTyping,
    editMessage,
    unsendMessage,
    
    // Room management
    leaveRoom,
    reconnect,
    
    // Utility
    getOtherUserId,
  }
}

/**
 * Enhanced hook with Supabase integration for profile data
 */
export function useP2PChatWithProfile(
  peerId: string,
  options: UseP2PChatOptions = {}
) {
  const chatState = useP2PChat(peerId, options)
  const [peerProfile, setPeerProfile] = useState<any>(null)

  // Load peer profile
  useEffect(() => {
    async function loadProfile() {
      if (!peerId) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', peerId)
        .single()

      if (data && !error) {
        setPeerProfile(data)
      }
    }

    loadProfile()
  }, [peerId])

  return {
    ...chatState,
    peerProfile,
  }
}

/**
 * Multi-chat hook for managing multiple conversations
 */
export function useMultiP2PChat(options: UseP2PChatOptions = {}) {
  const [activeChats, setActiveChats] = useState<Set<string>>(new Set())
  const chatStates = useRef<Map<string, UseP2PChatReturn>>(new Map())

  const startChat = useCallback((peerId: string) => {
    if (!chatStates.current.has(peerId)) {
      const chatState = useP2PChat(peerId, options)
      chatStates.current.set(peerId, chatState)
      setActiveChats(prev => new Set([...prev, peerId]))
    }
    return chatStates.current.get(peerId)!
  }, [options])

  const endChat = useCallback((peerId: string) => {
    const chatState = chatStates.current.get(peerId)
    if (chatState) {
      chatState.leaveRoom()
      chatStates.current.delete(peerId)
      setActiveChats(prev => {
        const next = new Set(prev)
        next.delete(peerId)
        return next
      })
    }
  }, [])

  const getChat = useCallback((peerId: string) => {
    return chatStates.current.get(peerId)
  }, [])

  const getAllChats = useCallback(() => {
    return Array.from(chatStates.current.values())
  }, [])

  return {
    activeChats: Array.from(activeChats),
    startChat,
    endChat,
    getChat,
    getAllChats,
  }
}