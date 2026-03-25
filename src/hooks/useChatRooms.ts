import {useState} from 'react';
import {useMutation, useQueryClient, useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/hooks/useAuth';
import {toast} from 'sonner';

interface CreateRoomParams {
    type: 'event' | 'group' | 'direct';
    name: string;
    eventId?: string;
    isPrivate?: boolean;
    members?: string[];
}

export function useChatRoom(roomId: string) {
    const {data: room, isLoading} = useQuery({
        queryKey: ['chat-room', roomId],
        queryFn: async () => {
            const {data} = await (supabase as any)
                .from('chat_rooms')
                .select('*')
                .eq('id', roomId)
                .single();
            return data;
        },
        enabled: !!roomId,
    });
    return {room, isLoading};
}

export function useCreateRoom() {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: async (params: CreateRoomParams) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await (supabase as any)
                .from('chat_rooms')
                .insert({
                    type: params.type,
                    name: params.name,
                    event_id: params.eventId,
                    is_private: params.isPrivate ?? false,
                    created_by: user.id,
                })
                .select()
                .single();

            if (error) throw error;

            // Add creator as member
            await (supabase as any)
                .from('chat_room_members')
                .insert({
                    room_id: data.id,
                    user_id: user.id,
                    role: 'admin',
                });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chat-rooms']});
            toast.success('Chat room created');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create room');
        },
    });
}

export function useJoinRoom() {
    const queryClient = useQueryClient();
    const {user} = useAuth();

    return useMutation({
        mutationFn: async (roomId: string) => {
            if (!user) throw new Error('Not authenticated');

            // Check if already a member
            const {data: existing} = await (supabase as any)
                .from('chat_room_members')
                .select('id')
                .eq('room_id', roomId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existing) return existing;

            // Join the room
            const {data, error} = await (supabase as any)
                .from('chat_room_members')
                .insert({
                    room_id: roomId,
                    user_id: user.id,
                    role: 'member',
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chat-rooms']});
            queryClient.invalidateQueries({queryKey: ['chat-room-members']});
        },
        onError: (error: Error) => {
            console.error('Failed to join room:', error);
        },
    });
}

export function useRoomMembers(roomId: string) {
    const {data: members, isLoading} = useQuery({
        queryKey: ['chat-room-members', roomId],
        queryFn: async () => {
            const {data} = await (supabase as any)
                .from('chat_room_members')
                .select('*, profiles(*)')
                .eq('room_id', roomId);
            return data || [];
        },
        enabled: !!roomId,
    });
    return {members: members || [], isLoading};
}

export function useRoomMessages(roomId: string) {
    const {data: messages, isLoading} = useQuery({
        queryKey: ['chat-room-messages', roomId],
        queryFn: async () => {
            const {data} = await (supabase as any)
                .from('messages')
                .select('*, profiles(*)')
                .eq('room_id', roomId)
                .order('created_at', {ascending: false})
                .limit(100);
            return (data || []).reverse();
        },
        enabled: !!roomId,
    });
    return {messages: messages || [], isLoading};
}

export function useSendRoomMessage() {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({roomId, content}: {roomId: string; content: string}) => {
            if (!user) throw new Error('Not authenticated');
            const {data, error} = await (supabase as any)
                .from('messages')
                .insert({
                    room_id: roomId,
                    sender_id: user.id,
                    content,
                    type: 'text',
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, {roomId}) => {
            queryClient.invalidateQueries({queryKey: ['chat-room-messages', roomId]});
        },
    });
}

export function useRoomReaction() {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({messageId, emoji}: {messageId: string; emoji: string}) => {
            if (!user) throw new Error('Not authenticated');
            const {data, error} = await (supabase as any)
                .from('message_reactions')
                .upsert({
                    message_id: messageId,
                    user_id: user.id,
                    emoji,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chat-room-messages']});
        },
    });
}

export function useRoomTyping() {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({roomId, isTyping}: {roomId: string; isTyping: boolean}) => {
            if (!user) throw new Error('Not authenticated');
            const {data, error} = await (supabase as any)
                .from('typing_indicators')
                .upsert({
                    room_id: roomId,
                    user_id: user.id,
                    is_typing: isTyping,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
    });
}

export function useMessageSearch(roomId: string) {
    const [query, setQuery] = useState('');
    const {data: results, isLoading} = useQuery({
        queryKey: ['message-search', roomId, query],
        queryFn: async () => {
            if (!query.trim()) return [];
            const {data} = await (supabase as any)
                .from('messages')
                .select('*')
                .eq('room_id', roomId)
                .textSearch('content', query)
                .limit(50);
            return data || [];
        },
        enabled: !!roomId && query.length > 2,
    });
    return {results: results || [], isLoading, query, setQuery};
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (messageId: string) => {
            const {error} = await (supabase as any)
                .from('messages')
                .delete()
                .eq('id', messageId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chat-room-messages']});
        },
    });
}

export function useEditMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({messageId, content}: {messageId: string; content: string}) => {
            const {data, error} = await (supabase as any)
                .from('messages')
                .update({content, edited_at: new Date().toISOString()})
                .eq('id', messageId)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chat-room-messages']});
        },
    });
}

export function usePinMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({roomId, messageId}: {roomId: string; messageId: string}) => {
            const {data, error} = await (supabase as any)
                .from('pinned_messages')
                .upsert({
                    room_id: roomId,
                    message_id: messageId,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pinned-messages']});
        },
    });
}

export function usePinnedMessages(roomId: string) {
    const {data: pinnedMessages, isLoading} = useQuery({
        queryKey: ['pinned-messages', roomId],
        queryFn: async () => {
            const {data} = await (supabase as any)
                .from('pinned_messages')
                .select('*, messages(*)')
                .eq('room_id', roomId)
                .order('created_at', {ascending: false});
            return data || [];
        },
        enabled: !!roomId,
    });
    return {pinnedMessages: pinnedMessages || [], isLoading};
}
