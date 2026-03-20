/**
 * useP2PChat — P2P chat with Trystero 0.22.0
 * Provides decentralized messaging with Supabase fallback
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { joinRoom, makeAction, selfId } from 'trystero';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Types
export interface P2PMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'file' | 'reaction' | 'typing';
  metadata?: Record<string, unknown>;
  expiresAt?: number;
  isP2P: boolean;
}

export interface P2PPeer {
  id: string;
  isOnline: boolean;
  lastSeen: number;
  typing: boolean;
}

export interface P2PChatState {
  messages: P2PMessage[];
  peers: P2PPeer[];
  isConnected: boolean;
  isP2PEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

// Trystero configuration
const TRYSTERO_CONFIG = {
  appId: import.meta.env.VITE_TRYSTERO_APP_ID || 'fykzero-dating-app',
  // Use multiple relay servers for redundancy
  relayUrls: [
    'wss://relay.trystero.io',
    'wss://relay2.trystero.io',
    'wss://relay3.trystero.io',
  ],
};

export const useP2PChat = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [state, setState] = useState<P2PChatState>({
    messages: [],
    peers: [],
    isConnected: false,
    isP2PEnabled: false,
    connectionQuality: 'disconnected',
  });

  // Refs
  const roomRef = useRef<any>(null);
  const sendMessageRef = useRef<any>(null);
  const getMessageRef = useRef<any>(null);
  const sendReactionRef = useRef<any>(null);
  const getReactionRef = useRef<any>(null);
  const sendTypingRef = useRef<any>(null);
  const getTypingRef = useRef<any>(null);
  const sendFileRef = useRef<any>(null);
  const getFileRef = useRef<any>(null);
  const peersRef = useRef<Map<string, P2PPeer>>(new Map());
  const messageQueueRef = useRef<P2PMessage[]>([]);
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize P2P room
  const initializeRoom = useCallback(async () => {
    if (!user || !conversationId) return;

    try {
      // Create or join room
      const room = joinRoom(TRYSTERO_CONFIG, conversationId);
      roomRef.current = room;

      // Create actions for different message types
      const [sendMessage, getMessage] = makeAction(room, 'chat');
      const [sendReaction, getReaction] = makeAction(room, 'reaction');
      const [sendTyping, getTyping] = makeAction(room, 'typing');
      const [sendFile, getFile] = makeAction(room, 'file');

      sendMessageRef.current = sendMessage;
      getMessageRef.current = getMessage;
      sendReactionRef.current = sendReaction;
      getReactionRef.current = getReaction;
      sendTypingRef.current = sendTyping;
      getTypingRef.current = getTyping;
      sendFileRef.current = sendFile;
      getFileRef.current = getFile;

      // Set up message handlers
      getMessage((data: P2PMessage, peerId: string) => {
        handleIncomingMessage(data, peerId);
      });

      getReaction((data: { messageId: string; emoji: string; action: 'add' | 'remove' }, peerId: string) => {
        handleIncomingReaction(data, peerId);
      });

      getTyping((data: { isTyping: boolean }, peerId: string) => {
        handleTypingIndicator(data, peerId);
      });

      getFile((data: { fileName: string; fileSize: number; fileType: string; fileData: ArrayBuffer }, peerId: string) => {
        handleIncomingFile(data, peerId);
      });

      // Handle peer connections
      room.onPeerJoin((peerId: string) => {
        handlePeerJoin(peerId);
      });

      room.onPeerLeave((peerId: string) => {
        handlePeerLeave(peerId);
      });

      // Update connection state
      setState(prev => ({
        ...prev,
        isConnected: true,
        isP2PEnabled: true,
        connectionQuality: 'excellent',
      }));

      // Start connection quality monitoring
      startConnectionMonitoring();

      // Process queued messages
      processMessageQueue();

    } catch (error) {
      console.error('Failed to initialize P2P room:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isP2PEnabled: false,
        connectionQuality: 'disconnected',
      }));
      
      // Fallback to Supabase
      fallbackToSupabase();
    }
  }, [user, conversationId]);

  // Handle incoming P2P message
  const handleIncomingMessage = useCallback((data: P2PMessage, peerId: string) => {
    const message: P2PMessage = {
      ...data,
      id: data.id || `p2p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: peerId,
      timestamp: data.timestamp || Date.now(),
      isP2P: true,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    // Handle ephemeral messages
    if (message.expiresAt) {
      setTimeout(() => {
        removeMessage(message.id);
      }, message.expiresAt - Date.now());
    }

    // Store in Supabase for persistence
    storeMessageInSupabase(message);
  }, []);

  // Handle incoming reaction
  const handleIncomingReaction = useCallback((data: { messageId: string; emoji: string; action: 'add' | 'remove' }, peerId: string) => {
    // Update local reaction state
    // This would integrate with the existing reaction system
    console.log('P2P reaction received:', data, 'from:', peerId);
  }, []);

  // Handle typing indicator
  const handleTypingIndicator = useCallback((data: { isTyping: boolean }, peerId: string) => {
    setState(prev => ({
      ...prev,
      peers: prev.peers.map(peer =>
        peer.id === peerId
          ? { ...peer, typing: data.isTyping }
          : peer
      ),
    }));
  }, []);

  // Handle incoming file
  const handleIncomingFile = useCallback((data: { fileName: string; fileSize: number; fileType: string; fileData: ArrayBuffer }, peerId: string) => {
    // Create blob URL for the file
    const blob = new Blob([data.fileData], { type: data.fileType });
    const url = URL.createObjectURL(blob);

    const fileMessage: P2PMessage = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: peerId,
      content: data.fileName,
      timestamp: Date.now(),
      type: 'file',
      metadata: {
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        fileUrl: url,
      },
      isP2P: true,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, fileMessage],
    }));
  }, []);

  // Handle peer join
  const handlePeerJoin = useCallback((peerId: string) => {
    const peer: P2PPeer = {
      id: peerId,
      isOnline: true,
      lastSeen: Date.now(),
      typing: false,
    };

    peersRef.current.set(peerId, peer);
    setState(prev => ({
      ...prev,
      peers: Array.from(peersRef.current.values()),
    }));

    // Send current user info to new peer
    if (user) {
      sendMessageRef.current?.({
        type: 'presence',
        userId: user.id,
        displayName: user.user_metadata?.display_name || 'Anonymous',
        avatarUrl: user.user_metadata?.avatar_url,
      }, peerId);
    }
  }, [user]);

  // Handle peer leave
  const handlePeerLeave = useCallback((peerId: string) => {
    peersRef.current.delete(peerId);
    setState(prev => ({
      ...prev,
      peers: Array.from(peersRef.current.values()),
    }));
  }, []);

  // Send message via P2P
  const sendMessage = useCallback(async (content: string, type: P2PMessage['type'] = 'text', metadata?: Record<string, unknown>) => {
    if (!user) return;

    const message: P2PMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.id,
      content,
      timestamp: Date.now(),
      type,
      metadata,
      isP2P: state.isP2PEnabled,
    };

    // Add to local state immediately
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    // Try P2P first
    if (state.isP2PEnabled && sendMessageRef.current) {
      try {
        await sendMessageRef.current(message);
        return message;
      } catch (error) {
        console.error('P2P send failed, queuing for fallback:', error);
        messageQueueRef.current.push(message);
      }
    }

    // Fallback to Supabase
    await sendMessageViaSupabase(message);
    return message;
  }, [user, state.isP2PEnabled]);

  // Send reaction via P2P
  const sendReaction = useCallback(async (messageId: string, emoji: string, action: 'add' | 'remove') => {
    if (!user || !sendReactionRef.current) return;

    const reactionData = {
      messageId,
      emoji,
      action,
      userId: user.id,
    };

    try {
      await sendReactionRef.current(reactionData);
    } catch (error) {
      console.error('Failed to send P2P reaction:', error);
    }
  }, [user]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!user || !sendTypingRef.current) return;

    try {
      await sendTypingRef.current({ isTyping, userId: user.id });
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }, [user]);

  // Send file via P2P
  const sendFile = useCallback(async (file: File) => {
    if (!user || !sendFileRef.current) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: arrayBuffer,
      };

      await sendFileRef.current(fileData);

      // Add file message to local state
      const fileMessage: P2PMessage = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, fileMessage],
      }));

      return fileMessage;
    } catch (error) {
      console.error('Failed to send file via P2P:', error);
      throw error;
    }
  }, [user]);

  // Send ephemeral message
  const sendEphemeralMessage = useCallback(async (content: string, expiresInMs: number) => {
    const message = await sendMessage(content, 'text', {
      ephemeral: true,
      expiresAt: Date.now() + expiresInMs,
    });

    if (message) {
      // Set up auto-deletion
      setTimeout(() => {
        removeMessage(message.id);
      }, expiresInMs);
    }

    return message;
  }, [sendMessage]);

  // Remove message from local state
  const removeMessage = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
    }));
  }, []);

  // Store message in Supabase for persistence
  const storeMessageInSupabase = useCallback(async (message: P2PMessage) => {
    if (!user) return;

    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: message.senderId,
        content: message.content,
        message_type: message.type,
        media_url: message.metadata?.fileUrl as string,
        metadata: message.metadata,
        is_p2p: message.isP2P,
        created_at: new Date(message.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('Failed to store message in Supabase:', error);
    }
  }, [user, conversationId]);

  // Send message via Supabase fallback
  const sendMessageViaSupabase = useCallback(async (message: P2PMessage) => {
    if (!user) return;

    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: message.senderId,
        content: message.content,
        message_type: message.type,
        media_url: message.metadata?.fileUrl as string,
        metadata: message.metadata,
        is_p2p: false,
        created_at: new Date(message.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('Failed to send message via Supabase:', error);
      toast({
        title: 'Message failed',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, conversationId, toast]);

  // Fallback to Supabase when P2P fails
  const fallbackToSupabase = useCallback(() => {
    setState(prev => ({
      ...prev,
      isP2PEnabled: false,
      connectionQuality: 'disconnected',
    }));

    // Process queued messages via Supabase
    messageQueueRef.current.forEach(message => {
      sendMessageViaSupabase(message);
    });
    messageQueueRef.current = [];

    toast({
      title: 'P2P unavailable',
      description: 'Using server-based messaging instead.',
    });
  }, [toast, sendMessageViaSupabase]);

  // Process queued messages
  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length > 0 && state.isP2PEnabled) {
      messageQueueRef.current.forEach(message => {
        sendMessageRef.current?.(message);
      });
      messageQueueRef.current = [];
    }
  }, [state.isP2PEnabled]);

  // Start connection quality monitoring
  const startConnectionMonitoring = useCallback(() => {
    connectionCheckIntervalRef.current = setInterval(() => {
      if (roomRef.current) {
        const peerCount = roomRef.current.getPeers().length;
        const quality = peerCount > 0 ? 'excellent' : 'disconnected';
        
        setState(prev => ({
          ...prev,
          connectionQuality: quality,
        }));
      }
    }, 5000);
  }, []);

  // Load existing messages from Supabase
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages: P2PMessage[] = (data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
        type: msg.message_type as P2PMessage['type'],
        metadata: msg.metadata as Record<string, unknown>,
        isP2P: msg.is_p2p || false,
      }));

      setState(prev => ({
        ...prev,
        messages,
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [conversationId]);

  // Initialize on mount
  useEffect(() => {
    if (user && conversationId) {
      initializeRoom();
      loadMessages();
    }

    return () => {
      // Cleanup
      if (roomRef.current) {
        roomRef.current.leave();
      }
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current);
      }
    };
  }, [user, conversationId, initializeRoom, loadMessages]);

  // Return hook interface
  return {
    // State
    messages: state.messages,
    peers: state.peers,
    isConnected: state.isConnected,
    isP2PEnabled: state.isP2PEnabled,
    connectionQuality: state.connectionQuality,

    // Actions
    sendMessage,
    sendReaction,
    sendTypingIndicator,
    sendFile,
    sendEphemeralMessage,
    removeMessage,

    // Utilities
    selfId,
    loadMessages,
  };
};

export default useP2PChat;