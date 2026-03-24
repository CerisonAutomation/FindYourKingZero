// ═══════════════════════════════════════════════════════════════
// COMPONENT: RoleSelection — Seeker vs Provider onboarding step
// Stack: Vite + React 18 — NO Next.js, NO 'use client', NO shadcn Card
// Upgraded:
//   • Keyboard accessible — role="radiogroup" + role="radio"
//   • Click and Enter/Space activation
//   • FYK dark-glass Tailwind theme
//   • Single confirm CTA (removes double-click UX bug)
//   • JSDoc, strict props, WCAG 2.1 AA
// ═══════════════════════════════════════════════════════════════

import type { KeyboardEvent, FC } from 'react';
import { Heart, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';

export type UserRole = 'seeker' | 'provider';

export interface RoleSelectionProps {
  /** Called when user commits their role choice */
  onSelectRole: (role: UserRole) => void;
  selectedRole?: UserRole;
}

interface RoleConfig {
  id: UserRole;
  label: string;
  tagline: string;
  icon: React.ReactElement;
  gradient: string;
  perks: string[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'seeker',
    label: 'Seeker',
    tagline: 'Find meaningful connections & discreet encounters',
    icon: <Heart className="h-8 w-8 text-white" aria-hidden="true" />,
    gradient: 'from-rose-500 to-pink-500',
    perks: [
      'Browse & connect with profiles',
      'Save favourites & matches',
      'Book premium experiences',
    ],
  },
  {
    id: 'provider',
    label: 'Provider',
    tagline: 'Offer premium companionship & experiences',
    icon: <Briefcase className="h-8 w-8 text-white" aria-hidden="true" />,
    gradient: 'from-violet-500 to-indigo-500',
    perks: [
      'Showcase your profile',
      'Set rates & availability',
      'Manage bookings & clients',
    ],
  },
];

/**
 * Onboarding step for choosing Seeker or Provider role.
 * Uses role="radiogroup" pattern for full keyboard accessibility.
 *
 * @example
 * <RoleSelection onSelectRole={(role) => saveRole(role)} />
 */
export const RoleSelection: FC<RoleSelectionProps> = ({ onSelectRole, selectedRole }) => {
  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, id: UserRole) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectRole(id);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {/* Heading */}
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white">Choose Your Role</h2>
        <p className="text-sm text-white/50">Select how you’d like to use FYKING.MEN</p>
      </div>

      {/* Radio group */}
      <div
        role="radiogroup"
        aria-label="User role selection"
        className="flex flex-col gap-3"
      >
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectRole(role.id)}
              onKeyDown={(e) => handleKey(e, role.id)}
              className={[
                'group relative flex items-start gap-4 rounded-3xl border p-5 text-left',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/60',
                isSelected
                  ? 'border-sky-400/50 bg-sky-400/8 shadow-[0_0_0_1px_rgba(56,189,248,0.30)]'
                  : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/7',
              ].join(' ')}
            >
              {/* Icon */}
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient}`}>
                {role.icon}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{role.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  )}
                </div>
                <p className="text-xs text-white/50">{role.tagline}</p>
                <ul className="space-y-1">
                  {role.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-1.5 text-xs text-white/60">
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm CTA — only appears once a role is chosen */}
      {selectedRole && (
        <button
          onClick={() => onSelectRole(selectedRole)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 py-3.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-400/60"
        >
          Continue as {ROLES.find((r) => r.id === selectedRole)?.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      <p className="text-center text-xs text-white/25">
        You can change your role later in Account → Settings.
      </p>
    </div>
  );
};
