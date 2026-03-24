// ═══════════════════════════════════════════════════════════════
// COMPONENT: MeetNowCard — Right Now activity listing card
// Stack: Vite + React 18 — NO Next.js Image, NO 'use client'
// Upgraded:
//   • Import path typo fixed (@/componentsui -> @/components/ui)
//   • Native <img> with loading="lazy" replaces next/image
//   • Expired post guard (> 2h old → disabled)
//   • onAccept callback prop (was fire-and-forget)
//   • ARIA: role="article", aria-label, button states
//   • FYK dark-glass Tailwind theme, JSDoc
// ═══════════════════════════════════════════════════════════════

import { formatDistanceToNowStrict, differenceInHours } from 'date-fns';
import { Clock, MapPin, Sparkles, CheckCircle } from 'lucide-react';
import type { FC } from 'react';

/** Shape expected from the Right Now feed */
export interface MeetNowItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  activity: string;
  location: string;
  time: string;
  createdAt: string; // ISO
}

export interface MeetNowCardProps {
  card: MeetNowItem;
  /** Called when the user taps “I’m In” */
  onAccept?: (cardId: string) => void;
  /** True once the current user has already accepted */
  accepted?: boolean;
}

/** Max hours before a Right Now post is considered expired */
const EXPIRY_HOURS = 2;

/**
 * Card displaying a single Right Now / Meet Now activity request.
 *
 * @example
 * <MeetNowCard card={item} onAccept={(id) => mutate(id)} />
 */
export const MeetNowCard: FC<MeetNowCardProps> = ({ card, onAccept, accepted = false }) => {
  const createdAt = new Date(card.createdAt);
  const isExpired = differenceInHours(new Date(), createdAt) >= EXPIRY_HOURS;
  const timeAgo = formatDistanceToNowStrict(createdAt);
  const initials = card.userName.charAt(0).toUpperCase();

  return (
    <article
      role="article"
      aria-label={`${card.userName} wants to ${card.activity} in ${card.location}`}
      className="flex w-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0">
          {card.userAvatar ? (
            <img
              src={card.userAvatar}
              alt={card.userName}
              loading="lazy"
              className="h-10 w-10 rounded-2xl object-cover"
            />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-500/40 to-violet-500/40 text-sm font-bold text-white">
              {initials}
            </div>
          )}
          {/* Online pulse */}
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{card.userName}</p>
          <p className="text-xs text-white/40">posted {timeAgo} ago</p>
        </div>
        {isExpired && (
          <span className="ml-auto shrink-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/35">
            Expired
          </span>
        )}
      </div>

      {/* Body */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="font-semibold text-white">{card.activity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{card.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Around {card.time}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        disabled={isExpired || accepted}
        onClick={() => onAccept?.(card.id)}
        aria-label={
          accepted ? 'Already accepted' :
          isExpired ? 'This post has expired' :
          `Accept ${card.userName}’s invite`
        }
        className={[
          'flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold',
          'focus:outline-none focus:ring-2 focus:ring-sky-400/60 transition-opacity duration-150',
          accepted
            ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-default'
            : isExpired
            ? 'border border-white/10 bg-white/5 text-white/25 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90',
        ].join(' ')}
      >
        {accepted ? (
          <><CheckCircle className="h-4 w-4" aria-hidden="true" /> You’re In</>
        ) : isExpired ? (
          'No longer available'
        ) : (
          'I’m In'
        )}
      </button>
    </article>
  );
};
