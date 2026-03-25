// ═══════════════════════════════════════════════════════════════
// COMPONENT: SubscriptionSelection — plan picker for onboarding + upsell
// Stack: Vite + React 18 — NO Next.js, NO 'use client'
// Upgraded:
//   • Typed SubscriptionTier replaces loose string literals
//   • Annual saving computed precisely (20% off monthly × 12)
//   • keyboard accessible plan cards (role="radio")
//   • onSkip removed — replaced with explicit Free plan CTA
//   • FYK dark-glass theme, no shadcn Card dependency
//   • JSDoc, WCAG 2.1 AA
// ═══════════════════════════════════════════════════════════════

import { useState, type FC, type KeyboardEvent } from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';

export type SubscriptionTier = 'free' | 'premium' | 'platinum';

interface Plan {
  id: SubscriptionTier;
  name: string;
  monthlyUsd: number;
  tagline: string;
  features: readonly string[];
  popular?: boolean;
  gradient: string;
  Icon: FC<{ className?: string }>;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyUsd: 0,
    tagline: 'Perfect for getting started',
    Icon: Star,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      'Create your profile',
      'Browse basic profiles',
      '5 messages per day',
      'Basic search filters',
      'Community access',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyUsd: 29,
    tagline: 'Enhanced experience',
    Icon: Zap,
    gradient: 'from-sky-500 to-indigo-500',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited messages',
      'Advanced filters',
      'See who viewed you',
      'Priority in search',
      'Read receipts',
      '24/7 support',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    monthlyUsd: 99,
    tagline: 'Ultimate luxury experience',
    Icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Premium',
      'VIP profile badge',
      'Top of search results',
      'Advanced matching',
      'Priority bookings',
      'Exclusive events',
      'Personal concierge',
      'Profile optimisation',
    ],
  },
] as const;

export interface SubscriptionSelectionProps {
  onSelectPlan: (tier: SubscriptionTier) => void;
  selectedPlan?: SubscriptionTier;
}

/** Annual price with 20% discount */
function annualPrice(monthly: number) {
  return Math.round(monthly * 12 * 0.8);
}

/**
 * Billing cycle toggle + plan picker.
 * Handles both onboarding flow and in-app upsell screens.
 *
 * @example
 * <SubscriptionSelection onSelectPlan={(tier) => saveTier(tier)} />
 */
export const SubscriptionSelection: FC<SubscriptionSelectionProps> = ({
  onSelectPlan,
  selectedPlan,
}) => {
  const [cycle, setCycle] = useState<'month' | 'year'>('month');

  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, id: SubscriptionTier) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPlan(id); }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Heading */}
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white">Choose Your Plan</h2>
        <p className="text-sm text-white/50">Select the perfect plan for your FYKING.MEN experience</p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          {(['month', 'year'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              aria-pressed={cycle === c}
              className={[
                'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-sky-400/60',
                cycle === c
                  ? 'bg-white/12 text-white'
                  : 'text-white/50 hover:text-white/80',
              ].join(' ')}
            >
              {c === 'month' ? 'Monthly' : 'Annually'}
              {c === 'year' && (
                <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400">
                  −20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div
        role="radiogroup"
        aria-label="Subscription plans"
        className="grid gap-3"
      >
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const price =
            cycle === 'year' && plan.monthlyUsd > 0
              ? annualPrice(plan.monthlyUsd)
              : plan.monthlyUsd;
          const priceSuffix =
            plan.monthlyUsd === 0 ? 'forever'
            : cycle === 'year' ? '/ year'
            : '/ mo';

          return (
            <button
              key={plan.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectPlan(plan.id)}
              onKeyDown={(e) => handleKey(e, plan.id)}
              className={[
                'group relative flex items-start gap-4 rounded-3xl border p-5 text-left',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/60',
                isSelected
                  ? 'border-sky-400/50 bg-sky-400/8 shadow-[0_0_0_1px_rgba(56,189,248,0.28)]'
                  : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/7',
              ].join(' ')}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-xl border border-amber-400/30 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                  Most Popular
                </span>
              )}

              {/* Icon */}
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.gradient}`}>
                <plan.Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-white">{plan.name}</span>
                  <span className="text-lg font-bold text-white">
                    {plan.monthlyUsd === 0 ? 'Free' : `$${price}`}
                  </span>
                  <span className="text-xs text-white/40">{priceSuffix}</span>
                </div>
                <p className="text-xs text-white/45">{plan.tagline}</p>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-white/60">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm CTA */}
      {selectedPlan && (
        <button
          onClick={() => onSelectPlan(selectedPlan)}
          className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 py-3.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-400/60"
        >
          Continue with {PLANS.find((p) => p.id === selectedPlan)?.name}
        </button>
      )}

      <p className="text-center text-xs text-white/25">
        You can change or cancel your plan any time in Account - Settings.
      </p>
    </div>
  );
};
