/**
 * SubscriptionPage — full monetization UI
 * Tiers: Free / Plus / Pro / Elite / Host
 * Feature packs, progression level, upgrade CTAs
 */
import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowRight, Check, ChevronRight, Crown, Shield, Sparkles, Star, Users, Zap,} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {
    FEATURE_PACKS,
    LEVEL_META,
    SubTier,
    TIER_BENEFITS,
    TIER_META,
    useMyLevel,
    useMySubscription,
} from '@/hooks/useSubscriptionTier';
import {cn} from '@/lib/utils';

// ── Tier icon map ─────────────────────────────────────────────
const TIER_ICONS: Record<SubTier, typeof Crown> = {
    free: Zap,
    plus: Star,
    pro: Crown,
    elite: Shield,
    host: Users,
};

// ── Plan card ─────────────────────────────────────────────────
function PlanCard({
                      tier, isCurrentTier, isHighlighted, annual,
                      onUpgrade,
                  }: {
    tier: SubTier;
    isCurrentTier: boolean;
    isHighlighted: boolean;
    annual: boolean;
    onUpgrade: (t: SubTier) => void;
}) {
    const meta = TIER_META[tier];
    const benefits = TIER_BENEFITS[tier];
    const Icon = TIER_ICONS[tier];
    const price = annual ? meta.price_annual : meta.price_monthly;
    const priceLabel = tier === 'free' ? 'Free forever' : annual
        ? `$${meta.price_annual}/yr`
        : `$${meta.price_monthly}/mo`;
    const savingsLabel = annual && meta.price_monthly > 0
        ? `Save $${((meta.price_monthly * 12) - meta.price_annual).toFixed(0)}/yr`
        : null;

    return (
        <motion.div
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            className={cn(
                'relative border overflow-hidden transition-all',
                isHighlighted
                    ? 'border-primary/50 shadow-[0_0_32px_hsl(var(--primary)/0.15)]'
                    : 'border-border/25',
                isCurrentTier && 'outline outline-1 outline-primary/30',
            )}
            style={{background: isHighlighted ? 'hsl(var(--card))' : 'hsl(var(--surface-1))'}}
        >
            {/* Recommended badge */}
            {isHighlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="px-3 py-0.5 text-[10px] font-black text-primary-foreground"
                style={{background: 'var(--gradient-primary, hsl(var(--primary)))'}}>
            MOST POPULAR
          </span>
                </div>
            )}

            <div className="p-5 pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 flex items-center justify-center"
                                 style={{background: `${meta.color}20`}}>
                                <Icon className="w-4 h-4" style={{color: meta.color}}/>
                            </div>
                            <span className="font-black text-[16px]">{meta.label}</span>
                            {isCurrentTier && (
                                <span className="px-2 py-0.5 text-[9px] font-black bg-primary/15 text-primary">
                  CURRENT
                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-[20px] leading-none" style={{color: meta.color}}>
                            {tier === 'free' ? 'Free' : `$${annual ? (meta.price_annual / 12).toFixed(2) : meta.price_monthly}`}
                        </p>
                        {tier !== 'free' && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {annual ? '/mo billed annually' : '/month'}
                            </p>
                        )}
                        {savingsLabel && (
                            <p className="text-[10px] font-bold mt-0.5"
                               style={{color: 'hsl(var(--emerald))'}}>{savingsLabel}</p>
                        )}
                    </div>
                </div>

                {/* Benefits */}
                <ul className="space-y-1.5 mb-5">
                    {benefits.slice(0, 6).map(b => (
                        <li key={b} className="flex items-center gap-2 text-[12px]">
                            <Check className="w-3.5 h-3.5 shrink-0" style={{color: meta.color}}/>
                            <span
                                className={cn(b.startsWith('Everything') ? 'text-muted-foreground italic' : 'text-foreground/85')}>
                {b}
              </span>
                        </li>
                    ))}
                    {benefits.length > 6 && (
                        <li className="text-[11px] text-muted-foreground pl-5">
                            +{benefits.length - 6} more benefits
                        </li>
                    )}
                </ul>

                {/* CTA */}
                {!isCurrentTier && tier !== 'free' ? (
                    <button
                        onClick={() => onUpgrade(tier)}
                        className={cn(
                            'w-full h-10 font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
                            isHighlighted
                                ? 'text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.35)]'
                                : 'border border-border/40 hover:border-primary/40 bg-secondary/40',
                        )}
                        style={isHighlighted ? {background: 'var(--gradient-primary, hsl(var(--primary)))'} : {}}
                    >
                        Upgrade to {meta.label}
                        <ArrowRight className="w-3.5 h-3.5"/>
                    </button>
                ) : isCurrentTier ? (
                    <div
                        className="w-full h-10 border border-border/30 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
                        <Check className="w-3.5 h-3.5"/>
                        Active Plan
                    </div>
                ) : (
                    <div
                        className="w-full h-10 bg-secondary/30 flex items-center justify-center text-[12px] text-muted-foreground">
                        Your current plan
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── Level progress card ───────────────────────────────────────
function LevelProgressCard() {
    const {level, meta, xp, nextLevel, nextXP, progress, levelData} = useMyLevel();

    return (
        <div className="border border-border/25 overflow-hidden"
             style={{background: 'hsl(var(--surface-1))'}}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 flex items-center justify-center font-black text-[16px]"
                             style={{background: `${meta.color}20`, color: meta.color}}>
                            {meta.label[0]}
                        </div>
                        <div>
                            <p className="font-black text-[14px]">{meta.label}</p>
                            <p className="text-[10px] text-muted-foreground">{xp.toLocaleString()} XP</p>
                        </div>
                    </div>
                    {nextLevel && (
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Next</p>
                            <p className="font-bold text-[12px]" style={{color: LEVEL_META[nextLevel].color}}>
                                {LEVEL_META[nextLevel].label}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{nextXP?.toLocaleString()} XP</p>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                {nextLevel && (
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{width: 0}} animate={{width: `${progress}%`}}
                            transition={{duration: 0.8, ease: 'easeOut'}}
                            className="h-full rounded-full"
                            style={{background: meta.color}}
                        />
                    </div>
                )}

                {/* Perks */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {meta.perks.map(p => (
                        <span key={p}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-secondary/60 text-muted-foreground border border-border/20">
              {p}
            </span>
                    ))}
                </div>
            </div>

            {/* Stats row */}
            {levelData && (
                <div className="grid grid-cols-3 divide-x divide-border/20 border-t border-border/20">
                    {[
                        {label: 'Events', value: levelData.total_events_attended},
                        {label: 'Hosted', value: levelData.total_events_hosted},
                        {label: 'Streak', value: `${levelData.streak_days}d`},
                    ].map(({label, value}) => (
                        <div key={label} className="py-2.5 text-center">
                            <p className="font-black text-[15px]">{value}</p>
                            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Feature pack card ─────────────────────────────────────────
function FeaturePackCard({pack}: { pack: (typeof FEATURE_PACKS)[number] }) {
    const {hasPack} = useMySubscription();
    const owned = hasPack(pack.id);

    return (
                            <div className={cn(
                                'border p-4 flex items-center gap-3 transition-all',
                                owned ? 'border-primary/30 bg-primary/5' : 'border-border/25 bg-surface-1',
                            )}>
            <div className="w-10 h-10 flex items-center justify-center text-[20px] bg-secondary/60 shrink-0">
                {pack.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-bold text-[13px]">{pack.name}</p>
                    {owned && <Check className="w-3.5 h-3.5 text-primary shrink-0"/>}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{pack.description}</p>
            </div>
            <div className="shrink-0 text-right">
                {owned ? (
                    <span className="text-[11px] font-bold text-primary">Active</span>
                ) : (
                    <>
                        <p className="font-black text-[14px]">${pack.price}</p>
                        <p className="text-[9px] text-muted-foreground">/mo</p>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function SubscriptionPage() {
    const navigate = useNavigate();
    const {tier: currentTier, isLoading} = useMySubscription();
    const [annual, setAnnual] = useState(true);
    const [activeSection, setActiveSection] = useState<'plans' | 'packs' | 'level'>('plans');

    const tiers: SubTier[] = ['free', 'plus', 'pro', 'elite', 'host'];
    const HIGHLIGHTED: SubTier = 'pro';

    const handleUpgrade = (tier: SubTier) => {
        // Route to checkout — wired to Stripe in create-checkout edge function
        navigate(`/app/settings/checkout?tier=${tier}&annual=${annual}`);
    };

    return (
        <div className="min-h-screen pb-24" style={{background: 'hsl(var(--background))'}}>
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/15"
                    style={{background: 'hsl(var(--card)/0.95)', backdropFilter: 'blur(20px)'}}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                    <button onClick={() => navigate(-1)}
                            className="w-8 h-8 flex items-center justify-center bg-secondary/60 active:scale-90 transition-all">
                        <ChevronRight className="w-4 h-4 rotate-180"/>
                    </button>
                    <div className="flex-1">
                        <h1 className="font-black text-[16px] leading-tight">Upgrade</h1>
                        <p className="text-[10px] text-muted-foreground">Unlock your full potential</p>
                    </div>
                    <div className="flex items-center gap-1 p-0.5 bg-secondary/40">
                        {(['plans', 'packs', 'level'] as const).map(s => (
                            <button key={s} onClick={() => setActiveSection(s)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all capitalize',
                                        activeSection === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                                    )}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="px-4 pt-4 space-y-4">
                <AnimatePresence mode="wait">

                    {/* ── Plans section ── */}
                    {activeSection === 'plans' && (
                        <motion.div key="plans" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="space-y-4">

                            {/* Hero */}
                            <div className="text-center py-2">
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-primary"/>
                                    <span className="text-[11px] font-bold text-primary">Premium Social Platform</span>
                                </div>
                                <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">
                                    Unlock faster discovery, better coordination, and higher-quality outcomes.
                                </p>
                            </div>

                            {/* Annual toggle */}
                            <div className="flex items-center justify-center gap-3">
                                <span
                                    className={cn('text-[12px] font-semibold', !annual && 'text-foreground', annual && 'text-muted-foreground')}>Monthly</span>
                                <button
                                    onClick={() => setAnnual(a => !a)}
                                    className={cn(
                                        'relative w-11 h-6 transition-all',
                                        annual ? 'bg-primary' : 'bg-secondary',
                                    )}
                                >
                                    <motion.div
                                        animate={{x: annual ? 20 : 2}}
                                        transition={{type: 'spring', stiffness: 500, damping: 30}}
                                        className="absolute top-1 w-4 h-4 bg-white shadow"
                                    />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={cn('text-[12px] font-semibold', annual && 'text-foreground', !annual && 'text-muted-foreground')}>Annual</span>
                                    <span
                                        className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-400/15 text-emerald-400">SAVE 20%</span>
                                </div>
                            </div>

                            {/* Plan cards */}
                            {tiers.map(t => (
                                <PlanCard
                                    key={t}
                                    tier={t}
                                    isCurrentTier={t === currentTier}
                                    isHighlighted={t === HIGHLIGHTED}
                                    annual={annual}
                                    onUpgrade={handleUpgrade}
                                />
                            ))}

                            {/* Trust badges */}
                            <div className="flex items-center justify-center gap-6 py-4">
                                {['Cancel anytime', 'Secure billing', 'Instant activation'].map(b => (
                                    <div key={b} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Check className="w-3 h-3 text-emerald-400"/>{b}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Feature packs section ── */}
                    {activeSection === 'packs' && (
                        <motion.div key="packs" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="space-y-3">
                            <div className="border border-border/25 p-4 bg-secondary/20">
                                <p className="text-[12px] text-muted-foreground">
                                    Feature packs add targeted capabilities to your plan. Mix and match what matters to
                                    you.
                                </p>
                            </div>
                            {FEATURE_PACKS.map(pack => (
                                <FeaturePackCard key={pack.id} pack={pack}/>
                            ))}
                        </motion.div>
                    )}

                    {/* ── Level / progression section ── */}
                    {activeSection === 'level' && (
                        <motion.div key="level" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="space-y-4">
                            <LevelProgressCard/>

                            {/* Level ladder */}
                            <div className="border border-border/25 overflow-hidden"
                                 style={{background: 'hsl(var(--surface-1))'}}>
                                <div className="px-4 py-3 border-b border-border/15">
                                    <p className="font-black text-[13px]">Level Progression</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Earn XP through attendance,
                                        hosting, and quality interactions</p>
                                </div>
                                {(Object.entries(LEVEL_META) as [string, typeof LEVEL_META[keyof typeof LEVEL_META]][]).map(([key, m]) => (
                                    <div key={key}
                                         className="flex items-center gap-3 px-4 py-3 border-b border-border/10 last:border-0">
                                        <div
                                            className="w-8 h-8 flex items-center justify-center font-black text-[13px] shrink-0"
                                            style={{background: `${m.color}18`, color: m.color}}>
                                            {m.label[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-[12px]">{m.label}</p>
                                                <span
                                                    className="text-[10px] text-muted-foreground">{m.xp.toLocaleString()} XP</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground truncate">{m.perks[0]}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* How to earn XP */}
                            <div className="border border-border/25 p-4"
                                 style={{background: 'hsl(var(--surface-1))'}}>
                                <p className="font-black text-[13px] mb-3">Earn XP</p>
                                <div className="space-y-2">
                                    {[
                                        {action: 'Complete your profile', xp: 50, icon: '👤'},
                                        {action: 'Attend an event (RSVP + show)', xp: 25, icon: '✅'},
                                        {action: 'Host an event', xp: 75, icon: '🎉'},
                                        {action: 'Receive 5-star host rating', xp: 100, icon: '⭐'},
                                        {action: 'Refer a new user', xp: 40, icon: '🤝'},
                                        {action: '7-day activity streak', xp: 30, icon: '🔥'},
                                    ].map(({action, xp, icon}) => (
                                        <div key={action} className="flex items-center gap-3">
                                            <span className="text-lg w-7">{icon}</span>
                                            <span className="flex-1 text-[12px]">{action}</span>
                                            <span className="font-black text-[12px] text-primary">+{xp} XP</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
