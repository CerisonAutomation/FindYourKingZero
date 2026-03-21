import {motion} from 'framer-motion';
import {BadgeCheck, Crown, Heart, MapPin, MessageCircle, Star} from 'lucide-react';
import {cn} from '@/lib/utils';

// Support both mock Profile type and real database Profile type
interface ProfileCardProps {
    profile: {
        id?: string;
        user_id?: string;
        name?: string;
        display_name?: string | null;
        age?: number | null;
        location?: string;
        city?: string | null;
        country?: string | null;
        distance?: number;
        avatar?: string;
        avatar_url?: string | null;
        tribes?: string[];
        isOnline?: boolean;
        is_online?: boolean;
        isVerified?: boolean;
        is_verified?: boolean;
        isPremium?: boolean;
        is_available_now?: boolean;
        role?: 'seeker' | 'provider';
        hourly_rate?: number | null;
        rating?: number | null;
        reviewCount?: number;
        favorites_count?: number;
    };
    index?: number;
    onFavorite?: (id: string) => void;
    onMessage?: (id: string) => void;
    onClick?: (profile: any) => void;
    isFavorited?: boolean;
}

export function ProfileCard({
                                profile,
                                index = 0,
                                onFavorite,
                                onMessage,
                                onClick,
                                isFavorited = false
                            }: ProfileCardProps) {
    // Normalize profile data for both mock and real data
    const profileId = profile.user_id || profile.id || '';
    const name = profile.display_name || profile.name || 'User';
    const age = profile.age;
    const location = profile.city
        ? `${profile.city}${profile.country ? `, ${profile.country}` : ''}`
        : profile.location || 'Unknown';
    const avatar = profile.avatar_url || profile.avatar || '/placeholder.svg';
    const tribes = profile.tribes || [];
    const isOnline = profile.is_online ?? profile.isOnline ?? false;
    const isVerified = profile.is_verified ?? profile.isVerified ?? false;
    const isPremium = profile.is_available_now ?? profile.isPremium ?? false;
    const rating = profile.rating;
    const hourlyRate = profile.hourly_rate;

    return (
        <motion.div
            initial={{opacity: 0, y: 20, scale: 0.95}}
            animate={{opacity: 1, y: 0, scale: 1}}
            transition={{duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1]}}
            whileHover={{y: -4, transition: {duration: 0.2}}}
            className="group relative aspect-[3/4]  overflow-hidden cursor-pointer"
            onClick={() => onClick?.(profile)}
        >
            {/* Background Image with parallax effect */}
            <div className="absolute inset-0">
                <motion.img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    whileHover={{scale: 1.1}}
                    transition={{duration: 0.6}}
                />
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"/>
                <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
            </div>

            {/* Online Indicator - Animated */}
            {isOnline && (
                <motion.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1  glass border border-green-500/30"
                >
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{scale: [1, 1.2, 1], opacity: [1, 0.7, 1]}}
                        transition={{duration: 1.5, repeat: Infinity}}
                    />
                    <span className="text-xs font-medium text-green-400">Online</span>
                </motion.div>
            )}

            {/* Premium/Verified Badges */}
            <div className="absolute top-3 right-3 flex gap-1.5">
                {isPremium && (
                    <motion.div
                        whileHover={{scale: 1.1, rotate: 10}}
                        className="w-8 h-8 rounded-full bg-gold/20 backdrop-blur-md border border-gold/40 flex items-center justify-center shadow-lg"
                    >
                        <Crown className="w-4 h-4 text-gold"/>
                    </motion.div>
                )}
                {isVerified && (
                    <motion.div
                        whileHover={{scale: 1.1}}
                        className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center shadow-lg"
                    >
                        <BadgeCheck className="w-4 h-4 text-primary"/>
                    </motion.div>
                )}
            </div>

            {/* Hourly Rate Badge for Providers */}
            {hourlyRate && (
                <div className="absolute top-12 right-3 px-2 py-1    glass border border-gold/30">
                    <span className="text-xs font-bold text-gold">${hourlyRate}/hr</span>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 truncate">
                            {name}{age ? `, ${age}` : ''}
                        </h3>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0"/>
                            <span
                                className="truncate">{profile.distance ? `${profile.distance} mi away` : location}</span>
                        </div>

                        {/* Rating for providers */}
                        {rating && (
                            <div className="flex items-center gap-1 mt-2">
                                <Star className="w-3.5 h-3.5 fill-gold text-gold"/>
                                <span className="text-sm font-semibold text-gold">{rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions - Slide up on hover */}
                    <motion.div
                        className="flex gap-2"
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{delay: 0.1}}
                    >
                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            onClick={(e) => {
                                e.stopPropagation();
                                onMessage?.(profileId);
                            }}
                            className="w-10 h-10 rounded-full glass border border-border/50 flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                            <MessageCircle className="w-5 h-5 text-foreground"/>
                        </motion.button>
                        <motion.button
                            whileHover={{scale: 1.1}}
                            whileTap={{scale: 0.9}}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFavorite?.(profileId);
                            }}
                            className={cn(
                                "w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300",
                                isFavorited
                                    ? "bg-primary text-primary-foreground border-2 border-primary shadow-lg glow"
                                    : "glass border border-border/50 hover:border-primary/50 hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                            )}
                        >
                            <Heart
                                className={cn(
                                    "w-5 h-5 transition-all",
                                    isFavorited && "fill-current"
                                )}
                            />
                        </motion.button>
                    </motion.div>
                </div>

                {/* Tribes with animated reveal */}
                {tribes.length > 0 && (
                    <motion.div
                        className="flex flex-wrap gap-1.5 mt-3"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.2}}
                    >
                        {tribes.slice(0, 2).map((tribe) => (
                            <span
                                key={tribe}
                                className="px-2 py-0.5 text-xs font-medium  bg-muted/60 backdrop-blur-sm text-muted-foreground border border-border/30"
                            >
                {tribe}
              </span>
                        ))}
                        {tribes.length > 2 && (
                            <span
                                className="px-2 py-0.5 text-xs font-medium  bg-primary/10 text-primary border border-primary/20">
                +{tribes.length - 2}
              </span>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Hover glow effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"/>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/20 blur-3xl"/>
            </div>
        </motion.div>
    );
}
