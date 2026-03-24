// p2p.ts — Trystero P2P (Nostr relay strategy)
import { joinRoom } from 'trystero/nostr';
import type { Room } from 'trystero';
import type { P2PMessage } from '@/types';

const APP_ID = 'find-your-king-v1';

interface P2PRoom {
  room: Room;
  sendMessage:  (data: P2PMessage, peerId?: string) => void;
  sendTyping:   (data: { peerId: string; isTyping: boolean }, peerId?: string) => void;
  sendPresence: (data: { name: string; avatar: string; online: boolean }, peerId?: string) => void;
  onMessage:    (cb: (data: P2PMessage, peerId: string) => void) => void;
  onTyping:     (cb: (data: { peerId: string; isTyping: boolean }, peerId: string) => void) => void;
  onPresence:   (cb: (data: { name: string; avatar: string; online: boolean }, peerId: string) => void) => void;
  onFile:       (cb: (data: ArrayBuffer, peerId: string, meta: { name: string; type: string }) => void) => void;
  leave:        () => void;
}

const rooms = new Map<string, P2PRoom>();

export function joinChatRoom(roomId: string): P2PRoom {
  const existing = rooms.get(roomId);
  if (existing) return existing;

  const room = joinRoom({ appId: APP_ID }, roomId);

  const [sendMessage,  onMessage]  = room.makeAction<P2PMessage>('msg');
  const [sendTyping,   onTyping]   = room.makeAction<{ peerId: string; isTyping: boolean }>('typ');
  const [sendPresence, onPresence] = room.makeAction<{ name: string; avatar: string; online: boolean }>('prs');
  const [,             onFile]     = room.makeAction<ArrayBuffer>('file');

  const p2pRoom: P2PRoom = {
    room,
    sendMessage:  (data, peerId?) => { void sendMessage(data, peerId); },
    sendTyping:   (data, peerId?) => { void sendTyping(data, peerId); },
    sendPresence: (data, peerId?) => { void sendPresence(data, peerId); },
    onMessage:    (cb) => { onMessage(cb); },
    onTyping:     (cb) => { onTyping(cb); },
    onPresence:   (cb) => { onPresence(cb); },
    onFile:       (cb) => {
      onFile((data: unknown, peerId: string, meta: unknown) => {
        if (data instanceof ArrayBuffer) {
          cb(data, peerId, meta as { name: string; type: string });
        }
      });
    },
    leave: () => {
      room.leave();
      rooms.delete(roomId);
    },
  };

  rooms.set(roomId, p2pRoom);
  return p2pRoom;
}

export function leaveAll(): void {
  rooms.forEach((r) => r.leave());
  rooms.clear();
}
