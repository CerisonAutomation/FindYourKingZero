import {useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useEffect} from 'react';

export type UserSubscription  = {
    id: string;
    user_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan_id: string;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    created_at: string;
    updated_at: string;
}

export const PLAN_FEATURES = {
    free: {
        name: 'Free',
        features: ['5 daily likes', 'Basic filters', 'View profiles'],
        limits: {dailyLikes: 5, messaging: false, aiAssistant: false},
    },
    basic: {
        name: 'Basic',
        features: ['Unlimited messaging', 'See who viewed you', 'Basic filters', '10 daily likes'],
        limits: {dailyLikes: 10, messaging: true, aiAssistant: false},
    },
    premium: {
        name: 'Premium',
        features: ['All Basic features', 'Priority in search', 'Read receipts', 'Advanced filters', 'Unlimited likes', 'Undo last swipe'],
        limits: {dailyLikes: Infinity, messaging: true, aiAssistant: true},
    },
    vip: {
        name: 'VIP',
        features: ['All Premium features', 'Verified badge', 'Featured profile', 'AI assistant', 'Priority support', 'Incognito mode', 'See who liked you'],
        limits: {dailyLikes: Infinity, messaging: true, aiAssistant: true, incognito: true, seeWhoLiked: true},
    },
};

export const useSubscription = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {data: subscription, isLoading} = useQuery({
        queryKey: ['subscription', user?.id],
        queryFn: async () => {
            if (!user) return null;

            const {data, error} = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data as UserSubscription | null;
        },
        enabled: !!user,
    });

    // Subscribe to subscription changes
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('subscription-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_subscriptions',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({queryKey: ['subscription']});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    const currentPlan = subscription?.plan_id || 'free';
    const planInfo = PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.free;
    const isActive = subscription?.status === 'active';
    const isPremium = currentPlan === 'premium' || currentPlan === 'vip';
    const isVIP = currentPlan === 'vip';

    const canMessage = planInfo.limits.messaging;
    const canUseAI = planInfo.limits.aiAssistant;
    const dailyLikesLimit = planInfo.limits.dailyLikes;

    return {
        subscription,
        isLoading,
        currentPlan,
        planInfo,
        isActive,
        isPremium,
        isVIP,
        canMessage,
        canUseAI,
        dailyLikesLimit,
    };
};
