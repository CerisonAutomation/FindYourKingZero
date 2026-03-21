import {motion} from 'framer-motion';
import {Heart, Sparkles} from 'lucide-react';
import {useFavorites} from '@/hooks/useFavorites';
import {ProfileCard} from '@/components/ui/ProfileCard';
import {ProfileGridSkeleton} from '@/components/ui/ProfileSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {Badge} from '@/components/ui/badge';

interface FavoritesTabProps {
    favorites: string[];
    onToggleFavorite: (id: string) => void;
    onStartChat: (profileId: string) => void;
    onViewProfile: (profileId: string) => void;
}

export function FavoritesTab({
                                 favorites,
                                 onToggleFavorite,
                                 onStartChat,
                                 onViewProfile
                             }: FavoritesTabProps) {
    // Use real favorites from database
    const {favorites: favoritedProfiles, isLoading, favoriteIds} = useFavorites();

    const onlineCount = favoritedProfiles.filter(p => p.is_online).length;

    return (
        <div className="min-h-screen pb-24">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/30">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Favorites</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {favoriteIds.length} saved {favoriteIds.length === 1 ? 'profile' : 'profiles'}
                            </p>
                        </div>
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center"
                            animate={{scale: [1, 1.05, 1]}}
                            transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
                        >
                            <Heart className="w-7 h-7 text-primary"/>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    {favoritedProfiles.length > 0 && (
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            className="flex items-center gap-4 mt-4"
                        >
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                                <span className="text-sm font-medium text-green-400">{onlineCount} online</span>
                            </div>
                            <Badge variant="secondary" className="gap-1.5">
                                <Sparkles className="w-3 h-3 text-primary"/>
                                {favoritedProfiles.length} saved
                            </Badge>
                        </motion.div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="p-4">
                {isLoading ? (
                    <ProfileGridSkeleton count={4}/>
                ) : favoritedProfiles.length > 0 ? (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    >
                        {favoritedProfiles.map((profile, index) => (
                            <ProfileCard
                                key={profile.user_id}
                                profile={profile}
                                index={index}
                                isFavorited={true}
                                onFavorite={onToggleFavorite}
                                onMessage={onStartChat}
                                onClick={() => onViewProfile(profile.user_id)}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <EmptyState
                        icon={Heart}
                        title="No favorites yet"
                        description="Start exploring and save profiles you like. They'll appear here for easy access."
                        actionLabel="Start Exploring"
                        onAction={() => {
                            // Navigate to explore tab would be handled by parent
                        }}
                    />
                )}
            </div>
        </div>
    );
}
