import {useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useEffect} from 'react';
import {Profile} from './useProfile';

export type Match  = {
    id: string;
    user_one: string;
    user_two: string;
    matched_at: string;
    matched_profile?: Profile;
}

export const useMatches = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {data: matches = [], isLoading} = useQuery({
        queryKey: ['matches', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const {data, error} = await supabase
                .from('matches')
                .select('*')
                .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
                .order('matched_at', {ascending: false});

            if (error) throw error;

            // Fetch profiles for matched users
            const matchedUserIds = data.map((match) =>
                match.user_one === user.id ? match.user_two : match.user_one
            );

            const {data: profiles} = await supabase
                .from('profiles')
                .select('*')
                .in('user_id', matchedUserIds);

            const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

            return data.map((match) => ({
                ...match,
                matched_profile: profileMap.get(
                    match.user_one === user.id ? match.user_two : match.user_one
                ),
            })) as Match[];
        },
        enabled: !!user,
    });

    // Subscribe to new matches in realtime
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('matches-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'matches',
                },
                (payload) => {
                    const match = payload.new as Match;
                    if (match.user_one === user.id || match.user_two === user.id) {
                        queryClient.invalidateQueries({queryKey: ['matches']});
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return {
        matches,
        isLoading,
        matchCount: matches.length,
    };
};
