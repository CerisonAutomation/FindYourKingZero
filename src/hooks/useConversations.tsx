import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useEffect} from 'react';

export type ConversationWithDetails  = {
    id: string;
    participant_one: string;
    participant_two: string;
    last_message_at: string | null;
    created_at: string | null;
    other_user: {
        user_id: string;
        display_name: string | null;
        avatar_url: string | null;
        is_online: boolean | null;
        last_seen: string | null;
    } | null;
    last_message: {
        content: string;
        sender_id: string;
        created_at: string;
        is_read: boolean;
    } | null;
    unread_count: number;
}

export const useConversations = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];

            // Fetch conversations
            const {data: conversations, error} = await supabase
                .from('conversations')
                .select('*')
                .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
                .order('last_message_at', {ascending: false, nullsFirst: false});

            if (error) throw error;

            // Enrich with other user info and last message
            const enrichedConversations = await Promise.all(
                (conversations || []).map(async (conv) => {
                    const otherUserId = conv.participant_a === user.id
                        ? conv.participant_b
                        : conv.participant_a;

                    const [profileResult, lastMessageResult, unreadResult] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('id, display_name, photo_url, online_status, last_seen_at')
                            .eq('id', otherUserId)
                            .single(),
                        supabase
                            .from('messages')
                            .select('content_encrypted, sender_id, created_at, read_at')
                            .eq('conversation_id', conv.id)
                            .order('created_at', {ascending: false})
                            .limit(1)
                            .single(),
                        supabase
                            .from('messages')
                            .select('id', {count: 'exact'})
                            .eq('conversation_id', conv.id)
                            .neq('sender_id', user.id)
                            .is('read_at', null),
                    ]);

                    return {
                        ...conv,
                        other_user: profileResult.data,
                        last_message: lastMessageResult.data,
                        unread_count: unreadResult.count || 0,
                    } as unknown as ConversationWithDetails;
                })
            );

            return enrichedConversations;
        },
        enabled: !!user,
    });

    // Real-time subscription for conversation updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('conversations-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                (payload) => {
                    const conv = payload.new as any;
                    if (conv?.participant_one === user.id || conv?.participant_two === user.id) {
                        queryClient.invalidateQueries({queryKey: ['conversations']});
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['conversations']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return query;
};

export const useCreateConversation = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (otherUserId: string) => {
            if (!user) throw new Error('Not authenticated');

            // Check if conversation exists
            const {data: existing} = await supabase
                .from('conversations')
                .select('id')
                .or(
                    `and(participant_a.eq.${user.id},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${user.id})`
                )
                .single();

            if (existing) return existing.id;

            // Create new conversation
            const {data, error} = await supabase
                .from('conversations')
                .insert({
                    participant_a: user.id,
                    participant_b: otherUserId,
                } as Record<string, unknown>)
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['conversations']});
        },
    });
};

export const useConversationMessages = (conversationId: string | null) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];

            const {data, error} = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', {ascending: true});

            if (error) throw error;

            // Mark messages as read
            if (user) {
                await supabase
                    .from('messages')
                    .update({read_at: new Date().toISOString()} as Record<string, unknown>)
                    .eq('conversation_id', conversationId)
                    .neq('sender_id', user.id)
                    .is('read_at', null);
            }

            return data;
        },
        enabled: !!conversationId,
    });

    // Real-time subscription for new messages
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
                () => {
                    queryClient.invalidateQueries({queryKey: ['messages', conversationId]});
                    queryClient.invalidateQueries({queryKey: ['conversations']});
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['messages', conversationId]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    return query;
};

export const useSendMessage = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({conversationId, content, mediaUrl}: {
            conversationId: string;
            content: string;
            mediaUrl?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content_encrypted: content,
                    message_type: mediaUrl ? 'media' : 'text',
                } as Record<string, unknown>)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, {conversationId}) => {
            queryClient.invalidateQueries({queryKey: ['messages', conversationId]});
            queryClient.invalidateQueries({queryKey: ['conversations']});
        },
    });
};

export const useConversationPresence = (conversationId: string | null) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId || !user) return;

        const channel = supabase.channel(`presence-${conversationId}`, {
            config: {presence: {key: user.id}},
        });

        channel
            .on('presence', {event: 'sync'}, () => {
                const state = channel.presenceState();
                queryClient.setQueryData(['presence', conversationId], state);
            })
            .on('presence', {event: 'join'}, ({key, newPresences}) => {
                console.log('User joined:', key, newPresences);
            })
            .on('presence', {event: 'leave'}, ({key, leftPresences}) => {
                console.log('User left:', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                        typing: false,
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, user, queryClient]);

    const setTyping = async (isTyping: boolean) => {
        if (!conversationId || !user) return;

        const channel = supabase.channel(`presence-${conversationId}`);
        await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            typing: isTyping,
        });
    };

    return {setTyping};
};
