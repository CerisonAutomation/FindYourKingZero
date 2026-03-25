// =============================================================================
// useMessages.ts — Messages management hook
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'location';
  mediaUrl?: string;
  createdAt: string;
  readAt?: string;
  reactions?: Record<string, string[]>;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UseMessagesOptions {
  conversationId?: string;
  pageSize?: number;
}

export function useMessages(options: UseMessagesOptions = {}) {
  const { conversationId, pageSize = 50 } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convId: string, offset = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (fetchError) throw fetchError;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        type: msg.type as Message['type'],
        mediaUrl: msg.media_url,
        createdAt: msg.created_at,
        readAt: msg.read_at,
        reactions: msg.reactions as Record<string, string[]> | undefined,
      }));

      if (offset === 0) {
        setMessages(formattedMessages);
      } else {
        setMessages(prev => [...formattedMessages, ...prev]);
      }

      setHasMore(formattedMessages.length === pageSize);
    } catch (err) {
      log.error('MESSAGES', 'Failed to fetch messages', err as Error);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  // Fetch all conversations for current user
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedConversations: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        participants: conv.participants || [],
        unreadCount: conv.unread_count || 0,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      }));

      setConversations(formattedConversations);
    } catch (err) {
      log.error('MESSAGES', 'Failed to fetch conversations', err as Error);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    convId: string,
    content: string,
    type: Message['type'] = 'text',
    mediaUrl?: string
  ) => {
    try {
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          content,
          type,
          media_url: mediaUrl,
        })
        .select()
        .single();

      if (sendError) throw sendError;

      const newMessage: Message = {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        content: data.content,
        type: data.type as Message['type'],
        mediaUrl: data.media_url,
        createdAt: data.created_at,
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      log.error('MESSAGES', 'Failed to send message', err as Error);
      throw err;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (convId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .is('read_at', null);

      setConversations(prev =>
        prev.map(conv =>
          conv.id === convId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      log.error('MESSAGES', 'Failed to mark as read', err as Error);
    }
  }, []);

  // Load more messages
  const loadMore = useCallback(() => {
    if (conversationId && hasMore && !isLoading) {
      fetchMessages(conversationId, messages.length);
    }
  }, [conversationId, hasMore, isLoading, messages.length, fetchMessages]);

  // Initial fetch
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      fetchConversations();
    }
  }, [conversationId, fetchMessages, fetchConversations]);

  return {
    messages,
    conversations,
    isLoading,
    error,
    hasMore,
    sendMessage,
    markAsRead,
    loadMore,
    fetchMessages,
    fetchConversations,
  };
}

export function useConversations() {
  const { conversations, isLoading, error, fetchConversations } = useMessages();
  return { conversations, isLoading, error, fetchConversations };
}

export default useMessages;
