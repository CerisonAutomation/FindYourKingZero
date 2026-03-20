import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';

export interface ProfileWithDetails {
    id: string;
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    age: number | null;
    city: string | null;
    country: string | null;
    height: number | null;
    weight: number | null;
    hourly_rate: number | null;
    is_online: boolean | null;
    is_verified: boolean | null;
    is_available_now: boolean | null;
    last_seen: string | null;
    tribes: string[] | null;
    interests: string[] | null;
    looking_for: string[] | null;
    latitude: number | null;
    longitude: number | null;
    views_count: number | null;
    favorites_count: number | null;
    rating: number | null;
    age_verified: boolean | null;
    photo_verified: boolean | null;
    id_verified: boolean | null;
    phone_verified: boolean | null;
    created_at: string | null;
    is_premium?: boolean | null;
    position?: string | null;
    ethnicity?: string | null;
    relationship_status?: string | null;
}

export interface ProfileFilters {
    minAge?: number;
    maxAge?: number;
    tribes?: string[];
    lookingFor?: string[];
    isOnline?: boolean;
    isVerified?: boolean;
    hasPhotos?: boolean;
    maxDistance?: number;
    search?: string;
}

export const useProfiles = (filters?: ProfileFilters) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Real-time subscription — invalidate on any profile change
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('profiles-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'profiles'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['profiles']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return useQuery({
        queryKey: ['profiles', filters, user?.id],
        queryFn: async () => {
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('user_id', user?.id || '')
                .order('is_online', {ascending: false})
                .order('last_seen', {ascending: false, nullsFirst: false})
                .limit(100);

            if (filters?.minAge) query = query.gte('age', filters.minAge);
            if (filters?.maxAge) query = query.lte('age', filters.maxAge);
            if (filters?.isOnline) query = query.eq('is_online', true);
            if (filters?.isVerified) query = query.eq('is_verified', true);
            if (filters?.search) {
                query = query.or(
                    `display_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
                );
            }

            const {data, error} = await query;
            if (error) throw error;

            let profiles = (data || []) as ProfileWithDetails[];

            // Client-side array filters
            if (filters?.tribes && filters.tribes.length > 0) {
                profiles = profiles.filter(p =>
                    p.tribes?.some(t => filters.tribes?.includes(t))
                );
            }
            if (filters?.lookingFor && filters.lookingFor.length > 0) {
                profiles = profiles.filter(p =>
                    p.looking_for?.some(l => filters.lookingFor?.includes(l))
                );
            }
            if (filters?.isOnline) {
                profiles = profiles.filter(p => p.is_online);
            }
            if (filters?.isVerified) {
                profiles = profiles.filter(p => p.is_verified);
            }
            if (filters?.hasPhotos) {
                profiles = profiles.filter(p => !!p.avatar_url);
            }
            if (filters?.search) {
                const s = filters.search.toLowerCase();
                profiles = profiles.filter(p =>
                    p.display_name?.toLowerCase().includes(s) ||
                    p.bio?.toLowerCase().includes(s) ||
                    p.city?.toLowerCase().includes(s)
                );
            }

            return profiles;
        },
        enabled: !!user,
        staleTime: 30000,
    });
};

export const useProfileById = (userId: string | null) => {
    const queryClient = useQueryClient();

    // Real-time subscription for this specific profile
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`profile-${userId}-realtime`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['profile', userId]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient]);

    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;

            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data as ProfileWithDetails;
        },
        enabled: !!userId,
    });
};
