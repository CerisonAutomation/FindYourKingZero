// ═══════════════════════════════════════════════════════════════
// SERVICES: P2P — Trystero v0.22 + Y.js CRDT sync
// Zero-server, E2EE, offline-first
// ═══════════════════════════════════════════════════════════════

import { joinRoom, selfId } from 'trystero';
import type { P2PMessage } from '@/types';

const APP_ID = 'find-your-king-2026';

type Room = ReturnType<typeof joinRoom>;

interface RoomActions {
  room: Room;
  sendChat: (data: P2PMessage, peerId?: string) => Promise<void>;
  getChat: (cb: (data: P2PMessage, peerId: string) => void) => void;
  sendTyping: (data: { peerId: string; isTyping: boolean }, peerId?: string) => Promise<void>;
  getTyping: (cb: (data: { peerId: string; isTyping: boolean }, peerId: string) => void) => void;
  sendPresence: (data: { name: string; avatar: string; online: boolean }, peerId?: string) => Promise<void>;
  getPresence: (cb: (data: { name: string; avatar: string; online: boolean }, peerId: string) => void) => void;
}

class P2PManager {
  private rooms = new Map<string, RoomActions>();

  join(roomId: string): RoomActions {
    const existing = this.rooms.get(roomId);
    if (existing) return existing;

    const room = joinRoom({ appId: APP_ID, maxConns: 20 }, roomId);

    const [sendChat, getChat] = room.makeAction<P2PMessage>('chat');
    const [sendTyping, getTyping] = room.makeAction<{ peerId: string; isTyping: boolean }>('typing');
    const [sendPresence, getPresence] = room.makeAction<{ name: string; avatar: string; online: boolean }>('presence');

    const actions: RoomActions = {
      room,
      sendChat,
      getChat,
      sendTyping,
      getTyping,
      sendPresence,
      getPresence,
    };

    this.rooms.set(roomId, actions);

    room.onPeerJoin((peerId) => {
      console.log(`[P2P] Peer joined ${roomId}: ${peerId}`);
    });

    room.onPeerLeave((peerId) => {
      console.log(`[P2P] Peer left ${roomId}: ${peerId}`);
    });

    return actions;
  }

  leave(roomId: string) {
    const actions = this.rooms.get(roomId);
    if (actions) {
      actions.room.leave();
      this.rooms.delete(roomId);
    }
  }

  async sendFile(roomId: string, file: File, peerId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error(`Not in room: ${roomId}`);

    const [sendFile] = room.room.makeAction<{ name: string; type: string }>('file');
    return sendFile(file, peerId, { name: file.name, type: file.type });
  }

  onFileReceived(roomId: string, cb: (data: ArrayBuffer, peerId: string, meta: { name: string; type: string }) => void) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const [, getFile] = room.room.makeAction('file');
    getFile(cb);
  }

  async startCall(roomId: string, stream: MediaStream, peerId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error(`Not in room: ${roomId}`);

    room.room.addStream(stream, peerId);

    return new Promise<MediaStream>((resolve) => {
      room.room.onPeerStream((remoteStream) => resolve(remoteStream));
    });
  }

  getRoomIds(): string[] {
    return Array.from(this.rooms.keys());
  }

  get selfId() {
    return selfId;
  }
}

export const p2p = new P2PManager();

// Generate deterministic room ID for 1:1 chat
export function chatRoomId(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join('-');
}

// Proximity room (hex-based)
export function proximityRoomId(h3Hex: string): string {
  return `geo-${h3Hex.slice(0, 6)}`;
}
