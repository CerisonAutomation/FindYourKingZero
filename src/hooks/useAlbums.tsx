import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export interface Album {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    cover_url: string | null;
    is_private: boolean;
    created_at: string;
    updated_at: string;
    photos?: AlbumPhoto[];
}

export interface AlbumPhoto {
    id: string;
    album_id: string;
    user_id: string;
    url: string;
    caption: string | null;
    order_index: number;
    created_at: string;
}

export const useAlbums = (userId?: string) => {
    const {user} = useAuth();
    const targetUserId = userId || user?.id;

    return useQuery({
        queryKey: ['albums', targetUserId],
        queryFn: async () => {
            if (!targetUserId) return [];

            const {data, error} = await supabase
                .from('albums')
                .select(`
          *,
          photos:album_photos(*)
        `)
                .eq('user_id', targetUserId)
                .order('created_at', {ascending: false});

            if (error) throw error;
            return data as Album[];
        },
        enabled: !!targetUserId,
    });
};

export const useAlbum = (albumId: string) => {
    return useQuery({
        queryKey: ['album', albumId],
        queryFn: async () => {
            const {data, error} = await supabase
                .from('albums')
                .select(`
          *,
          photos:album_photos(*)
        `)
                .eq('id', albumId)
                .single();

            if (error) throw error;
            return data as Album;
        },
        enabled: !!albumId,
    });
};

export const useCreateAlbum = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (album: { name: string; description?: string; is_private?: boolean }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('albums')
                .insert({
                    user_id: user.id,
                    name: album.name,
                    description: album.description,
                    is_private: album.is_private ?? false,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['albums']});
            toast({
                title: 'Album created',
                description: 'Your new album is ready for photos!',
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

export const useAddPhotoToAlbum = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({albumId, file, caption}: { albumId: string; file: File; caption?: string }) => {
            if (!user) throw new Error('Not authenticated');

            // Upload photo to storage
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/albums/${albumId}/${Date.now()}.${fileExt}`;

            const {error: uploadError} = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const {data: {publicUrl}} = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Add photo record
            const {data, error} = await supabase
                .from('album_photos')
                .insert({
                    album_id: albumId,
                    user_id: user.id,
                    url: publicUrl,
                    caption,
                })
                .select()
                .single();

            if (error) throw error;

            // Update album cover if first photo
            const {data: album} = await supabase
                .from('albums')
                .select('cover_url')
                .eq('id', albumId)
                .single();

            if (!album?.cover_url) {
                await supabase
                    .from('albums')
                    .update({cover_url: publicUrl})
                    .eq('id', albumId);
            }

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({queryKey: ['album', variables.albumId]});
            queryClient.invalidateQueries({queryKey: ['albums']});
            toast({
                title: 'Photo added',
                description: 'Your photo has been added to the album!',
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

export const useDeleteAlbum = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (albumId: string) => {
            const {error} = await supabase
                .from('albums')
                .delete()
                .eq('id', albumId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['albums']});
            toast({
                title: 'Album deleted',
                description: 'Your album has been removed.',
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
