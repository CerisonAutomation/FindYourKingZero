/**
 * useP2PChat — P2P chat with Trystero 0.22.0 (Supabase strategy)
 *
 * Uses trystero/supabase for signalling:
 *   - appId  = VITE_SUPABASE_URL  (your Supabase project URL)
 *   - supabaseKey = VITE_SUPABASE_ANON_KEY  (anon public key)
 *
 * All actual chat data is sent peer-to-peer, end-to-end encrypted.
 * Supabase is only used for peer discovery (WebRTC signalling).
 * Messages are also persisted to Supabase as a fallback/history.
 *
 * Official Trystero API reference: https://github.com/dmotz/trystero
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { joinRoom, selfId } from 'trystero/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type P2PMessage = {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'file' | 'reaction' | 'typing';
  metadata?: Record<string, unknown>;
  expiresAt?: number;
  isP2P: boolean;
}

export type P2PPeer = {
  id: string;
  isOnline: boolean;
  lastSeen: number;
  typing: boolean;
}

export type P2PChatState = {
  messages: P2PMessage[];
  peers: P2PPeer[];
  isConnected: boolean;
  isP2PEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

// ──────────────────────────────────────────────────────────────────────────────
// Trystero Supabase strategy config
// Per official docs: appId = project URL, supabaseKey = anon public key
// https://github.com/dmotz/trystero#supabase-setup
// ──────────────────────────────────────────────────────────────────────────────
const TRYSTERO_CONFIG = {
  appId: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────
export const useP2PChat = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<P2PChatState>({
    messages: [],
    peers: [],
    isConnected: false,
    isP2PEnabled: false,
    connectionQuality: 'disconnected',
  });

  // Refs for the room instance and action senders
  const roomRef = useRef<ReturnType<typeof joinRoom> | null>(null);
  const sendChatRef = useRef<((data: P2PMessage, targetPeerId?: string) => Promise<void>) | null>(null);
  const sendReactionRef = useRef<((data: { messageId: string; emoji: string; action: 'add' | 'remove' }) => Promise<void>) | null>(null);
  const sendTypingRef = useRef<((data: { isTyping: boolean }) => Promise<void>) | null>(null);
  const sendFileRef = useRef<((data: { fileName: string; fileSize: number; fileType: string; fileData: ArrayBuffer }) => Promise<void>) | null>(null);
  const peersRef = useRef<Map<string, P2PPeer>>(new Map());
  const messageQueueRef = useRef<P2PMessage[]>([]);
  const connectionCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // ──────────────────────────────────────────────────────────────────────────
  // Handlers (defined before initializeRoom so they can be referenced)
  // ──────────────────────────────────────────────────────────────────────────

  const removeMessage = useCallback((messageId: string) => {
    if (!mountedRef.current) return;
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== messageId),
    }));
  }, []);

  const storeMessageInSupabase = useCallback(async (message: P2PMessage) => {
    if (!user) return;
    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: message.senderId,
        content: message.content,
        message_type: message.type,
        media_url: message.metadata?.fileUrl as string | undefined,
        metadata: message.metadata ?? null,
        is_p2p: message.isP2P,
        created_at: new Date(message.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('[P2P] Failed to persist message to Supabase:', error);
    }
  }, [user, conversationId]);

  const sendMessageViaSupabase = useCallback(async (message: P2PMessage) => {
    if (!user) return;
    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: message.senderId,
        content: message.content,
        message_type: message.type,
        media_url: message.metadata?.fileUrl as string | undefined,
        metadata: message.metadata ?? null,
        is_p2p: false,
        created_at: new Date(message.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('[P2P] Supabase fallback send failed:', error);
      toast({
        title: 'Message failed',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, conversationId, toast]);

  const handleIncomingMessage = useCallback((data: P2PMessage, peerId: string) => {
    if (!mountedRef.current) return;
    const message: P2PMessage = {
      ...data,
      id: data.id || `p2p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      senderId: peerId,
      timestamp: data.timestamp || Date.now(),
      isP2P: true,
    };
    setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
    // Auto-delete ephemeral messages
    if (message.expiresAt && message.expiresAt > Date.now()) {
      setTimeout(() => removeMessage(message.id), message.expiresAt - Date.now());
    }
    // Persist for history
    storeMessageInSupabase(message);
  }, [removeMessage, storeMessageInSupabase]);

  const handleTypingIndicator = useCallback((data: { isTyping: boolean }, peerId: string) => {
    if (!mountedRef.current) return;
    setState(prev => ({
      ...prev,
      peers: prev.peers.map(p => p.id === peerId ? { ...p, typing: data.isTyping } : p),
    }));
  }, []);

  const handleIncomingFile = useCallback((data: { fileName: string; fileSize: number; fileType: string; fileData: ArrayBuffer }, peerId: string) => {
    if (!mountedRef.current) return;
    const blob = new Blob([data.fileData], { type: data.fileType });
    const url = URL.createObjectURL(blob);
    const fileMessage: P2PMessage = {
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      senderId: peerId,
      content: data.fileName,
      timestamp: Date.now(),
      type: 'file',
      metadata: { fileName: data.fileName, fileSize: data.fileSize, fileType: data.fileType, fileUrl: url },
      isP2P: true,
    };
    setState(prev => ({ ...prev, messages: [...prev.messages, fileMessage] }));
  }, []);

  const handlePeerJoin = useCallback((peerId: string) => {
    if (!mountedRef.current) return;
    const peer: P2PPeer = { id: peerId, isOnline: true, lastSeen: Date.now(), typing: false };
    peersRef.current.set(peerId, peer);
    setState(prev => ({ ...prev, peers: Array.from(peersRef.current.values()) }));
  }, []);

  const handlePeerLeave = useCallback((peerId: string) => {
    if (!mountedRef.current) return;
    peersRef.current.delete(peerId);
    setState(prev => ({ ...prev, peers: Array.from(peersRef.current.values()) }));
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Initialize Trystero room
  // Uses room.makeAction() per official Trystero API (NOT makeAction(room, …))
  // ──────────────────────────────────────────────────────────────────────────
  const initializeRoom = useCallback(() => {
    if (!user || !conversationId) return;
    if (!TRYSTERO_CONFIG.appId || !TRYSTERO_CONFIG.supabaseKey) {
      console.error('[P2P] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
      return;
    }

    try {
      // joinRoom returns the room object; calling it again with same config+roomId
      // returns the same instance (Trystero is idempotent)
      const room = joinRoom(TRYSTERO_CONFIG, conversationId);
      roomRef.current = room;

      // makeAction is a method on the room object — NOT a standalone export
      // Returns [sender, receiver, progressHandler]
      const [sendChat, getChat] = room.makeAction<P2PMessage>('chat');
      const [sendReaction, getReaction] = room.makeAction<{ messageId: string; emoji: string; action: 'add' | 'remove' }>('reaction');
      const [sendTyping, getTyping] = room.makeAction<{ isTyping: boolean }>('typing');
      const [sendFile, getFile] = room.makeAction<{ fileName: string; fileSize: number; fileType: string; fileData: ArrayBuffer }>('file');

      sendChatRef.current = sendChat;
      sendReactionRef.current = sendReaction;
      sendTypingRef.current = sendTyping;
      sendFileRef.current = sendFile;

      // Register receivers
      getChat(handleIncomingMessage);
      getReaction((data, peerId) => {
        console.log('[P2P] reaction from', peerId, data);
      });
      getTyping(handleTypingIndicator);
      getFile(handleIncomingFile);

      // Peer lifecycle
      room.onPeerJoin(handlePeerJoin);
      room.onPeerLeave(handlePeerLeave);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isP2PEnabled: true,
          connectionQuality: 'excellent',
        }));
      }

      // Connection quality monitor
      connectionCheckRef.current = setInterval(() => {
        if (!roomRef.current || !mountedRef.current) return;
        const peerCount = Object.keys(roomRef.current.getPeers()).length;
        setState(prev => ({
          ...prev,
          connectionQuality: peerCount > 0 ? 'excellent' : 'good',
        }));
      }, 5000);

      // Flush any queued messages
      if (messageQueueRef.current.length > 0) {
        messageQueueRef.current.forEach(m => sendChatRef.current?.(m));
        messageQueueRef.current = [];
      }
    } catch (error) {
      console.error('[P2P] Failed to initialize Trystero room:', error);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isP2PEnabled: false,
          connectionQuality: 'disconnected',
        }));
      }
      toast({
        title: 'P2P unavailable',
        description: 'Using server-based messaging instead.',
      });
    }
  }, [user, conversationId, handleIncomingMessage, handleTypingIndicator, handleIncomingFile, handlePeerJoin, handlePeerLeave, toast]);

  // ──────────────────────────────────────────────────────────────────────────
  // Load message history from Supabase
  // ──────────────────────────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const messages: P2PMessage[] = (data ?? []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
        type: msg.message_type as P2PMessage['type'],
        metadata: msg.metadata as Record<string, unknown>,
        isP2P: msg.is_p2p ?? false,
      }));
      if (mountedRef.current) {
        setState(prev => ({ ...prev, messages }));
      }
    } catch (error) {
      console.error('[P2P] Failed to load messages:', error);
    }
  }, [conversationId]);

  // ──────────────────────────────────────────────────────────────────────────
  // Public API: sendMessage
  // ──────────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (
    content: string,
    type: P2PMessage['type'] = 'text',
    metadata?: Record<string, unknown>,
  ) => {
    if (!user) return;
    const message: P2PMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      senderId: user.id,
      content,
      timestamp: Date.now(),
      type,
      metadata,
      isP2P: state.isP2PEnabled,
    };
    // Optimistic local update
    setState(prev => ({ ...prev, messages: [...prev.messages, message] }));

    if (state.isP2PEnabled && sendChatRef.current) {
      try {
        await sendChatRef.current(message);
        return message;
      } catch (error) {
        console.error('[P2P] Send failed, queuing for Supabase fallback:', error);
        messageQueueRef.current.push(message);
      }
    }
    await sendMessageViaSupabase(message);
    return message;
  }, [user, state.isP2PEnabled, sendMessageViaSupabase]);

  const sendReaction = useCallback(async (messageId: string, emoji: string, action: 'add' | 'remove') => {
    if (!user || !sendReactionRef.current) return;
    try {
      await sendReactionRef.current({ messageId, emoji, action });
    } catch (error) {
      console.error('[P2P] Failed to send reaction:', error);
    }
  }, [user]);

  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!user || !sendTypingRef.current) return;
    try {
      await sendTypingRef.current({ isTyping });
    } catch (error) {
      console.error('[P2P] Failed to send typing indicator:', error);
    }
  }, [user]);

  const sendFile = useCallback(async (file: File) => {
    if (!user || !sendFileRef.current) return;
    const arrayBuffer = await file.arrayBuffer();
    try {
      await sendFileRef.current({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: arrayBuffer,
      });
      const fileMessage: P2PMessage = {
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        senderId: user.id,
        content: file.name,
        timestamp: Date.now(),
        type: 'file',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: URL.createObjectURL(file),
        },
        isP2P: true,
      };
      setState(prev => ({ ...prev, messages: [...prev.messages, fileMessage] }));
      return fileMessage;
    } catch (error) {
      console.error('[P2P] Failed to send file:', error);
      throw error;
    }
  }, [user]);

  const sendEphemeralMessage = useCallback(async (content: string, expiresInMs: number) => {
    const message = await sendMessage(content, 'text', {
      ephemeral: true,
      expiresAt: Date.now() + expiresInMs,
    });
    if (message) {
      setTimeout(() => removeMessage(message.id), expiresInMs);
    }
    return message;
  }, [sendMessage, removeMessage]);

  // ──────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    if (user && conversationId) {
      initializeRoom();
      loadMessages();
    }
    return () => {
      mountedRef.current = false;
      // Leave room and stop monitoring on cleanup
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
        connectionCheckRef.current = null;
      }
    };
  // Re-initialize if user or conversationId changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, conversationId]);

  return {
    messages: state.messages,
    peers: state.peers,
    isConnected: state.isConnected,
    isP2PEnabled: state.isP2PEnabled,
    connectionQuality: state.connectionQuality,
    sendMessage,
    sendReaction,
    sendTypingIndicator,
    sendFile,
    sendEphemeralMessage,
    removeMessage,
    loadMessages,
    selfId,
  };
};

export default useP2PChat;
