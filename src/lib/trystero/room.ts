/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 TRYSTERO P2P ROOM - Clean P2P Implementation
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Clean Trystero 0.22 Nostr strategy implementation inspired by Zenith Connect.
 * Provides unified P2P chat, reactions, typing, and media streaming.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 */

'use client'

import {joinRoom} from 'trystero/nostr'
import type {Room} from 'trystero'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ChatMessage  = {
  id: string
  senderId: string
  content: string
  timestamp: number
  type: 'text' | 'media' | 'system'
  edited?: boolean
  replyTo?: string
  selfDestruct?: number // Auto-destruct timestamp
}

export type Reaction  = {
  messageId: string
  emoji: string
  senderId: string
  timestamp: number
}

export type TypingPayload  = {
  userId: string
  isTyping: boolean
}

export type ReadReceipt  = {
  messageId: string
  readBy: string
  timestamp: number
}

export type PresencePayload  = {
  userId: string
  status: 'online' | 'away' | 'busy'
  lastSeen: number
}

export type MediaStreamPayload  = {
  streamId: string
  type: 'audio' | 'video' | 'screen'
  userId: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const APP_ID = import.meta.env.VITE_P2P_APP_ID ?? 'findyourking-zero-v2'
const DEFAULT_RELAY_REDUNDANCY = 3

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ROOM FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates or joins a Trystero 0.22 P2P room for chat.
 * Uses Nostr relay strategy for privacy-first communication.
 */
export function createChatRoom(
  roomId: string, 
  config?: { 
    relayRedundancy?: number
    password?: string 
  }
) {
  const room: Room = joinRoom(
    { 
      appId: APP_ID, 
      relayRedundancy: config?.relayRedundancy ?? DEFAULT_RELAY_REDUNDANCY,
      password: config?.password,
    },
    roomId
  )

  // Core messaging actions
  const [sendMsg, onMsg] = room.makeAction<ChatMessage>('msg')
  const [sendReaction, onReaction] = room.makeAction<Reaction>('reaction')
  const [sendTyping, onTyping] = room.makeAction<TypingPayload>('typing')
  const [sendReceipt, onReceipt] = room.makeAction<ReadReceipt>('receipt')
  const [sendPresence, onPresence] = room.makeAction<PresencePayload>('presence')
  const [sendEdit, onEdit] = room.makeAction<{ messageId: string; content: string }>('edit')
  const [sendUnsend, onUnsend] = room.makeAction<{ messageId: string }>('unsend')
  const [sendMediaInfo, onMediaInfo] = room.makeAction<MediaStreamPayload>('media')

  return {
    // Core room reference
    room,
    
    // Messaging
    sendMsg, 
    onMsg,
    
    // Reactions
    sendReaction, 
    onReaction,
    
    // Typing indicators
    sendTyping, 
    onTyping,
    
    // Read receipts
    sendReceipt, 
    onReceipt,
    
    // Presence
    sendPresence,
    onPresence,
    
    // Edit / unsend
    sendEdit, 
    onEdit,
    sendUnsend, 
    onUnsend,
    
    // Media streaming
    sendMediaInfo,
    onMediaInfo,
    addStream: room.addStream,
    onPeerStream: room.onPeerStream,
    
    // Peer lifecycle
    onPeerJoin: room.onPeerJoin,
    onPeerLeave: room.onPeerLeave,
    getPeers: room.getPeers,
    
    // Room management
    leave: room.leave,
    
    // Utility methods
    getSelfId: () => room.selfId,
    isConnected: () => room.getPeers().length > 0,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate consistent chat room ID for two users
 */
export function getChatRoomId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort()
  return `chat-${sorted[0]}-${sorted[1]}`
}

/**
 * Generate group chat room ID
 */
export function getGroupRoomId(groupName: string, creatorId: string): string {
  return `group-${groupName.toLowerCase().replace(/\s+/g, '-')}-${creatorId}`
}

/**
 * Generate presence room ID for location-based discovery
 */
export function getLocationRoomId(latitude: number, longitude: number, radiusKm: number = 1): string {
  const geohash = Math.floor(latitude * 100) + '-' + Math.floor(longitude * 100)
  return `location-${geohash}-${radiusKm}km`
}

/**
 * Message validation helpers
 */
export const messageValidation = {
  isValidMessage: (msg: any): msg is ChatMessage => {
    return msg && 
           typeof msg.id === 'string' && 
           typeof msg.senderId === 'string' && 
           typeof msg.content === 'string' && 
           typeof msg.timestamp === 'number' &&
           ['text', 'media', 'system'].includes(msg.type)
  },
  
  sanitizeContent: (content: string): string => {
    return content.trim().slice(0, 5000) // Max 5000 chars
  },
  
  generateMessageId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ChatRoom = ReturnType<typeof createChatRoom>

// ═══════════════════════════════════════════════════════════════════════════════
// ROOM MANAGER - For managing multiple rooms
// ═══════════════════════════════════════════════════════════════════════════════

class RoomManager {
  private rooms = new Map<string, ChatRoom>()
  
  /**
   * Get or create a room
   */
  getRoom(roomId: string, config?: Parameters<typeof createChatRoom>[1]): ChatRoom {
    if (!this.rooms.has(roomId)) {
      const room = createChatRoom(roomId, config)
      this.rooms.set(roomId, room)
    }
    return this.rooms.get(roomId)!
  }
  
  /**
   * Leave and cleanup a room
   */
  leaveRoom(roomId: string): void {
    const room = this.rooms.get(roomId)
    if (room) {
      room.leave()
      this.rooms.delete(roomId)
    }
  }
  
  /**
   * Leave all rooms
   */
  leaveAll(): void {
    this.rooms.forEach(room => room.leave())
    this.rooms.clear()
  }
  
  /**
   * Get active room count
   */
  getActiveRoomCount(): number {
    return this.rooms.size
  }
  
  /**
   * Get all room IDs
   */
  getRoomIds(): string[] {
    return Array.from(this.rooms.keys())
  }
}

export const roomManager = new RoomManager()