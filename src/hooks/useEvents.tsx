import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';

export type AppEvent ={
    id: string;
    host_id: string;
    title: string;
    description: string | null;
    event_type: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    event_date: string;
    start_time: string;
    end_time: string | null;
    max_attendees: number;
    is_public: boolean;
    is_premium_only: boolean;
    cover_image: string | null;
    created_at: string;
    updated_at: string;
    host?: {
        display_name: string;
        avatar_url: string;
        is_verified: boolean;
    };
    attendee_count?: number;
    is_attending?: boolean;
}

export const EVENT_TYPES = [
    {id: 'gym', label: 'Gym Buddy', icon: '💪', color: 'bg-orange-500'},
    {id: 'cinema', label: 'Cinema', icon: '🎬', color: 'bg-purple-500'},
    {id: 'dinner', label: 'Dinner', icon: '🍽️', color: 'bg-red-500'},
    {id: 'coffee', label: 'Coffee', icon: '☕', color: 'bg-amber-500'},
    {id: 'drinks', label: 'Drinks', icon: '🍻', color: 'bg-yellow-500'},
    {id: 'hiking', label: 'Hiking', icon: '🥾', color: 'bg-green-500'},
    {id: 'sports', label: 'Sports', icon: '⚽', color: 'bg-blue-500'},
    {id: 'gaming', label: 'Gaming', icon: '🎮', color: 'bg-indigo-500'},
    {id: 'party', label: 'Party', icon: '🎉', color: 'bg-pink-500'},
    {id: 'meetup', label: 'Meetup', icon: '👋', color: 'bg-teal-500'},
];

/**
 * Shared realtime hook — call once at the top of any component
 * that uses event data so cache stays warm for all event queries.
 */
export const useEventsRealtime = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const eventsChannel = supabase
            .channel('events-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'events'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events']});
                }
            )
            .subscribe();

        const attendeesChannel = supabase
            .channel('event-attendees-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'event_attendees'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(attendeesChannel);
        };
    }, [queryClient]);
};

export const useEvents = (filter?: 'upcoming' | 'my_events' | 'attending') => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const today = new Date().toISOString().split('T')[0];

    // Real-time subscriptions for events and attendees
    useEffect(() => {
        const eventsChannel = supabase
            .channel(`events-${filter ?? 'all'}-realtime`)
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'events'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events', filter, user?.id]});
                }
            )
            .subscribe();

        const attendeesChannel = supabase
            .channel(`event-attendees-${filter ?? 'all'}-realtime`)
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'event_attendees'},
                () => {
                    queryClient.invalidateQueries({queryKey: ['events', filter, user?.id]});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(eventsChannel);
            supabase.removeChannel(attendeesChannel);
        };
    }, [filter, user?.id, queryClient]);

    return useQuery({
        queryKey: ['events', filter, user?.id],
        queryFn: async () => {
            let query = supabase
                .from('events')
                .select('*')
                .gte('event_date', today)
                .order('event_date', {ascending: true});

            if (filter === 'my_events' && user) {
                query = query.eq('host_id', user.id);
            }

            const {data: events, error} = await query;
            if (error) throw error;

            // Enrich with host profiles and attendee counts
            const enrichedEvents = await Promise.all(
                (events || []).map(async (event) => {
                    const [hostResult, attendeesResult, attendingResult] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('display_name, avatar_url, is_verified')
                            .eq('user_id', event.host_id)
                            .single(),
                        supabase
                            .from('event_attendees')
                            .select('id', {count: 'exact'})
                            .eq('event_id', event.id)
                            .eq('status', 'confirmed'),
                        user
                            ? supabase
                                .from('event_attendees')
                                .select('id')
                                .eq('event_id', event.id)
                                .eq('user_id', user.id)
                                .maybeSingle()
                            : Promise.resolve({data: null}),
                    ]);

                    return {
                        ...event,
                        host: hostResult.data,
                        attendee_count: attendeesResult.count || 0,
                        is_attending: !!attendingResult.data,
                    } as AppEvent;
                })
            );

            if (filter === 'attending' && user) {
                return enrichedEvents.filter((e) => e.is_attending);
            }

            return enrichedEvents;
        },
        enabled: filter !== 'my_events' || !!user,
    });
};

export const useCreateEvent = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: {
            title: string;
            description?: string;
            event_type: string;
            location: string;
            latitude?: number;
            longitude?: number;
            event_date: string;
            start_time: string;
            end_time?: string;
            max_attendees?: number;
            is_public?: boolean;
            cover_image?: string;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('events')
                .insert({host_id: user.id, ...event})
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: 'Event Created', description: 'Your event is now live.'});
        },
        onError: (error: Error) => {
            toast({title: 'Failed to create event', description: error.message, variant: 'destructive'});
        },
    });
};

export const useJoinEvent = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('event_attendees')
                .insert({event_id: eventId, user_id: user.id, status: 'confirmed'})
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: "You're in!", description: 'See you at the event.'});
        },
        onError: (error: Error) => {
            toast({title: 'Failed to join', description: error.message, variant: 'destructive'});
        },
    });
};

export const useLeaveEvent = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            if (!user) throw new Error('Not authenticated');

            const {error} = await supabase
                .from('event_attendees')
                .delete()
                .eq('event_id', eventId)
                .eq('user_id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: 'Left event', description: "You've been removed from this event."});
        },
    });
};

export const useDeleteEvent = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            const {error} = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events']});
            toast({title: 'Event deleted', description: 'Your event has been removed.'});
        },
    });
};
