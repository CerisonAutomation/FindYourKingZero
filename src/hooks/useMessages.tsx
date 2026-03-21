import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export type Conversation  = {
    id: string;
    participant_one: string;
    participant_two: string;
    last_message_at: string;
    created_at: string;
    other_user?: {
        display_name: string;
        avatar_url: string | null;
        is_online: boolean;
    };
    last_message?: Message;
    unread_count?: number;
}

export type Message  = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'voice' | 'booking_request';
    media_url: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export const useConversations = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {data: conversations, isLoading} = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('conversations')
                .select('*')
                .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
                .order('last_message_at', {ascending: false});

            if (error) throw error;

            // Fetch other user profiles and last messages
            const conversationsWithDetails = await Promise.all(
                (data || []).map(async (conv) => {
                    const otherUserId = conv.participant_one === user.id
                        ? conv.participant_two
                        : conv.participant_one;

                    const [profileRes, messagesRes, unreadRes] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('display_name, avatar_url, is_online')
                            .eq('user_id', otherUserId)
                            .single(),
                        supabase
                            .from('messages')
                            .select('*')
                            .eq('conversation_id', conv.id)
                            .order('created_at', {ascending: false})
                            .limit(1),
                        supabase
                            .from('messages')
                            .select('id', {count: 'exact'})
                            .eq('conversation_id', conv.id)
                            .eq('is_read', false)
                            .neq('sender_id', user.id),
                    ]);

                    return {
                        ...conv,
                        other_user: profileRes.data,
                        last_message: messagesRes.data?.[0],
                        unread_count: unreadRes.count || 0,
                    } as Conversation;
                })
            );

            return conversationsWithDetails;
        },
        enabled: !!user,
    });

    // Subscribe to new conversations
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('conversations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['conversations', user.id]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return {conversations: conversations || [], isLoading};
};

export const useMessages = (conversationId: string | undefined) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {data: messages, isLoading} = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];

            const {data, error} = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', {ascending: true});

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!conversationId,
    });

    // Subscribe to new messages
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`messages-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    queryClient.setQueryData(
                        ['messages', conversationId],
                        (old: Message[] | undefined) => [...(old || []), payload.new as Message]
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    // Mark messages as read
    useEffect(() => {
        if (!conversationId || !user || !messages?.length) return;

        const unreadMessages = messages.filter(
            (m) => !m.is_read && m.sender_id !== user.id
        );

        if (unreadMessages.length > 0) {
            supabase
                .from('messages')
                .update({is_read: true, read_at: new Date().toISOString()})
                .in('id', unreadMessages.map((m) => m.id))
                .then(() => {
                    queryClient.invalidateQueries({queryKey: ['conversations', user.id]});
                });
        }
    }, [messages, conversationId, user, queryClient]);

    return {messages: messages || [], isLoading};
};

export const useSendMessage = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               conversationId,
                               content,
                               messageType = 'text',
                               mediaUrl,
                           }: {
            conversationId: string;
            content: string;
            messageType?: 'text' | 'image' | 'voice' | 'booking_request';
            mediaUrl?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content,
                    message_type: messageType,
                    media_url: mediaUrl,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['messages', data.conversation_id]});
            queryClient.invalidateQueries({queryKey: ['conversations', user?.id]});
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to send message',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

export const useCreateConversation = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (otherUserId: string) => {
            if (!user) throw new Error('Not authenticated');

            // Check if conversation already exists
            const {data: existing} = await supabase
                .from('conversations')
                .select('*')
                .or(
                    `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`
                )
                .single();

            if (existing) return existing;

            // Create new conversation
            const {data, error} = await supabase
                .from('conversations')
                .insert({
                    participant_one: user.id,
                    participant_two: otherUserId,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['conversations', user?.id]});
        },
    });
};
