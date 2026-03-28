import {BadgeCheck, Radio} from 'lucide-react';
import {cn} from '@/lib/utils';
import {CrownBadge} from './CrownBadge';

interface ProfileCardProps {
    id: string;
    displayName: string;
    photoUrl?: string;
    age?: number;
    distance?: string;
    isOnline?: boolean;
    isVerified?: boolean;
    isPremium?: boolean;
    availableNow?: boolean;
    onClick?: (id: string) => void;
    className?: string;
}

export function ProfileCard({
    id,
    displayName,
    photoUrl,
    age,
    distance,
    isOnline = false,
    isVerified = false,
    isPremium = false,
    availableNow = false,
    onClick,
    className,
}: ProfileCardProps) {
    return (
        <div
            onClick={() => onClick?.(id)}
            className={cn(
                'relative overflow-hidden cursor-pointer group',
                'transition-all duration-300 ease-out',
                'hover:scale-[1.03]',
                className,
            )}
            style={{
                background: 'hsl(var(--surface-1))',
                border: '1px solid hsl(var(--border))',
                boxShadow: 'var(--shadow-card)',
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.(id);
                }
            }}
        >
            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
                style={{
                    boxShadow: '0 0 30px hsl(42 98% 56% / 0.12), inset 0 0 0 1px hsl(42 98% 56% / 0.15)',
                }}
            />

            {/* Photo area — 4:5 ratio */}
            <div className="relative aspect-[4/5] overflow-hidden">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--surface-2)), hsl(var(--surface-3)))',
                        }}
                    >
                        <span
                            className="text-[36px] font-black opacity-20"
                            style={{color: 'hsl(var(--foreground))'}}
                        >
                            {displayName[0]?.toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Gradient overlay at bottom */}
                <div
                    className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                    style={{
                        background: 'linear-gradient(180deg, transparent 0%, hsl(220 18% 2% / 0.92) 100%)',
                    }}
                />

                {/* Online indicator */}
                {isOnline && (
                    <div className="absolute top-3 right-3 z-20">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                background: 'hsl(var(--emerald))',
                                boxShadow: '0 0 8px hsl(160 72% 40% / 0.6)',
                            }}
                        />
                    </div>
                )}

                {/* Available Now badge */}
                {availableNow && (
                    <div
                        className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1"
                        style={{
                            background: 'hsl(0 92% 54%)',
                            boxShadow: '0 2px 12px hsl(0 92% 54% / 0.4)',
                        }}
                    >
                        <Radio className="w-2.5 h-2.5 text-white animate-pulse" strokeWidth={2.5}/>
                        <span className="text-[8px] font-black tracking-[0.15em] uppercase text-white">
                            RIGHT NOW
                        </span>
                    </div>
                )}

                {/* Name + info overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 p-4 z-20">
                    <div className="flex items-center gap-1.5 mb-1">
                        <h3
                            className="text-[15px] font-black tracking-[-0.01em] leading-tight text-white truncate"
                        >
                            {displayName}
                        </h3>
                        {isVerified && (
                            <BadgeCheck
                                className="w-4 h-4 shrink-0"
                                style={{color: 'hsl(var(--cyan))'}}
                                strokeWidth={2}
                            />
                        )}
                        {isPremium && <CrownBadge size="sm"/>}
                    </div>
                    <div className="flex items-center gap-2">
                        {age !== undefined && (
                            <span className="text-[11px] font-semibold text-white/60">
                                {age}
                            </span>
                        )}
                        {distance && (
                            <>
                                {age !== undefined && (
                                    <span className="w-0.5 h-0.5 rounded-full bg-white/30"/>
                                )}
                                <span className="text-[11px] font-semibold text-white/60">
                                    {distance}
                                </span>
                            </>
                        )}
                        {isOnline && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-white/30"/>
                                <span
                                    className="text-[10px] font-bold uppercase tracking-wider"
                                    style={{color: 'hsl(var(--emerald))'}}
                                >
                                    Online
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
