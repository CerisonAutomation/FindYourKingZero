import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';
import {useEffect} from 'react';

export interface Party {
    id: string;
    host_id: string;
    title: string;
    description: string | null;
    party_type: string;
    location: string;
    latitude: number;
    longitude: number;
    start_time: string;
    end_time: string | null;
    max_guests: number;
    dress_code: string | null;
    is_active: boolean;
    cover_image: string | null;
    created_at: string;
    host?: {
        display_name: string;
        avatar_url: string;
        is_verified: boolean;
    };
    rsvp_count?: number;
    my_rsvp_status?: string | null;
}

export const PARTY_TYPES = [
    {id: 'private', label: 'Private', icon: '🔒', description: 'Invite only'},
    {id: 'semi-private', label: 'Semi-Private', icon: '🔑', description: 'Request to join'},
    {id: 'open', label: 'Open', icon: '🚪', description: 'Anyone can join'},
];

export const useParties = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    // Set up real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('parties-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'parties'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['parties']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return useQuery({
        queryKey: ['parties', user?.id],
        queryFn: async () => {
            const {data: parties, error} = await supabase
                .from('parties')
                .select('*')
                .eq('is_active', true)
                .gte('start_time', new Date().toISOString())
                .order('start_time', {ascending: true});

            if (error) throw error;

            const enrichedParties = await Promise.all(
                (parties || []).map(async (party) => {
                    const [hostResult, rsvpCountResult, myRsvpResult] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('display_name, avatar_url, is_verified')
                            .eq('user_id', party.host_id)
                            .single(),
                        supabase
                            .from('party_rsvps')
                            .select('id', {count: 'exact'})
                            .eq('party_id', party.id)
                            .eq('status', 'approved'),
                        user
                            ? supabase
                                .from('party_rsvps')
                                .select('status')
                                .eq('party_id', party.id)
                                .eq('user_id', user.id)
                                .maybeSingle()
                            : Promise.resolve({data: null}),
                    ]);

                    return {
                        ...party,
                        host: hostResult.data,
                        rsvp_count: rsvpCountResult.count || 0,
                        my_rsvp_status: myRsvpResult.data?.status || null,
                    } as Party;
                })
            );

            return enrichedParties;
        },
    });
};

export const useCreateParty = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (party: {
            title: string;
            description?: string;
            party_type: string;
            location: string;
            latitude: number;
            longitude: number;
            start_time: string;
            end_time?: string;
            max_guests?: number;
            dress_code?: string;
            cover_image?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('parties')
                .insert({
                    host_id: user.id,
                    ...party,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['parties']});
            toast({
                title: 'Party Created! 🎊',
                description: 'Your party is on the map!',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to create party',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

export const useRSVPParty = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({partyId, message}: { partyId: string; message?: string }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('party_rsvps')
                .insert({
                    party_id: partyId,
                    user_id: user.id,
                    message,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['parties']});
            toast({
                title: 'RSVP Sent! 📬',
                description: 'Waiting for host approval.',
            });
        },
    });
};

export const useUpdateRSVP = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               rsvpId,
                               status,
                           }: {
            rsvpId: string;
            status: 'approved' | 'declined';
        }) => {
            const {data, error} = await supabase
                .from('party_rsvps')
                .update({status})
                .eq('id', rsvpId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, {status}) => {
            queryClient.invalidateQueries({queryKey: ['parties']});
            toast({
                title: status === 'approved' ? 'Guest Approved! ✅' : 'Request Declined',
                description: status === 'approved' ? 'They can now see the party details.' : '',
            });
        },
    });
};
