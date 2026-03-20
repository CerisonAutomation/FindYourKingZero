import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export interface Profile {
    id: string;
    user_id: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    age: number | null;
    date_of_birth: string | null;
    height: number | null;
    weight: number | null;
    city: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    tribes: string[];
    interests: string[];
    looking_for: string[];
    is_verified: boolean;
    is_online: boolean;
    last_seen: string;
    hourly_rate: number | null;
    is_available_now: boolean;
    views_count: number;
    favorites_count: number;
    rating: number;
    created_at: string;
    updated_at: string;
    // Verification fields
    age_verified: boolean;
    age_verified_at: string | null;
    photo_verified: boolean;
    photo_verified_at: string | null;
    id_verified: boolean;
    id_verified_at: string | null;
    phone_verified: boolean;
    phone_verified_at: string | null;
    // GDPR fields
    gdpr_consent_date: string | null;
    data_processing_consent: boolean;
    marketing_consent: boolean;
    account_deletion_requested_at: string | null;
}

export const useProfile = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    // Real-time subscription for own profile
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`own-profile-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['profile', user.id]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    const {data: profile, isLoading, error} = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) return null;

            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return data as Profile;
        },
        enabled: !!user,
    });

    return {profile, isLoading, error};
};

export const useUpdateProfile = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: Partial<Profile>) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('profiles')
                .update(updates)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['profile', user?.id]});
            toast({
                title: 'Profile updated',
                description: 'Your profile has been saved successfully.',
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

export const useProfiles = (filters?: {
    tribes?: string[];
    minAge?: number;
    maxAge?: number;
    isOnline?: boolean;
    isVerified?: boolean;
    city?: string;
}) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Real-time subscription for profile list changes
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('profiles-list-realtime')
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
        queryKey: ['profiles', filters],
        queryFn: async () => {
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('user_id', user?.id || '')
                .order('is_online', {ascending: false})
                .order('last_seen', {ascending: false});

            if (filters?.minAge) query = query.gte('age', filters.minAge);
            if (filters?.maxAge) query = query.lte('age', filters.maxAge);
            if (filters?.isOnline) query = query.eq('is_online', true);
            if (filters?.isVerified) query = query.eq('is_verified', true);
            if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
            if (filters?.tribes && filters.tribes.length > 0) {
                query = query.overlaps('tribes', filters.tribes);
            }

            const {data, error} = await query.limit(50);
            if (error) throw error;
            return data as Profile[];
        },
        enabled: !!user,
    });
};

export const useProfileById = (userId: string | undefined) => {
    const queryClient = useQueryClient();

    // Real-time subscription for specific profile
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`profile-view-${userId}`)
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
            return data as Profile;
        },
        enabled: !!userId,
    });
};
