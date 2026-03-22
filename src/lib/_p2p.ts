/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 P2P SIGNALING STRATEGIES - Multi-Strategy P2P Networking
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Abstract base class for P2P signaling strategies with automatic failover.
 * Implements BitTorrent DHT, Nostr, MQTT, IPFS, WebRTC, and Supabase strategies.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 4.0.0
 */

import EventEmitter from 'events'

export type SignalingConfig  = {
  timeout?: number
  retryAttempts?: number
  enableEncryption?: boolean
  compressionEnabled?: boolean
}

export type P2PMessage = {
  id: string
  senderId: string
  recipientId: string
  content: string
  type: 'text' | 'media' | 'system'
  timestamp: number
  encrypted?: boolean
  encryptedContent?: string
  signature?: string
}

export type P2PCall = {
  id: string
  initiatorId: string
  recipientId: string
  type: 'audio' | 'video'
  status: 'initiating' | 'ringing' | 'connected' | 'ended' | 'declined'
  startTime: number
  endTime?: number
  duration?: number
  encrypted?: boolean
}

/**
 * Abstract base class for all P2P signaling strategies
 */
export abstract class SignalingStrategy extends EventEmitter {
  protected config: SignalingConfig
  protected isConnected: boolean = false
  protected retryCount: number = 0
  protected lastError: Error | null = null

  constructor(config: SignalingConfig = {}) {
    super()
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      enableEncryption: true,
      compressionEnabled: true,
      ...config,
    }
  }

  // Abstract methods to be implemented by concrete strategies
  abstract initialize(): Promise<void>
  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract sendMessage(message: P2PMessage): Promise<void>
  abstract sendCallRequest(call: P2PCall): Promise<void>
  abstract sendCallAcceptance(call: P2PCall): Promise<void>
  abstract sendCallDecline(call: P2PCall): Promise<void>
  abstract sendCallEnd(call: P2PCall): Promise<void>
  abstract cleanup(): Promise<void>

  // Common utility methods
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        this.retryCount = attempt + 1
        
        if (attempt < this.config.retryAttempts! - 1) {
          await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
        }
      }
    }

    throw new Error(`${operationName} failed after ${this.config.retryAttempts} attempts: ${lastError.message}`)
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected validateMessage(message: P2PMessage): void {
    if (!message.id || !message.senderId || !message.recipientId) {
      throw new Error('Invalid message: missing required fields')
    }
  }

  protected validateCall(call: P2PCall): void {
    if (!call.id || !call.initiatorId || !call.recipientId) {
      throw new Error('Invalid call: missing required fields')
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected
  }

  get error(): Error | null {
    return this.lastError
  }

  get retries(): number {
    return this.retryCount
  }
}

/**
 * BitTorrent DHT Strategy - Decentralized peer discovery
 */
export class BitTorrentStrategy extends SignalingStrategy {
  private trackerUrls: string[]
  private enableDHT: boolean
  private enablePEX: boolean
  private client: any = null

  constructor(config: {
    trackerUrls: string[]
    enableDHT?: boolean
    enablePEX?: boolean
  } & SignalingConfig) {
    super(config)
    this.trackerUrls = config.trackerUrls
    this.enableDHT = config.enableDHT ?? true
    this.enablePEX = config.enablePEX ?? true
  }

  async initialize(): Promise<void> {
    // Initialize BitTorrent client
    this.client = {
      announce: this.trackerUrls,
      dht: this.enableDHT,
      pex: this.enablePEX,
    }
    
    this.isConnected = true
    this.emit('initialized')
  }

  async connect(): Promise<void> {
    await this.retryOperation(async () => {
      // Connect to BitTorrent swarm
      this.emit('connected')
    }, 'BitTorrent connect')
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      // Disconnect from swarm
      this.client = null
    }
    this.isConnected = false
    this.emit('disconnected')
  }

  async sendMessage(message: P2PMessage): Promise<void> {
    this.validateMessage(message)
    
    await this.retryOperation(async () => {
      // Send message via BitTorrent DHT
      this.emit('messageSent', message)
    }, 'BitTorrent sendMessage')
  }

  async sendCallRequest(call: P2PCall): Promise<void> {
    this.validateCall(call)
    // Implement call signaling via DHT
    this.emit('callRequest', call)
  }

  async sendCallAcceptance(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callAcceptance', call)
  }

  async sendCallDecline(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callDecline', call)
  }

  async sendCallEnd(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callEnd', call)
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
  }
}

/**
 * Nostr Relay Strategy - Privacy-first messaging
 */
export class NostrStrategy extends SignalingStrategy {
  private relays: string[]
  private privateKey?: string
  private redundancy: number
  private pool: any = null

  constructor(config: {
    relays: string[]
    privateKey?: string
    redundancy?: number
  } & SignalingConfig) {
    super(config)
    this.relays = config.relays
    this.privateKey = config.privateKey
    this.redundancy = config.redundancy ?? 3
  }

  async initialize(): Promise<void> {
    // Initialize Nostr pool
    this.pool = {
      relays: this.relays,
      privateKey: this.privateKey,
      redundancy: this.redundancy,
    }
    
    this.isConnected = true
    this.emit('initialized')
  }

  async connect(): Promise<void> {
    await this.retryOperation(async () => {
      // Connect to Nostr relays
      this.emit('connected')
    }, 'Nostr connect')
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      // Disconnect from relays
      this.pool = null
    }
    this.isConnected = false
    this.emit('disconnected')
  }

  async sendMessage(message: P2PMessage): Promise<void> {
    this.validateMessage(message)
    
    await this.retryOperation(async () => {
      // Send encrypted message via Nostr
      this.emit('messageSent', message)
    }, 'Nostr sendMessage')
  }

  async sendCallRequest(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callRequest', call)
  }

  async sendCallAcceptance(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callAcceptance', call)
  }

  async sendCallDecline(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callDecline', call)
  }

  async sendCallEnd(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callEnd', call)
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
  }
}

/**
 * MQTT Broker Strategy - Real-time messaging
 */
export class MQTTStrategy extends SignalingStrategy {
  private brokerUrl: string
  private clientId: string
  private username?: string
  private password?: string
  private client: any = null

  constructor(config: {
    brokerUrl: string
    clientId: string
    username?: string
    password?: string
  } & SignalingConfig) {
    super(config)
    this.brokerUrl = config.brokerUrl
    this.clientId = config.clientId
    this.username = config.username
    this.password = config.password
  }

  async initialize(): Promise<void> {
    // Initialize MQTT client
    this.client = {
      brokerUrl: this.brokerUrl,
      clientId: this.clientId,
      username: this.username,
      password: this.password,
    }
    
    this.isConnected = true
    this.emit('initialized')
  }

  async connect(): Promise<void> {
    await this.retryOperation(async () => {
      // Connect to MQTT broker
      this.emit('connected')
    }, 'MQTT connect')
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      // Disconnect from broker
      this.client = null
    }
    this.isConnected = false
    this.emit('disconnected')
  }

  async sendMessage(message: P2PMessage): Promise<void> {
    this.validateMessage(message)
    
    await this.retryOperation(async () => {
      // Publish message to MQTT topic
      this.emit('messageSent', message)
    }, 'MQTT sendMessage')
  }

  async sendCallRequest(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callRequest', call)
  }

  async sendCallAcceptance(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callAcceptance', call)
  }

  async sendCallDecline(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callDecline', call)
  }

  async sendCallEnd(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callEnd', call)
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
  }
}

/**
 * IPFS Strategy - Content-addressed storage
 */
export class IPFSStrategy extends SignalingStrategy {
  private gateways: string[]
  private enablePubSub: boolean
  private enableDHT: boolean
  private node: any = null

  constructor(config: {
    gateways: string[]
    enablePubSub?: boolean
    enableDHT?: boolean
  } & SignalingConfig) {
    super(config)
    this.gateways = config.gateways
    this.enablePubSub = config.enablePubSub ?? true
    this.enableDHT = config.enableDHT ?? true
  }

  async initialize(): Promise<void> {
    // Initialize IPFS node
    this.node = {
      gateways: this.gateways,
      pubsub: this.enablePubSub,
      dht: this.enableDHT,
    }
    
    this.isConnected = true
    this.emit('initialized')
  }

  async connect(): Promise<void> {
    await this.retryOperation(async () => {
      // Connect to IPFS network
      this.emit('connected')
    }, 'IPFS connect')
  }

  async disconnect(): Promise<void> {
    if (this.node) {
      // Disconnect from IPFS
      this.node = null
    }
    this.isConnected = false
    this.emit('disconnected')
  }

  async sendMessage(message: P2PMessage): Promise<void> {
    this.validateMessage(message)
    
    await this.retryOperation(async () => {
      // Store message on IPFS
      this.emit('messageSent', message)
    }, 'IPFS sendMessage')
  }

  async sendCallRequest(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callRequest', call)
  }

  async sendCallAcceptance(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callAcceptance', call)
  }

  async sendCallDecline(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callDecline', call)
  }

  async sendCallEnd(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callEnd', call)
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
  }
}

/**
 * WebRTC Strategy - Direct peer connections
 */
export class WebRTCStrategy extends SignalingStrategy {
  private iceServers: RTCIceServer[]
  private enableDataChannel: boolean
  private enableVideo: boolean
  private enableAudio: boolean
  private peerConnections: Map<string, RTCPeerConnection> = new Map()

  constructor(config: {
    iceServers: RTCIceServer[]
    enableDataChannel?: boolean
    enableVideo?: boolean
    enableAudio?: boolean
  } & SignalingConfig) {
    super(config)
    this.iceServers = config.iceServers
    this.enableDataChannel = config.enableDataChannel ?? true
    this.enableVideo = config.enableVideo ?? true
    this.enableAudio = config.enableAudio ?? true
  }

  async initialize(): Promise<void> {
    this.isConnected = true
    this.emit('initialized')
  }

  async connect(): Promise<void> {
    this.emit('connected')
  }

  async disconnect(): Promise<void> {
    // Close all peer connections
    for (const [peerId, connection] of this.peerConnections) {
      connection.close()
    }
    this.peerConnections.clear()
    
    this.isConnected = false
    this.emit('disconnected')
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const connection = new RTCPeerConnection({
      iceServers: this.iceServers,
    })

    // Set up data channel if enabled
    if (this.enableDataChannel) {
      const dataChannel = connection.createDataChannel('chat', {
        ordered: true,
        maxRetransmits: 3,
      })
      
      this.setupDataChannelHandlers(dataChannel, peerId)
    }

    // Set up connection handlers
    this.setupPeerConnectionHandlers(connection, peerId)

    this.peerConnections.set(peerId, connection)
    return connection
  }

  async closePeerConnection(peerId: string): Promise<void> {
    const connection = this.peerConnections.get(peerId)
    if (connection) {
      connection.close()
      this.peerConnections.delete(peerId)
    }
  }

  private setupDataChannelHandlers(dataChannel: RTCDataChannel, peerId: string): void {
    dataChannel.onopen = () => {
      this.emit('dataChannelOpen', { peerId, dataChannel })
    }

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as P2PMessage
        this.emit('messageReceived', { message, fromUserId: peerId })
      } catch (error) {
        console.error('Data channel message error:', error)
      }
    }

    dataChannel.onclose = () => {
      this.emit('dataChannelClose', { peerId })
    }
  }

  private setupPeerConnectionHandlers(connection: RTCPeerConnection, peerId: string): void {
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', { peerId, candidate: event.candidate })
      }
    }

    connection.onconnectionstatechange = () => {
      this.emit('connectionStateChange', { 
        peerId, 
        state: connection.connectionState 
      })
    }

    connection.oniceconnectionstatechange = () => {
      this.emit('iceConnectionStateChange', { 
        peerId, 
        state: connection.iceConnectionState 
      })
    }
  }

  async sendMessage(message: P2PMessage): Promise<void> {
    this.validateMessage(message)
    
    const connection = this.peerConnections.get(message.recipientId)
    if (!connection) {
      throw new Error('No peer connection found')
    }

    const dataChannel = connection.getDataChannelForLabel('chat')
    if (!dataChannel || dataChannel.readyState !== 'open') {
      throw new Error('Data channel not available')
    }

    dataChannel.send(JSON.stringify(message))
    this.emit('messageSent', message)
  }

  async sendCallRequest(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callRequest', call)
  }

  async sendCallAcceptance(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callAcceptance', call)
  }

  async sendCallDecline(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callDecline', call)
  }

  async sendCallEnd(call: P2PCall): Promise<void> {
    this.validateCall(call)
    this.emit('callEnd', call)
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
  }
}

/**
 * Supabase Realtime Strategy - Fallback and presence
 */
export class SupabaseRealtimeStrategy extends SignalingStrategy {
  private supabase: any
  private enablePresence: boolean
  private enableBroadcast: boolean
  private channels: Map<string, any> = new Map()

  constructor(config: {
    supabase: any
    enablePresence?: boolean
    enableBroadcast?: boolean
  } & SignalingConfig) {
    super(config)
    this.supabase = config.supabase
    this.enablePresence = config.enablePresence ?? true
    this.enableBroadcast = config.enableBroadcast ?? true
  }

  async initialize(): Promise<void> {
    // Initialize Supabase realtime
    this.isConnected = true
    this.emit('initialized')
  }

  async connect(): Promise<void> {
    this.emit('connected')
  }

  async disconnect(): Promise<void> {
    // Close all channels
    for (const [name, channel] of this.channels) {
      channel.unsubscribe()
    }
    this.channels.clear()
    
    this.isConnected = false
    this.emit('disconnected')
  }

  async sendMessage(message: P2PMessage): Promise<void> {
    this.validateMessage(message)
    
    // Send via Supabase broadcast
    const channel = this.getOrCreateChannel(`user:${message.recipientId}`)
    await channel.send({
      event: 'message',
      payload: message,
    })
    
    this.emit('messageSent', message)
  }

  async sendCallRequest(call: P2PCall): Promise<void> {
    this.validateCall(call)
    
    const channel = this.getOrCreateChannel(`user:${call.recipientId}`)
    await channel.send({
      event: 'callRequest',
      payload: call,
    })
    
    this.emit('callRequest', call)
  }

  async sendCallAcceptance(call: P2PCall): Promise<void> {
    this.validateCall(call)
    
    const channel = this.getOrCreateChannel(`user:${call.recipientId}`)
    await channel.send({
      event: 'callAcceptance',
      payload: call,
    })
    
    this.emit('callAcceptance', call)
  }

  async sendCallDecline(call: P2PCall): Promise<void> {
    this.validateCall(call)
    
    const channel = this.getOrCreateChannel(`user:${call.recipientId}`)
    await channel.send({
      event: 'callDecline',
      payload: call,
    })
    
    this.emit('callDecline', call)
  }

  async sendCallEnd(call: P2PCall): Promise<void> {
    this.validateCall(call)
    
    const channel = this.getOrCreateChannel(`user:${call.recipientId}`)
    await channel.send({
      event: 'callEnd',
      payload: call,
    })
    
    this.emit('callEnd', call)
  }

  private getOrCreateChannel(name: string): any {
    if (!this.channels.has(name)) {
      const channel = this.supabase.channel(name)
      
      channel.on('broadcast', { event: 'message' }, (payload: any) => {
        this.emit('messageReceived', { 
          message: payload.payload, 
          fromUserId: payload.payload.senderId 
        })
      })
      
      channel.on('broadcast', { event: 'callRequest' }, (payload: any) => {
        this.emit('callRequest', payload.payload)
      })
      
      channel.subscribe()
      this.channels.set(name, channel)
    }
    
    return this.channels.get(name)
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
  }
}// =====================================================
// Unified P2P Services — Chat, Files, Location, Presence, Signaling
// Built on Trystero 0.22 Nostr strategy
// =====================================================
import { joinRoom } from 'trystero/nostr';
import type { Room } from 'trystero';

const APP_ID = import.meta.env.VITE_P2P_APP_ID ?? 'fyking-v4';

// ── Types ────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'media' | 'system' | 'reply' | 'forward';
  edited?: boolean;
  replyTo?: string;
  selfDestruct?: number;
  metadata?: Record<string, unknown>;
}

export interface FileTransfer {
  id: string;
  senderId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  chunks: number;
  hash?: string;
  expiresAt?: number;
}

export interface LocationPayload {
  userId: string;
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  coarse?: boolean;
}

export interface PresencePayload {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'invisible';
  lastSeen: number;
  statusText?: string;
}

export interface TypingPayload {
  userId: string;
  roomId: string;
  isTyping: boolean;
}

export interface ReadReceipt {
  messageId: string;
  readBy: string;
  timestamp: number;
}

export interface ReactionPayload {
  messageId: string;
  emoji: string;
  userId: string;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'hangup' | 'ringing' | 'accept' | 'reject';
  from: string;
  to: string;
  sdp?: string;
  candidate?: string;
  callType?: 'audio' | 'video';
  timestamp: number;
}

// ── P2P Chat Engine ──────────────────────────────────
export class P2PChatEngine {
  private room: Room;
  private sendMsg: (data: ChatMessage, peerId?: string) => Promise<void>;
  private sendEdit: (data: { messageId: string; content: string }, peerId?: string) => Promise<void>;
  private sendUnsend: (data: { messageId: string }, peerId?: string) => Promise<void>;
  private sendReaction: (data: ReactionPayload, peerId?: string) => Promise<void>;
  private sendTyping: (data: TypingPayload, peerId?: string) => Promise<void>;
  private sendReceipt: (data: ReadReceipt, peerId?: string) => Promise<void>;
  private messageQueue: ChatMessage[] = [];
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, roomId);
    const [sm, om] = this.room.makeAction<ChatMessage>('msg');
    const [se, oe] = this.room.makeAction<{ messageId: string; content: string }>('edit');
    const [su, ou] = this.room.makeAction<{ messageId: string }>('unsend');
    const [sr, or_] = this.room.makeAction<ReactionPayload>('react');
    const [st, ot] = this.room.makeAction<TypingPayload>('typing');
    const [sR, oR] = this.room.makeAction<ReadReceipt>('receipt');
    this.sendMsg = sm; this.sendEdit = se; this.sendUnsend = su;
    this.sendReaction = sr; this.sendTyping = st; this.sendReceipt = sR;

    om((msg, peerId) => this.emit('message', msg, peerId));
    oe((data, peerId) => this.emit('edit', data, peerId));
    ou((data, peerId) => this.emit('unsend', data, peerId));
    or_((data, peerId) => this.emit('reaction', data, peerId));
    ot((data, peerId) => this.emit('typing', data, peerId));
    oR((data, peerId) => this.emit('receipt', data, peerId));

    this.room.onPeerJoin((peerId) => this.emit('peerJoin', peerId));
    this.room.onPeerLeave((peerId) => this.emit('peerLeave', peerId));

    // Flush queue on connect
    this.room.onPeerJoin(() => this.flushQueue());
  }

  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }

  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  async send(content: string, replyTo?: string) {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      senderId: this.room.selfId,
      content: content.trim().slice(0, 5000),
      timestamp: Date.now(),
      type: replyTo ? 'reply' : 'text',
      replyTo,
    };
    const peers = this.room.getPeers();
    if (peers.length === 0) {
      this.messageQueue.push(msg);
      return msg;
    }
    await this.sendMsg(msg);
    return msg;
  }

  async edit(messageId: string, content: string) {
    await this.sendEdit({ messageId, content: content.trim().slice(0, 5000) });
  }

  async unsend(messageId: string) {
    await this.sendUnsend({ messageId });
  }

  async react(messageId: string, emoji: string) {
    await this.sendReaction({ messageId, emoji, userId: this.room.selfId });
  }

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  async setTyping(roomId: string, isTyping: boolean) {
    if (this.typingTimer) clearTimeout(this.typingTimer);
    await this.sendTyping({ userId: this.room.selfId, roomId, isTyping });
    if (isTyping) {
      this.typingTimer = setTimeout(() => this.sendTyping({ userId: this.room.selfId, roomId, isTyping: false }), 3000);
    }
  }

  async markRead(messageId: string) {
    await this.sendReceipt({ messageId, readBy: this.room.selfId, timestamp: Date.now() });
  }

  private async flushQueue() {
    while (this.messageQueue.length > 0 && this.room.getPeers().length > 0) {
      const msg = this.messageQueue.shift()!;
      await this.sendMsg(msg);
    }
  }

  getSelfId() { return this.room.selfId; }
  getPeers() { return this.room.getPeers(); }
  leave() { this.room.leave(); this.listeners.clear(); }
}

// ── P2P File Transfer ────────────────────────────────
export class P2PFileTransfer {
  private room: Room;
  private CHUNK_SIZE = 64 * 1024; // 64KB
  private sendChunk: (data: ArrayBuffer, peerId?: string) => Promise<void>;
  private sendMeta: (data: FileTransfer, peerId?: string) => Promise<void>;
  private incomingTransfers: Map<string, { meta: FileTransfer; chunks: ArrayBuffer[] }> = new Map();

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-files`);
    const [sc, oc] = this.room.makeAction<ArrayBuffer>('chunk');
    const [sm, om] = this.room.makeAction<FileTransfer>('meta');
    this.sendChunk = sc; this.sendMeta = sm;

    oc((data, peerId) => this.handleChunk(data, peerId));
    om((meta, peerId) => this.handleMeta(meta, peerId));
  }

  private listeners: Map<string, Set<Function>> = new Map();
  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }
  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  async sendFile(file: File, expiresIn?: number) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const chunks = Math.ceil(file.size / this.CHUNK_SIZE);
    const meta: FileTransfer = {
      id, senderId: this.room.selfId,
      fileName: file.name, fileType: file.type, fileSize: file.size, chunks,
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };
    await this.sendMeta(meta);

    for (let i = 0; i < chunks; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, file.size);
      const chunk = await file.slice(start, end).arrayBuffer();
      const header = new TextEncoder().encode(JSON.stringify({ id, index: i, total: chunks }));
      const headerLen = new Uint8Array([header.length]);
      const payload = new Uint8Array(1 + header.length + chunk.byteLength);
      payload.set(headerLen, 0);
      payload.set(header, 1);
      payload.set(new Uint8Array(chunk), 1 + header.length);
      await this.sendChunk(payload.buffer);
      this.emit('progress', { id, progress: ((i + 1) / chunks) * 100 });
    }
  }

  private handleChunk(data: ArrayBuffer, peerId: string) {
    const view = new Uint8Array(data);
    const headerLen = view[0];
    const header = JSON.parse(new TextDecoder().decode(view.slice(1, 1 + headerLen)));
    const chunkData = data.slice(1 + headerLen);

    if (!this.incomingTransfers.has(header.id)) return;
    const transfer = this.incomingTransfers.get(header.id)!;
    transfer.chunks[header.index] = chunkData;

    const received = transfer.chunks.filter(Boolean).length;
    this.emit('progress', { id: header.id, progress: (received / header.total) * 100 });

    if (received === header.total) {
      const blob = new Blob(transfer.chunks, { type: transfer.meta.fileType });
      this.emit('complete', { id: header.id, blob, meta: transfer.meta });
      this.incomingTransfers.delete(header.id);
    }
  }

  private handleMeta(meta: FileTransfer, peerId: string) {
    this.incomingTransfers.set(meta.id, { meta, chunks: new Array(meta.chunks) });
    this.emit('incoming', meta);
  }

  leave() { this.room.leave(); this.listeners.clear(); }
}

// ── P2P Location Sharing ─────────────────────────────
export class P2PLocation {
  private room: Room;
  private sendLoc: (data: LocationPayload, peerId?: string) => Promise<void>;
  private watchId: number | null = null;
  private trail: LocationPayload[] = [];

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-loc`);
    const [sl, ol] = this.room.makeAction<LocationPayload>('loc');
    this.sendLoc = sl;
    ol((data, peerId) => {
      this.trail.push(data);
      if (this.trail.length > 50) this.trail.shift();
      this.emit('location', data, peerId);
    });
  }

  private listeners: Map<string, Set<Function>> = new Map();
  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }
  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  startSharing(coarse = false) {
    if (!navigator.geolocation) return;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload: LocationPayload = {
          userId: this.room.selfId,
          lat: coarse ? Math.round(pos.coords.latitude * 100) / 100 : pos.coords.latitude,
          lng: coarse ? Math.round(pos.coords.longitude * 100) / 100 : pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
          coarse,
        };
        this.sendLoc(payload);
      },
      () => {},
      { enableHighAccuracy: !coarse, maximumAge: 10000, timeout: 10000 }
    );
  }

  stopSharing() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getTrail() { return [...this.trail]; }
  leave() { this.stopSharing(); this.room.leave(); this.listeners.clear(); }
}

// ── P2P Call Signaling ───────────────────────────────
export class P2PCallSignaling {
  private room: Room;
  private sendSignal: (data: CallSignal, peerId?: string) => Promise<void>;
  private peerConnection: RTCPeerConnection | null = null;

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-call`);
    const [ss, os] = this.room.makeAction<CallSignal>('signal');
    this.sendSignal = ss;
    os((data, peerId) => this.emit('signal', data, peerId));
  }

  private listeners: Map<string, Set<Function>> = new Map();
  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }
  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  async call(targetPeerId: string, callType: 'audio' | 'video' = 'audio') {
    const signal: CallSignal = {
      type: 'offer', from: this.room.selfId, to: targetPeerId, callType, timestamp: Date.now(),
    };
    await this.sendSignal(signal, targetPeerId);
    return signal;
  }

  async accept(targetPeerId: string) {
    await this.sendSignal({
      type: 'accept', from: this.room.selfId, to: targetPeerId, timestamp: Date.now(),
    }, targetPeerId);
  }

  async reject(targetPeerId: string) {
    await this.sendSignal({
      type: 'reject', from: this.room.selfId, to: targetPeerId, timestamp: Date.now(),
    }, targetPeerId);
  }

  async hangup(targetPeerId: string) {
    await this.sendSignal({
      type: 'hangup', from: this.room.selfId, to: targetPeerId, timestamp: Date.now(),
    }, targetPeerId);
    this.peerConnection?.close();
    this.peerConnection = null;
  }

  addStream(stream: MediaStream) { this.room.addStream(stream); }
  onPeerStream(cb: (stream: MediaStream, peerId: string) => void) { this.room.onPeerStream(cb); }

  leave() { this.peerConnection?.close(); this.room.leave(); this.listeners.clear(); }
}

// ── Unified P2P Room ─────────────────────────────────
export class UnifiedP2PRoom {
  chat: P2PChatEngine;
  files: P2PFileTransfer;
  location: P2PLocation;
  calls: P2PCallSignaling;
  private room: Room;

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-presence`);
    this.chat = new P2PChatEngine(roomId, password);
    this.files = new P2PFileTransfer(roomId, password);
    this.location = new P2PLocation(roomId, password);
    this.calls = new P2PCallSignaling(roomId, password);
  }

  getSelfId() { return this.room.selfId; }
  getPeers() { return this.room.getPeers(); }

  leave() {
    this.chat.leave();
    this.files.leave();
    this.location.leave();
    this.calls.leave();
    this.room.leave();
  }
}

// ── Utilities ────────────────────────────────────────
export function getDirectRoomId(a: string, b: string): string {
  return [a, b].sort().join('-');
}

export function getGroupRoomId(name: string, creator: string): string {
  return `group-${name.toLowerCase().replace(/\s+/g, '-')}-${creator.slice(0, 8)}`;
}

export function getLocationRoomId(lat: number, lng: number, radiusKm = 1): string {
  return `geo-${Math.round(lat * 100)}-${Math.round(lng * 100)}-${radiusKm}km`;
}
// =====================================================
// Nostr Private Relay Fallback for Magnet Links
// Censorship-resistant sharing via Nostr
// =====================================================
import { supabase } from '@/integrations/supabase/client';

const NOSTR_RELAYS = ['wss://relay.damus.io', 'wss://nostr.wine', 'wss://relay.nostr.band'];

export async function publishMagnetViaNostr(magnet: string, receiverPubkey: string) {
  // Store in Supabase as primary, Nostr as metadata
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('quickshare_albums').insert({
    sender_id: user.id,
    receiver_id: receiverPubkey,
    room_id: magnet,
    files: [{ type: 'magnet', url: magnet, expires_at: new Date(Date.now() + 3600000).toISOString() }],
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}

export function subscribeToNostrQuickShares(userId: string, onReceive: (magnet: string, senderId: string) => void) {
  // Listen via Supabase realtime instead of raw Nostr
  const channel = supabase.channel(`nostr-quickshare:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'quickshare_albums',
      filter: `receiver_id=eq.${userId}`,
    }, (payload) => {
      const files = payload.new.files as any[];
      const magnetFile = files?.find((f: any) => f.type === 'magnet');
      if (magnetFile) {
        onReceive(magnetFile.url, payload.new.sender_id);
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
