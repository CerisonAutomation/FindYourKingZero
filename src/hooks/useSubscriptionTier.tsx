/**
 * useSubscriptionTier — multi-tier subscription + progression system
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';

const db = supabase as any;

// ── Types ─────────────────────────────────────────────────────

export type SubTier = 'free' | 'plus' | 'pro' | 'elite' | 'host';
export type UserLevel =
    'new'
    | 'active'
    | 'verified'
    | 'trusted'
    | 'connector'
    | 'host'
    | 'elite_host'
    | 'inner_circle';

export type UserSubscription = {
    id: string;
    user_id: string;
    tier: SubTier;
    stripe_customer_id: string | null;
    stripe_sub_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    add_ons: string[];
    is_host: boolean;
    host_tier: string | null;
}

export type UserLevelData = {
    id: string;
    user_id: string;
    level: UserLevel;
    xp: number;
    profile_score: number;
    attendance_score: number;
    host_score: number;
    trust_score: number;
    rsvp_reliability: number;
    total_events_hosted: number;
    total_events_attended: number;
    total_referrals: number;
    streak_days: number;
    last_activity_at: string;
}

// ── Tier metadata ─────────────────────────────────────────────

export const TIER_META: Record<SubTier, {
    label: string; color: string; gradient: string;
    price_monthly: number; price_annual: number; rank: number;
}> = {
    free: {
        label: 'Free',
        color: 'hsl(var(--muted-foreground))',
        gradient: 'from-muted to-muted/60',
        price_monthly: 0,
        price_annual: 0,
        rank: 0
    },
    plus: {
        label: 'Plus',
        color: 'hsl(var(--primary))',
        gradient: 'from-primary to-primary/70',
        price_monthly: 9.99,
        price_annual: 89.99,
        rank: 1
    },
    pro: {
        label: 'Pro',
        color: 'hsl(45 85% 55%)',
        gradient: 'from-amber-500 to-yellow-400',
        price_monthly: 24.99,
        price_annual: 239.99,
        rank: 2
    },
    elite: {
        label: 'Elite',
        color: 'hsl(270 70% 60%)',
        gradient: 'from-violet-600 to-purple-400',
        price_monthly: 59.99,
        price_annual: 579.99,
        rank: 3
    },
    host: {
        label: 'Host',
        color: 'hsl(180 65% 45%)',
        gradient: 'from-cyan-600 to-teal-400',
        price_monthly: 34.99,
        price_annual: 329.99,
        rank: 2
    },
};

export const TIER_BENEFITS: Record<SubTier, string[]> = {
    free: [
        'Basic profile',
        'Limited discovery (20/day)',
        'Join public circles & events',
        'Basic direct messaging (post-match)',
        'Basic event RSVP',
        'Standard privacy controls',
    ],
    plus: [
        'Everything in Free',
        'Expanded discovery filters',
        'Unlimited daily interactions',
        'Advanced search by vibe, schedule, radius',
        'Enhanced AI recommendations',
        'See who viewed your profile',
        'Travel mode',
        'Priority inbox',
        'Recurring activity templates',
        'Better calendar coordination',
    ],
    pro: [
        'Everything in Plus',
        'Unlimited advanced discovery',
        'AI-generated plan assistance',
        'AI chat-to-event creation',
        'Co-host tools',
        'Advanced RSVP management',
        'Premium circle creation',
        'Social analytics dashboard',
        'Host quality tools',
        'Invite funnel tracking',
        'Custom recurring events',
    ],
    elite: [
        'Everything in Pro',
        'Priority discovery placement',
        'Private elite circles',
        'Exclusive event access',
        'White-glove event tools',
        'Premium planning assistant',
        'Advanced travel coordination',
        'Elite guest list tools',
        'Premium safety support',
        'Account manager features',
        'Early access to new features',
        'Premium support (4h response)',
    ],
    host: [
        'Everything in Pro',
        'Ticketed event creation',
        'Waitlist management',
        'Invite approvals & guest lists',
        'Host analytics dashboard',
        'Attendee segmentation',
        'Automated reminders',
        'Event follow-up workflows',
        'Conversion funnel tracking',
        'Repeat event templates',
        'Revenue metrics',
        'Host profile branding',
    ],
};

export const FEATURE_PACKS = [
    {
        id: 'discovery',
        name: 'Discovery Pack',
        description: 'AI compatibility ranking, travel mode boost, activity-first matching, visibility control',
        price: 4.99,
        icon: '🔍',
        min_tier: 'plus' as SubTier
    },
    {
        id: 'host',
        name: 'Host Pack',
        description: 'Premium events, invite analytics, waitlists, co-host workflows, reminder automation',
        price: 9.99,
        icon: '🎉',
        min_tier: 'pro' as SubTier
    },
    {
        id: 'ai_coordination',
        name: 'AI Coordination Pack',
        description: 'Chat-to-plan detection, AI event drafting, venue recommendations, follow-up automation',
        price: 6.99,
        icon: '🤖',
        min_tier: 'plus' as SubTier
    },
    {
        id: 'travel',
        name: 'Travel Pack',
        description: 'Destination mode, local introductions, curated city meetups, travel group coordination',
        price: 4.99,
        icon: '✈️',
        min_tier: 'plus' as SubTier
    },
    {
        id: 'fitness',
        name: 'Fitness Pack',
        description: 'Partner matching, training groups, progress tracking, recurring fitness plans',
        price: 3.99,
        icon: '💪',
        min_tier: 'free' as SubTier
    },
] as const;

export const LEVEL_META: Record<UserLevel, { label: string; xp: number; color: string; perks: string[] }> = {
    new: {label: 'New', xp: 0, color: 'hsl(var(--muted-foreground))', perks: ['Basic features']},
    active: {
        label: 'Active',
        xp: 20,
        color: 'hsl(180 60% 50%)',
        perks: ['Increased visibility', 'Higher invite limits']
    },
    verified: {
        label: 'Verified',
        xp: 80,
        color: 'hsl(214 80% 56%)',
        perks: ['Verified badge', 'Better discovery ranking']
    },
    trusted: {
        label: 'Trusted',
        xp: 250,
        color: 'hsl(142 60% 48%)',
        perks: ['Access to premium circles', 'Faster approval in groups']
    },
    connector: {
        label: 'Connector',
        xp: 600,
        color: 'hsl(45 85% 55%)',
        perks: ['Host permissions unlocked', 'Enhanced analytics']
    },
    host: {label: 'Host', xp: 1200, color: 'hsl(270 65% 58%)', perks: ['Advanced event tools', 'Priority support']},
    elite_host: {
        label: 'Elite Host',
        xp: 2500,
        color: 'hsl(30 90% 55%)',
        perks: ['Elite circles access', 'Top discovery placement']
    },
    inner_circle: {
        label: 'Inner Circle',
        xp: 5000,
        color: 'hsl(0 0% 88%)',
        perks: ['All features unlocked', 'Exclusive events', 'White-glove service']
    },
};

// ── Hooks ─────────────────────────────────────────────────────

export const useMySubscription = () => {
    const {user} = useAuth();

    const {data: subscription, isLoading} = useQuery({
        queryKey: ['my-subscription', user?.id],
        queryFn: async (): Promise<UserSubscription | null> => {
            if (!user) return null;
            try {
                const {data} = await db.from('user_subscriptions').select('*').eq('user_id', user.id).maybeSingle();
                return data as UserSubscription | null;
            } catch {
                return null;
            }
        },
        enabled: !!user,
    });

    const tier: SubTier = (subscription?.tier as SubTier) ?? 'free';
    const tierRank = TIER_META[tier].rank;

    const hasFeature = (feature: string): boolean => {
        const gateMap: Record<string, number> = {
            advanced_filters: 1, unlimited_interactions: 1, ai_recommendations: 1,
            see_who_viewed: 1, travel_mode: 1, ai_event_creation: 2, host_tools: 2,
            social_analytics: 2, elite_circles: 3, priority_placement: 3, concierge: 3,
            ticketed_events: 2, waitlists: 2, invite_analytics: 2,
        };
        return tierRank >= (gateMap[feature] ?? 0);
    };

    const hasPack = (packId: string): boolean =>
        subscription?.add_ons?.includes(packId) ?? false;

    return {
        subscription,
        tier,
        tierMeta: TIER_META[tier],
        isLoading,
        isPaid: tier !== 'free',
        isPlus: tierRank >= 1,
        isPro: tierRank >= 2,
        isElite: tier === 'elite',
        isHost: (subscription?.is_host) ?? tier === 'host',
        hasFeature,
        hasPack,
    };
};

export const useMyLevel = () => {
    const {user} = useAuth();

    const {data: levelData, isLoading} = useQuery({
        queryKey: ['my-level', user?.id],
        queryFn: async (): Promise<UserLevelData | null> => {
            if (!user) return null;
            try {
                const {data} = await db.from('user_levels').select('*').eq('user_id', user.id).maybeSingle();
                return data as UserLevelData | null;
            } catch {
                return null;
            }
        },
        enabled: !!user,
    });

    const level: UserLevel = (levelData?.level as UserLevel) ?? 'new';
    const meta = LEVEL_META[level];
    const levelKeys = Object.keys(LEVEL_META) as UserLevel[];
    const currentIdx = levelKeys.indexOf(level);
    const nextLevel = levelKeys[currentIdx + 1] as UserLevel | undefined;
    const nextXP = nextLevel ? LEVEL_META[nextLevel].xp : null;
    const currentXP = levelData?.xp ?? 0;
    const progress = nextXP ? Math.min(100, (currentXP - meta.xp) / (nextXP - meta.xp) * 100) : 100;

    return {levelData, level, meta, xp: currentXP, nextLevel, nextXP, progress, isLoading};
};

export const useAwardXP = () => {
    const {user} = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({amount}: { amount: number; reason?: string }) => {
            if (!user) return;
            try {
                const {data: existing} = await db.from('user_levels').select('xp').eq('user_id', user.id).maybeSingle();
                const currentXP = (existing as any)?.xp ?? 0;
                await db.from('user_levels')
                    .upsert({user_id: user.id, xp: currentXP + amount, last_activity_at: new Date().toISOString()})
                    .eq('user_id', user.id);
            } catch { /* ignore */
            }
        },
        onSuccess: () => qc.invalidateQueries({queryKey: ['my-level']}),
    });
};
