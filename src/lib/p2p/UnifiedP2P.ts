// =====================================================
// Unified P2P Services — Chat, Files, Location, Presence, Signaling
// Built on Trystero 0.22 Nostr strategy
// =====================================================
import {joinRoom} from 'trystero/nostr';
import type {Room} from 'trystero';

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
