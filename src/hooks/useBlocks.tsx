import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export interface Block {
    id: string;
    blocker_id: string;
    blocked_id: string;
    created_at: string;
}

export const useBlocks = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    const {data: blocks = [], isLoading} = useQuery({
        queryKey: ['blocks', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('blocks')
                .select('*')
                .eq('blocker_id', user.id);

            if (error) throw error;
            return data as Block[];
        },
        enabled: !!user,
    });

    const blockUser = useMutation({
        mutationFn: async (blockedId: string) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('blocks')
                .insert({
                    blocker_id: user.id,
                    blocked_id: blockedId,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['blocks']});
            queryClient.invalidateQueries({queryKey: ['profiles']});
            toast({
                title: 'User blocked',
                description: 'You will no longer see this user.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const unblockUser = useMutation({
        mutationFn: async (blockedId: string) => {
            if (!user) throw new Error('Not authenticated');

            const {error} = await supabase
                .from('blocks')
                .delete()
                .eq('blocker_id', user.id)
                .eq('blocked_id', blockedId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['blocks']});
            queryClient.invalidateQueries({queryKey: ['profiles']});
            toast({
                title: 'User unblocked',
                description: 'You can now see this user again.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const isBlocked = (userId: string) => {
        return blocks.some((block) => block.blocked_id === userId);
    };

    return {
        blocks,
        isLoading,
        blockUser: blockUser.mutate,
        unblockUser: unblockUser.mutate,
        isBlocked,
        isBlocking: blockUser.isPending,
        isUnblocking: unblockUser.isPending,
    };
};
