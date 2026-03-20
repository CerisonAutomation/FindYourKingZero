import {useEffect, useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';

interface PresenceState {
    [key: string]: {
        user_id: string;
        online_at: string;
        typing?: boolean;
    }[];
}

export const usePresence = (channelName?: string) => {
    const {user} = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    const effectiveChannel = channelName || 'global-presence';

    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel(effectiveChannel);

        channel
            .on('presence', {event: 'sync'}, () => {
                const state = channel.presenceState() as PresenceState;
                const users = Object.values(state)
                    .flat()
                    .filter((u) => u.user_id !== user.id);

                setOnlineUsers(users.map((u) => u.user_id));
                setTypingUsers(users.filter((u) => u.typing).map((u) => u.user_id));
            })
            .on('presence', {event: 'join'}, ({newPresences}) => {
                const newUserIds = newPresences
                    .filter((p: any) => p.user_id !== user.id)
                    .map((p: any) => p.user_id);

                setOnlineUsers((prev) => [...new Set([...prev, ...newUserIds])]);
            })
            .on('presence', {event: 'leave'}, ({leftPresences}) => {
                const leftUserIds = leftPresences.map((p: any) => p.user_id);
                setOnlineUsers((prev) => prev.filter((id) => !leftUserIds.includes(id)));
                setTypingUsers((prev) => prev.filter((id) => !leftUserIds.includes(id)));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        // Update profile online status
        supabase
            .from('profiles')
            .update({is_online: true, last_seen: new Date().toISOString()})
            .eq('user_id', user.id)
            .then();

        // Handle page visibility changes
        const handleVisibility = () => {
            if (document.hidden) {
                supabase
                    .from('profiles')
                    .update({is_online: false, last_seen: new Date().toISOString()})
                    .eq('user_id', user.id)
                    .then();
            } else {
                supabase
                    .from('profiles')
                    .update({is_online: true, last_seen: new Date().toISOString()})
                    .eq('user_id', user.id)
                    .then();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            supabase.removeChannel(channel);
        };
    }, [user, effectiveChannel]);

    const setTyping = async (isTyping: boolean) => {
        if (!user) return;

        const channel = supabase.channel(effectiveChannel);
        await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            typing: isTyping,
        });
    };

    return {
        onlineUsers,
        typingUsers,
        setTyping,
        isUserOnline: (userId: string) => onlineUsers.includes(userId),
        isUserTyping: (userId: string) => typingUsers.includes(userId),
    };
};

export const useGlobalPresence = () => {
    return usePresence('global-presence');
};

export const useConversationPresence = (conversationId: string) => {
    return usePresence(`conversation-${conversationId}`);
};
