import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';
import {useEffect} from 'react';

export interface MeetNowUser {
    id: string;
    user_id: string;
    latitude: number;
    longitude: number;
    status: string;
    message: string | null;
    expires_at: string;
    created_at: string;
    profile?: {
        display_name: string;
        avatar_url: string;
        age: number;
        is_verified: boolean;
        is_online: boolean;
    };
    distance?: number;
}

export const MEET_NOW_STATUSES = [
    {id: 'available', label: 'Available', icon: '🟢', color: 'bg-green-500'},
    {id: 'looking', label: 'Looking', icon: '👀', color: 'bg-blue-500'},
    {id: 'busy', label: 'Busy', icon: '🔴', color: 'bg-red-500'},
];

// Calculate distance between two coordinates in km
const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const useMeetNowUsers = (userLocation?: { lat: number; lng: number }) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Set up real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('meet-now-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'meet_now'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['meet-now']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return useQuery({
        queryKey: ['meet-now', userLocation?.lat, userLocation?.lng],
        queryFn: async () => {
            const {data: meetNowUsers, error} = await supabase
                .from('meet_now')
                .select('*')
                .gt('expires_at', new Date().toISOString());

            if (error) throw error;

            const enrichedUsers = await Promise.all(
                (meetNowUsers || []).map(async (meetUser) => {
                    const {data: profile} = await supabase
                        .from('profiles')
                        .select('display_name, avatar_url, age, is_verified, is_online')
                        .eq('user_id', meetUser.user_id)
                        .single();

                    let distance: number | undefined;
                    if (userLocation) {
                        distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            meetUser.latitude,
                            meetUser.longitude
                        );
                    }

                    return {
                        ...meetUser,
                        profile,
                        distance,
                    } as MeetNowUser;
                })
            );

            // Sort by distance if available
            if (userLocation) {
                enrichedUsers.sort((a, b) => (a.distance || 999) - (b.distance || 999));
            }

            // Filter out current user
            return enrichedUsers.filter((u) => u.user_id !== user?.id);
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useMyMeetNowStatus = () => {
    const {user} = useAuth();

    return useQuery({
        queryKey: ['my-meet-now', user?.id],
        queryFn: async () => {
            if (!user) return null;

            const {data, error} = await supabase
                .from('meet_now')
                .select('*')
                .eq('user_id', user.id)
                .gt('expires_at', new Date().toISOString())
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
};

export const useShareLocation = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               latitude,
                               longitude,
                               status,
                               message,
                               durationHours = 1,
                           }: {
            latitude: number;
            longitude: number;
            status: string;
            message?: string;
            durationHours?: number;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + durationHours);

            // Use upsert since user_id is unique
            const {data, error} = await supabase
                .from('meet_now')
                .upsert(
                    {
                        user_id: user.id,
                        latitude,
                        longitude,
                        status,
                        message,
                        expires_at: expiresAt.toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    {onConflict: 'user_id'}
                )
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['meet-now']});
            queryClient.invalidateQueries({queryKey: ['my-meet-now']});
            toast({
                title: "You're on the map! 📍",
                description: 'Others can now see your location.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to share location',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

export const useStopSharing = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');

            const {error} = await supabase.from('meet_now').delete().eq('user_id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['meet-now']});
            queryClient.invalidateQueries({queryKey: ['my-meet-now']});
            toast({
                title: 'Location hidden',
                description: "You're no longer visible on the map.",
            });
        },
    });
};
