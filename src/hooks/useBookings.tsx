import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';
import {Profile} from './useProfile';

export type Booking  = {
    id: string;
    seeker_id: string;
    provider_id: string;
    booking_date: string;
    start_time: string;
    duration_hours: number;
    location: string | null;
    notes: string | null;
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
    total_amount: number | null;
    payment_status: 'unpaid' | 'paid' | 'refunded';
    stripe_payment_id: string | null;
    created_at: string;
    updated_at: string;
    other_user?: Profile;
}

export const useBookings = (status?: 'pending' | 'upcoming' | 'past') => {
    const {user} = useAuth();
    const today = new Date().toISOString().split('T')[0];

    return useQuery({
        queryKey: ['bookings', user?.id, status],
        queryFn: async () => {
            if (!user) return [];

            let query = supabase
                .from('bookings')
                .select('*')
                .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
                .order('booking_date', {ascending: true});

            if (status === 'pending') {
                query = query.eq('status', 'pending');
            } else if (status === 'upcoming') {
                query = query.in('status', ['accepted']).gte('booking_date', today);
            } else if (status === 'past') {
                query = query.or(`status.eq.completed,booking_date.lt.${today}`);
            }

            const {data, error} = await query;
            if (error) throw error;

            // Fetch other user profiles
            const bookingsWithProfiles = await Promise.all(
                (data || []).map(async (booking) => {
                    const otherUserId = booking.seeker_id === user.id
                        ? booking.provider_id
                        : booking.seeker_id;

                    const {data: profile} = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('user_id', otherUserId)
                        .single();

                    return {
                        ...booking,
                        other_user: profile,
                    } as Booking;
                })
            );

            return bookingsWithProfiles;
        },
        enabled: !!user,
    });
};

export const useCreateBooking = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (booking: {
            provider_id: string;
            booking_date: string;
            start_time: string;
            duration_hours: number;
            location?: string;
            notes?: string;
            total_amount?: number;
        }) => {
            if (!user) throw new Error('Not authenticated');

            const {data, error} = await supabase
                .from('bookings')
                .insert({
                    seeker_id: user.id,
                    ...booking,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['bookings']});
            toast({
                title: 'Booking requested',
                description: 'Your booking request has been sent.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Booking failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

export const useUpdateBookingStatus = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
                               bookingId,
                               status,
                           }: {
            bookingId: string;
            status: 'accepted' | 'declined' | 'completed' | 'cancelled';
        }) => {
            const {data, error} = await supabase
                .from('bookings')
                .update({status})
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({queryKey: ['bookings']});
            toast({
                title: 'Booking updated',
                description: `Booking has been ${variables.status}.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Update failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};
