// ═══════════════════════════════════════════════════════════════
// COMPONENT: ProfileCard — discovery grid card
// Stack: Vite + React 18 + Zustand — NO Next.js, NO 'use client'
// Removed: next/image, next/link, useRouter, supabase in component
// Upgraded:
//   • Navigation via useNavStore.go() instead of router.push()
//   • Favourite mutation lifted to parent via onToggleFavorite callback
//     (component is now purely presentational for the toggle)
//   • Native <img> with loading="lazy", aspect-ratio, object-fit
//   • Optimistic isFavorite state still supported
//   • ARIA: role="article", aria-label on interactive buttons
//   • FYK dark-glass treatment on overlay
//   • JSDoc, strict TypeScript
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, type FC } from 'react';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { useNavStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import type { UserProfile } from '@/types';

export interface ProfileCardProps {
  /** The profile to display */
  profile: UserProfile;
  matchScore?: number;
  isOnline?: boolean;
  /** Distance in km */
  distanceKm?: number;
  isFavorite?: boolean;
  /** Called when the heart button is toggled; parent handles the API call */
  onToggleFavorite?: (profileId: string, isFav: boolean) => void;
  /** Called when message button is clicked; parent can override default nav */
  onMessage?: (profileId: string) => void;
}

/**
 * Presentational discovery grid card.
 * Favourite state is optimistic — parent is responsible for the mutation.
 *
 * @example
 * <ProfileCard
 *   profile={user}
 *   isOnline
 *   distanceKm={2.4}
 *   onToggleFavorite={(id, fav) => toggleFav(id, fav)}
 * />
 */
export const ProfileCard: FC<ProfileCardProps> = ({
  profile,
  matchScore,
  isOnline,
  distanceKm,
  isFavorite: initialFav = false,
  onToggleFavorite,
  onMessage,
}) => {
  const go = useNavStore((s) => s.go);
  const { user: currentUser } = useUser();
  const [isFav, setIsFav] = useState(initialFav);

  // Sync if parent changes the value
  useEffect(() => setIsFav(initialFav), [initialFav]);

  const isSelf = currentUser?.id === profile.id;
  const displayName = profile.display_name ?? profile.email?.split('@')[0] ?? 'Anonymous';
  const avatarSrc = profile.photos?.[0]
    ?? `https://picsum.photos/seed/${profile.id}/600/800`;
  const distLabel =
    distanceKm !== undefined
      ? distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m away`
        : `${distanceKm.toFixed(1)} km away`
      : null;

  const handleCardClick = () => {
    go('view-profile', { profile });
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelf) return;
    const next = !isFav;
    setIsFav(next);
    onToggleFavorite?.(profile.id, next);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelf) return;
    if (onMessage) {
      onMessage(profile.id);
    } else {
      go('chat', { chatUser: profile });
    }
  };

  return (
    <article
      role="article"
      aria-label={`${displayName}, ${profile.age ?? ''}`}
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/8 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10"
    >
      {/* Photo */}
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img
          src={avatarSrc}
          alt={displayName}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Match score badge */}
      {matchScore !== undefined && (
        <div className="absolute left-3 top-3 rounded-2xl border border-white/10 bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
          {matchScore}% Match
        </div>
      )}

      {/* Gradient overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
      />

      {/* Action buttons — visible on hover or focus-within */}
      <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={handleFav}
          disabled={isSelf}
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={isFav}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md hover:bg-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400/60 disabled:opacity-30"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : ''}`}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={handleMessage}
          disabled={isSelf}
          aria-label={`Message ${displayName}`}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md hover:bg-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:opacity-30"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-base font-bold">{displayName}</h3>
          {profile.age && <span className="text-sm text-white/75">{profile.age}</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/50">
          {isOnline && (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Online
            </span>
          )}
          {distLabel && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {distLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
