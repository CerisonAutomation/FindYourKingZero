// =============================================================================
// ProfileCard.tsx — Dating profile card component
// =============================================================================

import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, CheckCircle, Clock } from 'lucide-react';

interface ProfileCardProps {
  id: string;
  displayName: string;
  age: number;
  bio?: string;
  photos?: string[];
  distance?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  lastSeen?: string;
  tribes?: string[];
  onClick?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  displayName,
  age,
  bio,
  photos = [],
  distance,
  isOnline = false,
  isVerified = false,
  lastSeen,
  tribes = [],
  onClick,
  className,
}) => {
  const primaryPhoto = photos[0] || '/placeholder.svg';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl bg-surface-1 border border-border',
        'cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`View ${displayName}'s profile`}
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={primaryPhoto}
          alt={`${displayName}'s photo`}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Status indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isOnline && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/90 rounded-full text-xs text-white font-medium">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Online
            </span>
          )}
          {isVerified && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 rounded-full text-xs text-white font-medium">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{displayName}</h3>
            <span className="text-lg font-light">{age}</span>
          </div>

          {distance !== undefined && (
            <div className="flex items-center gap-1 mt-1 text-sm text-white/80">
              <MapPin className="w-3 h-3" />
              <span>{distance < 1 ? '<1 km' : `${Math.round(distance)} km`} away</span>
            </div>
          )}

          {!isOnline && lastSeen && (
            <div className="flex items-center gap-1 mt-1 text-sm text-white/60">
              <Clock className="w-3 h-3" />
              <span>Active {lastSeen}</span>
            </div>
          )}

          {bio && (
            <p className="mt-2 text-sm text-white/80 line-clamp-2">{bio}</p>
          )}

          {tribes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tribes.slice(0, 3).map((tribe, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/20 rounded-full text-xs"
                >
                  {tribe}
                </span>
              ))}
              {tribes.length > 3 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  +{tribes.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;