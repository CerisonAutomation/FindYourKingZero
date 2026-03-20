import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useEffect} from 'react';

export interface Reaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
}

export const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '👑', '💋'];

export const useReactions = (messageId: string) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {data: reactions = [], isLoading} = useQuery({
        queryKey: ['reactions', messageId],
        queryFn: async () => {
            const {data, error} = await supabase
                .from('message_reactions')
                .select('*')
                .eq('message_id', messageId);

            if (error) throw error;
            return data as Reaction[];
        },
        enabled: !!messageId,
    });

    // Subscribe to realtime reactions
    useEffect(() => {
        if (!messageId) return;

        const channel = supabase
            .channel(`reactions-${messageId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'message_reactions',
                    filter: `message_id=eq.${messageId}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['reactions', messageId]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [messageId, queryClient]);

    const addReaction = useMutation({
        mutationFn: async (emoji: string) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('message_reactions')
                .insert({
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
            queryClient.invalidateQueries({queryKey: ['reactions', messageId]});
        },
    });

    const removeReaction = useMutation({
        mutationFn: async (emoji: string) => {
            if (!user) throw new Error('Not authenticated');

            const {error} = await supabase
                .from('message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', user.id)
                .eq('emoji', emoji);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['reactions', messageId]});
        },
    });

    const toggleReaction = async (emoji: string) => {
        const existingReaction = reactions.find(
            (r) => r.user_id === user?.id && r.emoji === emoji
        );

        if (existingReaction) {
            await removeReaction.mutateAsync(emoji);
        } else {
            await addReaction.mutateAsync(emoji);
        }
    };

    const getReactionCount = (emoji: string) => {
        return reactions.filter((r) => r.emoji === emoji).length;
    };

    const hasUserReacted = (emoji: string) => {
        return reactions.some((r) => r.user_id === user?.id && r.emoji === emoji);
    };

    return {
        reactions,
        isLoading,
        toggleReaction,
        getReactionCount,
        hasUserReacted,
        isToggling: addReaction.isPending || removeReaction.isPending,
    };
};
