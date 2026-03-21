import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export type ProfilePhoto =  {
    id: string;
    user_id: string;
    url: string;
    is_primary: boolean;
    order_index: number;
    created_at: string;
}

export const useProfilePhotos = (userId?: string) => {
    const {user} = useAuth();
    const targetUserId = userId || user?.id;

    return useQuery({
        queryKey: ['profile-photos', targetUserId],
        queryFn: async () => {
            if (!targetUserId) return [];

            const {data, error} = await supabase
                .from('profile_photos')
                .select('*')
                .eq('user_id', targetUserId)
                .order('order_index', {ascending: true});

            if (error) throw error;
            return data as ProfilePhoto[];
        },
        enabled: !!targetUserId,
    });
};

export const useAddProfilePhoto = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({file, isPrimary = false}: { file: File; isPrimary?: boolean }) => {
            if (!user) throw new Error('Not authenticated');

            // Upload photo
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/profile/${Date.now()}.${fileExt}`;

            const {error: uploadError} = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const {data: {publicUrl}} = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // If setting as primary, unset others first
            if (isPrimary) {
                await supabase
                    .from('profile_photos')
                    .update({is_primary: false})
                    .eq('user_id', user.id);
            }

            // Get current max order
            const {data: existing} = await supabase
                .from('profile_photos')
                .select('order_index')
                .eq('user_id', user.id)
                .order('order_index', {ascending: false})
                .limit(1);

            const nextOrder = existing?.[0]?.order_index ? existing[0].order_index + 1 : 0;

            const {data, error} = await supabase
                .from('profile_photos')
                .insert({
                    user_id: user.id,
                    url: publicUrl,
                    is_primary: isPrimary,
                    order_index: nextOrder,
                })
                .select()
                .single();

            if (error) throw error;

            // Update profile avatar_url if primary
            if (isPrimary) {
                await supabase
                    .from('profiles')
                    .update({avatar_url: publicUrl})
                    .eq('user_id', user.id);
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile-photos']});
            queryClient.invalidateQueries({queryKey: ['profile']});
            toast({
                title: 'Photo added',
                description: 'Your profile photo has been uploaded!',
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
};

export const useSetPrimaryPhoto = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (photoId: string) => {
            if (!user) throw new Error('Not authenticated');

            // Unset all as primary
            await supabase
                .from('profile_photos')
                .update({is_primary: false})
                .eq('user_id', user.id);

            // Set the selected one as primary
            const {data, error} = await supabase
                .from('profile_photos')
                .update({is_primary: true})
                .eq('id', photoId)
                .select()
                .single();

            if (error) throw error;

            // Update profile avatar
            await supabase
                .from('profiles')
                .update({avatar_url: data.url})
                .eq('user_id', user.id);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile-photos']});
            queryClient.invalidateQueries({queryKey: ['profile']});
            toast({
                title: 'Primary photo updated',
                description: 'Your main profile photo has been changed!',
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
};

export const useDeleteProfilePhoto = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (photoId: string) => {
            const {error} = await supabase
                .from('profile_photos')
                .delete()
                .eq('id', photoId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile-photos']});
            toast({
                title: 'Photo deleted',
                description: 'Your photo has been removed.',
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
};

export const useReorderPhotos = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (photoIds: string[]) => {
            if (!user) throw new Error('Not authenticated');

            const updates = photoIds.map((id, index) =>
                supabase
                    .from('profile_photos')
                    .update({order_index: index})
                    .eq('id', id)
            );

            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile-photos']});
        },
    });
};

// Alias exports for backward compatibility
export const useUploadPhoto = useAddProfilePhoto;
