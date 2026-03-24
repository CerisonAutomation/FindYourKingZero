// p2p.ts — Trystero P2P (Nostr relay strategy) + backwards-compat shim
// DataPayload from trystero = { [key: string]: JsonValue } | JsonValue[]
// We avoid makeAction<T> generics entirely and cast at callback sites.
import { joinRoom } from 'trystero/nostr';
import type { Room, DataPayload } from 'trystero';
import type { P2PMessage } from '@/types';

const APP_ID = 'find-your-king-v1';

interface P2PRoom {
  room: Room;
  sendChat:     (data: P2PMessage, peerId?: string) => void;
  sendTyping:   (data: { peerId: string; isTyping: boolean }, peerId?: string) => void;
  sendPresence: (data: { name: string; avatar: string; online: boolean }, peerId?: string) => void;
  getChat:      (cb: (data: P2PMessage, peerId: string) => void) => void;
  getTyping:    (cb: (data: { peerId: string; isTyping: boolean }, peerId: string) => void) => void;
  getPresence:  (cb: (data: { name: string; avatar: string; online: boolean }, peerId: string) => void) => void;
  getFile:      (cb: (data: ArrayBuffer, peerId: string, meta: { name: string; type: string }) => void) => void;
}

const rooms = new Map<string, P2PRoom>();

function joinChatRoom(roomId: string): P2PRoom {
  const existing = rooms.get(roomId);
  if (existing) return existing;

  const room = joinRoom({ appId: APP_ID }, roomId);

  // No generic on makeAction — avoids DataPayload constraint mismatch entirely.
  // Types are asserted at the callback call sites instead.
  const [rawSendChat,     rawGetChat]     = room.makeAction('msg');
  const [rawSendTyping,   rawGetTyping]   = room.makeAction('typ');
  const [rawSendPresence, rawGetPresence] = room.makeAction('prs');
  const [,                rawGetFile]     = room.makeAction('file');

  const p2pRoom: P2PRoom = {
    room,
    sendChat:     (data, peerId?) => { void rawSendChat(data as DataPayload, peerId); },
    sendTyping:   (data, peerId?) => { void rawSendTyping(data as DataPayload, peerId); },
    sendPresence: (data, peerId?) => { void rawSendPresence(data as DataPayload, peerId); },
    getChat:      (cb) => { rawGetChat((d, pid) => cb(d as P2PMessage, pid)); },
    getTyping:    (cb) => { rawGetTyping((d, pid) => cb(d as { peerId: string; isTyping: boolean }, pid)); },
    getPresence:  (cb) => { rawGetPresence((d, pid) => cb(d as { name: string; avatar: string; online: boolean }, pid)); },
    getFile:      (cb) => {
      rawGetFile((d, pid, meta) => {
        if (d instanceof ArrayBuffer) cb(d, pid, meta as { name: string; type: string });
      });
    },
  };

  rooms.set(roomId, p2pRoom);
  return p2pRoom;
}

function leaveRoom(roomId: string): void {
  const r = rooms.get(roomId);
  if (r) { r.room.leave(); rooms.delete(roomId); }
}

export function leaveAll(): void {
  rooms.forEach((r) => r.room.leave());
  rooms.clear();
}

// ── Backwards-compat shim ───────────────────────────────────────────
export const p2p = {
  join:  (roomId: string) => joinChatRoom(roomId),
  leave: (roomId: string) => leaveRoom(roomId),
  leaveAll,
};

export const chatRoomId = (uid1: string, uid2: string): string =>
  [uid1, uid2].sort().join(':');

export const proximityRoomId = (h3Hex: string): string =>
  `proximity:${h3Hex}`;

export { joinChatRoom };
