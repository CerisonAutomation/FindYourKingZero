// =====================================================
// Unified P2P Services — Chat, Files, Location, Presence, Signaling
// Built on Trystero 0.22 Nostr strategy
// =====================================================
import {joinRoom} from '@trystero-p2p/nostr';
import type {Room, ActionSender, ActionReceiver, ActionProgress, JsonValue} from '@trystero-p2p/core';

const APP_ID = import.meta.env.VITE_P2P_APP_ID ?? 'fyking-v4';

// Generate a unique local peer ID
function generatePeerId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

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
  metadata?: Record<string, JsonValue>;
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

// Helper to safely cast makeAction result
function makeTypedAction<T>(room: Room, namespace: string): [ActionSender<T>, ActionReceiver<T>] {
  const [send, receive] = room.makeAction(namespace) as unknown as [ActionSender<T>, ActionReceiver<T>];
  return [send, receive];
}

// ── P2P Chat Engine ──────────────────────────────────
export class P2PChatEngine {
  private room: Room;
  private selfId: string;
  private sendMsg: ActionSender<ChatMessage>;
  private sendEdit: ActionSender<{ messageId: string; content: string }>;
  private sendUnsend: ActionSender<{ messageId: string }>;
  private sendReaction: ActionSender<ReactionPayload>;
  private sendTyping: ActionSender<TypingPayload>;
  private sendReceipt: ActionSender<ReadReceipt>;
  private messageQueue: ChatMessage[] = [];
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, roomId);
    this.selfId = generatePeerId();
    
    [this.sendMsg] = makeTypedAction<ChatMessage>(this.room, 'msg');
    [this.sendEdit] = makeTypedAction<{ messageId: string; content: string }>(this.room, 'edit');
    [this.sendUnsend] = makeTypedAction<{ messageId: string }>(this.room, 'unsend');
    [this.sendReaction] = makeTypedAction<ReactionPayload>(this.room, 'react');
    [this.sendTyping] = makeTypedAction<TypingPayload>(this.room, 'typing');
    [this.sendReceipt] = makeTypedAction<ReadReceipt>(this.room, 'receipt');

    const [, onMsg] = makeTypedAction<ChatMessage>(this.room, 'msg');
    const [, onEdit] = makeTypedAction<{ messageId: string; content: string }>(this.room, 'edit');
    const [, onUnsend] = makeTypedAction<{ messageId: string }>(this.room, 'unsend');
    const [, onReact] = makeTypedAction<ReactionPayload>(this.room, 'react');
    const [, onTyping] = makeTypedAction<TypingPayload>(this.room, 'typing');
    const [, onReceipt] = makeTypedAction<ReadReceipt>(this.room, 'receipt');

    onMsg((msg, peerId) => this.emit('message', msg, peerId));
    onEdit((data, peerId) => this.emit('edit', data, peerId));
    onUnsend((data, peerId) => this.emit('unsend', data, peerId));
    onReact((data, peerId) => this.emit('reaction', data, peerId));
    onTyping((data, peerId) => this.emit('typing', data, peerId));
    onReceipt((data, peerId) => this.emit('receipt', data, peerId));

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

  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  async send(content: string, replyTo?: string): Promise<ChatMessage> {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      senderId: this.selfId,
      content: content.trim().slice(0, 5000),
      timestamp: Date.now(),
      type: replyTo ? 'reply' : 'text',
      replyTo,
    };
    const peers = Object.keys(this.room.getPeers());
    if (peers.length === 0) {
      this.messageQueue.push(msg);
      return msg;
    }
    await this.sendMsg(msg);
    return msg;
  }

  async edit(messageId: string, content: string): Promise<void> {
    await this.sendEdit({ messageId, content: content.trim().slice(0, 5000) });
  }

  async unsend(messageId: string): Promise<void> {
    await this.sendUnsend({ messageId });
  }

  async react(messageId: string, emoji: string): Promise<void> {
    await this.sendReaction({ messageId, emoji, userId: this.selfId });
  }

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  async setTyping(roomId: string, isTyping: boolean): Promise<void> {
    if (this.typingTimer) clearTimeout(this.typingTimer);
    await this.sendTyping({ userId: this.selfId, roomId, isTyping });
    if (isTyping) {
      this.typingTimer = setTimeout(() => this.sendTyping({ userId: this.selfId, roomId, isTyping: false }), 3000);
    }
  }

  async markRead(messageId: string): Promise<void> {
    await this.sendReceipt({ messageId, readBy: this.selfId, timestamp: Date.now() });
  }

  private async flushQueue(): Promise<void> {
    while (this.messageQueue.length > 0 && Object.keys(this.room.getPeers()).length > 0) {
      const msg = this.messageQueue.shift()!;
      await this.sendMsg(msg);
    }
  }

  getSelfId(): string { return this.selfId; }
  getPeers(): string[] { return Object.keys(this.room.getPeers()); }
  leave(): void { this.room.leave(); this.listeners.clear(); }
}

// ── P2P File Transfer ────────────────────────────────
export class P2PFileTransfer {
  private room: Room;
  private selfId: string;
  private CHUNK_SIZE = 64 * 1024; // 64KB
  private sendChunk: ActionSender<ArrayBuffer>;
  private sendMeta: ActionSender<FileTransfer>;
  private incomingTransfers: Map<string, { meta: FileTransfer; chunks: ArrayBuffer[] }> = new Map();

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-files`);
    this.selfId = generatePeerId();
    
    [this.sendChunk] = makeTypedAction<ArrayBuffer>(this.room, 'chunk');
    [this.sendMeta] = makeTypedAction<FileTransfer>(this.room, 'meta');

    const [, onChunk] = makeTypedAction<ArrayBuffer>(this.room, 'chunk');
    const [, onMeta] = makeTypedAction<FileTransfer>(this.room, 'meta');

    onChunk((data, peerId) => this.handleChunk(data, peerId));
    onMeta((meta, peerId) => this.handleMeta(meta, peerId));
  }

  private listeners: Map<string, Set<Function>> = new Map();
  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }
  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  async sendFile(file: File, expiresIn?: number): Promise<void> {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const chunks = Math.ceil(file.size / this.CHUNK_SIZE);
    const meta: FileTransfer = {
      id, senderId: this.selfId,
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

  private handleChunk(data: ArrayBuffer, peerId: string): void {
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

  private handleMeta(meta: FileTransfer, peerId: string): void {
    this.incomingTransfers.set(meta.id, { meta, chunks: new Array(meta.chunks) });
    this.emit('incoming', meta);
  }

  leave(): void { this.room.leave(); this.listeners.clear(); }
}

// ── P2P Location Sharing ─────────────────────────────
export class P2PLocation {
  private room: Room;
  private selfId: string;
  private sendLoc: ActionSender<LocationPayload>;
  private watchId: number | null = null;
  private trail: LocationPayload[] = [];

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-loc`);
    this.selfId = generatePeerId();
    
    [this.sendLoc] = makeTypedAction<LocationPayload>(this.room, 'loc');
    const [, onLoc] = makeTypedAction<LocationPayload>(this.room, 'loc');

    onLoc((data, peerId) => {
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
  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  startSharing(coarse = false): void {
    if (!navigator.geolocation) return;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload: LocationPayload = {
          userId: this.selfId,
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

  stopSharing(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getTrail(): LocationPayload[] { return [...this.trail]; }
  leave(): void { this.stopSharing(); this.room.leave(); this.listeners.clear(); }
}

// ── P2P Call Signaling ───────────────────────────────
export class P2PCallSignaling {
  private room: Room;
  private selfId: string;
  private sendSignal: ActionSender<CallSignal>;
  private peerConnection: RTCPeerConnection | null = null;

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-call`);
    this.selfId = generatePeerId();
    
    [this.sendSignal] = makeTypedAction<CallSignal>(this.room, 'signal');
    const [, onSignal] = makeTypedAction<CallSignal>(this.room, 'signal');

    onSignal((data, peerId) => this.emit('signal', data, peerId));
  }

  private listeners: Map<string, Set<Function>> = new Map();
  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }
  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(cb => cb(...args));
  }

  async call(targetPeerId: string, callType: 'audio' | 'video' = 'audio'): Promise<CallSignal> {
    const signal: CallSignal = {
      type: 'offer', from: this.selfId, to: targetPeerId, callType, timestamp: Date.now(),
    };
    await this.sendSignal(signal);
    return signal;
  }

  async accept(targetPeerId: string): Promise<void> {
    await this.sendSignal({
      type: 'accept', from: this.selfId, to: targetPeerId, timestamp: Date.now(),
    });
  }

  async reject(targetPeerId: string): Promise<void> {
    await this.sendSignal({
      type: 'reject', from: this.selfId, to: targetPeerId, timestamp: Date.now(),
    });
  }

  async hangup(targetPeerId: string): Promise<void> {
    await this.sendSignal({
      type: 'hangup', from: this.selfId, to: targetPeerId, timestamp: Date.now(),
    });
    this.peerConnection?.close();
    this.peerConnection = null;
  }

  addStream(stream: MediaStream): Promise<void>[] { 
    return this.room.addStream(stream); 
  }
  
  onPeerStream(cb: (stream: MediaStream, peerId: string, metadata: JsonValue) => void): void { 
    this.room.onPeerStream(cb); 
  }

  leave(): void { this.peerConnection?.close(); this.room.leave(); this.listeners.clear(); }
}

// ── Unified P2P Room ─────────────────────────────────
export class UnifiedP2PRoom {
  chat: P2PChatEngine;
  files: P2PFileTransfer;
  location: P2PLocation;
  calls: P2PCallSignaling;
  private room: Room;
  private selfId: string;

  constructor(roomId: string, password?: string) {
    this.room = joinRoom({ appId: APP_ID, password }, `${roomId}-presence`);
    this.selfId = generatePeerId();
    this.chat = new P2PChatEngine(roomId, password);
    this.files = new P2PFileTransfer(roomId, password);
    this.location = new P2PLocation(roomId, password);
    this.calls = new P2PCallSignaling(roomId, password);
  }

  getSelfId(): string { return this.selfId; }
  getPeers(): string[] { return Object.keys(this.room.getPeers()); }

  leave(): void {
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
