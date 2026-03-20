/**
 * useChatRooms — manages rooms (direct / event / circle / meetup)
 * Uses `supabase as any` because new tables are pending migration approval.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useRef} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

const db = supabase as any;

// ── Types ─────────────────────────────────────────────────────

export type RoomType = 'direct' | 'event' | 'circle' | 'meetup';
export type MsgType = 'text' | 'image' | 'voice' | 'video' | 'file' | 'booking_request' | 'system' | 'scheduled';

export interface ChatRoom {
    id: string;
    type: RoomType;
    name: string | null;
    description: string | null;
    avatar_url: string | null;
    event_id: string | null;
    created_by: string;
    is_private: boolean;
    is_archived: boolean;
    slow_mode_secs: number;
    max_members: number;
    last_message_at: string;
    created_at: string;
    members?: RoomMember[];
    last_message?: ChatMessage | null;
    unread_count?: number;
    my_role?: string;
}

export interface RoomMember {
    id: string;
    room_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'moderator' | 'member';
    is_muted: boolean;
    is_banned: boolean;
    last_read_at: string;
    joined_at: string;
    profile?: {
        display_name: string;
        avatar_url: string | null;
        is_online: boolean;
    };
}

export interface ChatMessage {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    msg_type: MsgType;
    media_url: string | null;
    media_meta: Record<string, unknown>;
    reply_to_id: string | null;
    reply_to?: ChatMessage | null;
    is_edited: boolean;
    is_deleted: boolean;
    is_pinned: boolean;
    disappears_at: string | null;
    scheduled_at: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    sender?: {
        display_name: string;
        avatar_url: string | null;
    };
    reactions?: ReactionSummary[];
    read_by?: string[];
}

export interface ReactionSummary {
    emoji: string;
    count: number;
    has_mine: boolean;
}

// ── All rooms the current user belongs to ─────────────────────

export const useMyRooms = (type?: RoomType) => {
    const {user} = useAuth();
    const qc = useQueryClient();

    const {data: rooms, isLoading} = useQuery({
        queryKey: ['chat-rooms', user?.id, type],
        queryFn: async () => {
            if (!user) return [];
            try {
                let q = db
                    .from('chat_rooms')
                    .select('*, room_members!inner(user_id, role, is_muted, is_banned, last_read_at)')
                    .eq('room_members.user_id', user.id)
                    .eq('room_members.is_banned', false)
                    .eq('is_archived', false)
                    .order('last_message_at', {ascending: false});
                if (type) q = q.eq('type', type);
                const {data, error} = await q;
                if (error) return [];

                const enriched = await Promise.all(
                    (data || []).map(async (room: any) => {
                        const myMembership = room.room_members?.[0];
                        const [lastMsgRes, unreadRes] = await Promise.all([
                            db.from('chat_messages')
                                .select('id, content, msg_type, sender_id, created_at, is_deleted')
                                .eq('room_id', room.id).eq('is_deleted', false)
                                .order('created_at', {ascending: false}).limit(1).single(),
                            db.from('chat_messages')
                                .select('id', {count: 'exact', head: true})
                                .eq('room_id', room.id).eq('is_deleted', false)
                                .gt('created_at', myMembership?.last_read_at || room.created_at),
                        ]);
                        return {
                            ...room,
                            last_message: lastMsgRes.data ?? null,
                            unread_count: unreadRes.count ?? 0,
                            my_role: myMembership?.role ?? 'member',
                        } as ChatRoom;
                    })
                );
                return enriched;
            } catch {
                return [];
            }
        },
        enabled: !!user,
    });

    useEffect(() => {
        if (!user) return;
        const ch = (supabase as any)
            .channel(`rooms-list-${user.id}`)
            .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'chat_messages'},
                () => qc.invalidateQueries({queryKey: ['chat-rooms', user.id]}))
            .on('postgres_changes', {
                    event: '*', schema: 'public', table: 'room_members',
                    filter: `user_id=eq.${user.id}`
                },
                () => qc.invalidateQueries({queryKey: ['chat-rooms', user.id]}))
            .subscribe();
        return () => {
            supabase.removeChannel(ch);
        };
    }, [user, qc]);

    return {rooms: rooms ?? [], isLoading};
};

// ── Single room detail ─────────────────────────────────────────

export const useChatRoom = (roomId: string | undefined) => {
    const {user} = useAuth();
    return useQuery({
        queryKey: ['chat-room', roomId],
        queryFn: async () => {
            if (!roomId) return null;
            try {
                const {data, error} = await db.from('chat_rooms').select('*').eq('id', roomId).single();
                if (error) return null;
                return data as ChatRoom;
            } catch {
                return null;
            }
        },
        enabled: !!roomId && !!user,
    });
};

// ── Messages for a room with realtime ─────────────────────────

export const useRoomMessages = (roomId: string | undefined, limit = 60) => {
    const {user} = useAuth();
    const qc = useQueryClient();

    const {data: messages, isLoading} = useQuery({
        queryKey: ['room-messages', roomId],
        queryFn: async () => {
            if (!roomId) return [];
            try {
                const {data, error} = await db
                    .from('chat_messages')
                    .select('*, sender:profiles(display_name, avatar_url), reply_to:chat_messages(id, content, sender_id, msg_type)')
                    .eq('room_id', roomId).eq('is_deleted', false)
                    .order('created_at', {ascending: true}).limit(limit);
                if (error) return [];
                return (data || []) as ChatMessage[];
            } catch {
                return [];
            }
        },
        enabled: !!roomId && !!user,
    });

    // Mark read
    useEffect(() => {
        if (!roomId || !user) return;
        db.from('room_members')
            .update({last_read_at: new Date().toISOString()})
            .eq('room_id', roomId).eq('user_id', user.id).then();
    }, [roomId, user, messages?.length]);

    // Realtime
    useEffect(() => {
        if (!roomId) return;
        const ch = (supabase as any)
            .channel(`msgs-room-${roomId}`)
            .on('postgres_changes',
                {event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}`},
                async (payload: any) => {
                    const msg = payload.new as ChatMessage;
                    const {data: profile} = await (supabase as any)
                        .from('profiles').select('display_name, avatar_url').eq('user_id', msg.sender_id).single();
                    qc.setQueryData(['room-messages', roomId], (old: ChatMessage[] | undefined) =>
                        [...(old || []), {...msg, sender: profile ?? undefined}]
                    );
                    if (msg.sender_id === user?.id || !document.hidden) {
                        db.from('room_members').update({last_read_at: new Date().toISOString()})
                            .eq('room_id', roomId).eq('user_id', user?.id ?? '').then();
                    }
                })
            .on('postgres_changes',
                {event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}`},
                (payload: any) => {
                    qc.setQueryData(['room-messages', roomId], (old: ChatMessage[] | undefined) =>
                        (old || []).map(m => m.id === payload.new.id ? {...m, ...payload.new} : m)
                    );
                })
            .subscribe();
        return () => {
            supabase.removeChannel(ch);
        };
    }, [roomId, user, qc]);

    return {messages: messages ?? [], isLoading};
};

// ── Pinned messages ────────────────────────────────────────────

export const usePinnedMessages = (roomId: string | undefined) => {
    const {user} = useAuth();
    return useQuery({
        queryKey: ['pinned-messages', roomId],
        queryFn: async () => {
            if (!roomId) return [];
            try {
                const {data} = await db.from('chat_messages')
                    .select('id, content, sender_id, created_at, msg_type, media_url')
                    .eq('room_id', roomId).eq('is_pinned', true).eq('is_deleted', false)
                    .order('created_at', {ascending: false});
                return data ?? [];
            } catch {
                return [];
            }
        },
        enabled: !!roomId && !!user,
    });
};

// ── Room members ───────────────────────────────────────────────

export const useRoomMembers = (roomId: string | undefined) => {
    const {user} = useAuth();
    return useQuery({
        queryKey: ['room-members', roomId],
        queryFn: async () => {
            if (!roomId) return [];
            try {
                const {data, error} = await db.from('room_members')
                    .select('*, profile:profiles(display_name, avatar_url, is_online)')
                    .eq('room_id', roomId).eq('is_banned', false);
                if (error) return [];
                return (data || []) as RoomMember[];
            } catch {
                return [];
            }
        },
        enabled: !!roomId && !!user,
    });
};

// ── Create a room ──────────────────────────────────────────────

export const useCreateRoom = () => {
    const {user} = useAuth();
    const qc = useQueryClient();
    const {toast} = useToast();

    return useMutation({
        mutationFn: async ({
                               type, name, description, isPrivate = false, eventId, memberIds = [],
                           }: {
            type: RoomType; name?: string; description?: string;
            isPrivate?: boolean; eventId?: string; memberIds?: string[];
        }) => {
            if (!user) throw new Error('Not authenticated');
            const {data: room, error} = await db.from('chat_rooms')
                .insert({type, name, description, is_private: isPrivate, event_id: eventId, created_by: user.id})
                .select().single();
            if (error) throw error;
            const allMembers = [...new Set([user.id, ...memberIds])];
            await db.from('room_members').insert(
                allMembers.map((uid: string) => ({
                    room_id: room.id, user_id: uid, role: uid === user.id ? 'owner' : 'member',
                }))
            );
            return room;
        },
        onSuccess: () => qc.invalidateQueries({queryKey: ['chat-rooms']}),
        onError: (e: Error) => toast({title: 'Failed', description: e.message, variant: 'destructive'}),
    });
};

// ── Send a message ─────────────────────────────────────────────

export const useSendRoomMessage = () => {
    const {user} = useAuth();
    const {toast} = useToast();

    return useMutation({
        mutationFn: async ({
                               roomId, content, msgType = 'text', mediaUrl, replyToId, scheduledAt, disappearsIn,
                           }: {
            roomId: string; content: string; msgType?: MsgType;
            mediaUrl?: string; replyToId?: string; scheduledAt?: Date; disappearsIn?: number;
        }) => {
            if (!user) throw new Error('Not authenticated');
            const {data, error} = await db.from('chat_messages').insert({
                room_id: roomId, sender_id: user.id, content,
                msg_type: msgType, media_url: mediaUrl, reply_to_id: replyToId,
                scheduled_at: scheduledAt?.toISOString(),
                disappears_at: disappearsIn ? new Date(Date.now() + disappearsIn * 1000).toISOString() : null,
            }).select().single();
            if (error) throw error;
            return data;
        },
        onError: (e: Error) => toast({title: 'Send failed', description: e.message, variant: 'destructive'}),
    });
};

// ── Edit message ───────────────────────────────────────────────

export const useEditMessage = () => {
    const {user} = useAuth();
    return useMutation({
        mutationFn: async ({messageId, content}: { messageId: string; content: string }) => {
            if (!user) throw new Error('Not authenticated');
            const {error} = await db.from('chat_messages')
                .update({content, is_edited: true}).eq('id', messageId).eq('sender_id', user.id);
            if (error) throw error;
        },
    });
};

// ── Delete message ─────────────────────────────────────────────

export const useDeleteMessage = () => {
    const {user} = useAuth();
    return useMutation({
        mutationFn: async (messageId: string) => {
            if (!user) throw new Error('Not authenticated');
            const {error} = await db.from('chat_messages')
                .update({is_deleted: true, content: ''}).eq('id', messageId).eq('sender_id', user.id);
            if (error) throw error;
        },
    });
};

// ── Pin / unpin message ────────────────────────────────────────

export const usePinMessage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({messageId, pin, roomId}: { messageId: string; pin: boolean; roomId: string }) => {
            const {error} = await db.from('chat_messages').update({is_pinned: pin}).eq('id', messageId);
            if (error) throw error;
            qc.invalidateQueries({queryKey: ['pinned-messages', roomId]});
        },
    });
};

// ── Reactions (v2 table) ───────────────────────────────────────

export const useRoomReaction = (messageId: string) => {
    const {user} = useAuth();
    const qc = useQueryClient();

    const toggle = useCallback(async (emoji: string) => {
        if (!user) return;
        try {
            const {data: existing} = await db.from('message_reactions_v2')
                .select('id').eq('message_id', messageId).eq('user_id', user.id).eq('emoji', emoji).maybeSingle();
            if (existing) {
                await db.from('message_reactions_v2').delete().eq('id', existing.id);
            } else {
                await db.from('message_reactions_v2').insert({message_id: messageId, user_id: user.id, emoji});
            }
            qc.invalidateQueries({queryKey: ['room-reactions', messageId]});
        } catch { /* ignore */
        }
    }, [user, messageId, qc]);

    const {data: rawReactions} = useQuery({
        queryKey: ['room-reactions', messageId],
        queryFn: async () => {
            try {
                const {data} = await db.from('message_reactions_v2')
                    .select('emoji, user_id').eq('message_id', messageId);
                return (data ?? []) as { emoji: string; user_id: string }[];
            } catch {
                return [];
            }
        },
    });

    const reactions = (rawReactions ?? []).reduce<ReactionSummary[]>((acc, r) => {
        const ex = acc.find(s => s.emoji === r.emoji);
        if (ex) {
            ex.count++;
            if (r.user_id === user?.id) ex.has_mine = true;
        } else acc.push({emoji: r.emoji, count: 1, has_mine: r.user_id === user?.id});
        return acc;
    }, []);

    return {reactions, toggle};
};

// ── Message search ─────────────────────────────────────────────

export const useMessageSearch = (roomId: string, query: string) => {
    return useQuery({
        queryKey: ['msg-search', roomId, query],
        queryFn: async () => {
            if (!query || query.length < 2) return [];
            try {
                const {data} = await db.from('chat_messages')
                    .select('id, content, sender_id, created_at, msg_type')
                    .eq('room_id', roomId).ilike('content', `%${query}%`).eq('is_deleted', false)
                    .order('created_at', {ascending: false}).limit(30);
                return data ?? [];
            } catch {
                return [];
            }
        },
        enabled: query.length >= 2,
    });
};

// ── Find or create DM room ─────────────────────────────────────

export const useDirectRoom = () => {
    const {user} = useAuth();
    const createRoom = useCreateRoom();

    return useMutation({
        mutationFn: async (otherUserId: string) => {
            if (!user) throw new Error('Not authenticated');
            try {
                const {data: existing} = await db.from('chat_rooms')
                    .select('id, room_members!inner(user_id)')
                    .eq('type', 'direct').eq('room_members.user_id', user.id);
                if (existing) {
                    for (const room of existing as any[]) {
                        const {data: hasOther} = await db.from('room_members')
                            .select('id').eq('room_id', room.id).eq('user_id', otherUserId).maybeSingle();
                        if (hasOther) return room;
                    }
                }
            } catch { /* no existing */
            }
            return createRoom.mutateAsync({type: 'direct', isPrivate: true, memberIds: [otherUserId]});
        },
    });
};

// ── Typing presence ────────────────────────────────────────────

export const useRoomTyping = (roomId: string | undefined) => {
    const {user} = useAuth();
    const channelRef = useRef<any>(null);

    const setTyping = useCallback(async (typing: boolean) => {
        if (!roomId || !user) return;
        try {
            if (!channelRef.current) {
                channelRef.current = supabase.channel(`typing-${roomId}`);
                await channelRef.current.subscribe();
            }
            await channelRef.current.track({user_id: user.id, typing, ts: Date.now()});
        } catch { /* ignore */
        }
    }, [roomId, user]);

    const getTypingUsers = useCallback((): string[] => {
        if (!channelRef.current) return [];
        const state = channelRef.current.presenceState() as Record<string, any[]>;
        return Object.values(state).flat()
            .filter((p: any) => p.typing && p.user_id !== user?.id)
            .map((p: any) => p.user_id);
    }, [user]);

    useEffect(() => {
        if (!roomId || !user) return;
        const ch = supabase.channel(`typing-${roomId}`);
        channelRef.current = ch;
        ch.subscribe();
        return () => {
            supabase.removeChannel(ch);
            channelRef.current = null;
        };
    }, [roomId, user]);

    return {setTyping, getTypingUsers};
};

// ── Join a room ────────────────────────────────────────────────

export const useJoinRoom = () => {
    const {user} = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (roomId: string) => {
            if (!user) throw new Error('Not authenticated');
            const {error} = await db.from('room_members')
                .insert({room_id: roomId, user_id: user.id, role: 'member'});
            if (error && error.code !== '23505') throw error;
        },
        onSuccess: () => qc.invalidateQueries({queryKey: ['chat-rooms']}),
    });
};

// ── Leave a room ───────────────────────────────────────────────

export const useLeaveRoom = () => {
    const {user} = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (roomId: string) => {
            if (!user) throw new Error('Not authenticated');
            await db.from('room_members').delete().eq('room_id', roomId).eq('user_id', user.id);
        },
        onSuccess: () => qc.invalidateQueries({queryKey: ['chat-rooms']}),
    });
};
