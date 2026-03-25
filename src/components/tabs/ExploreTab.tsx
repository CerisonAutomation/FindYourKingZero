import {useCallback, useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {RefreshCw, Search, SlidersHorizontal, Sparkles, Users} from 'lucide-react';
import {ProfileCard} from '@/components/ProfileCard';
import {FilterDialog} from '@/components/FilterDialog';
import {ProfileDetail} from '@/components/ProfileDetail';
import {ProfileGridSkeleton} from '@/components/ui/ProfileSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import type {Profile} from '@/hooks/useProfile';
import {useProfiles} from '@/hooks/useProfile';
import {useBlocks} from '@/hooks/useBlocks';
import type {FilterPreferences} from '@/types';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';

interface ExploreTabProps {
    favorites: string[];
    onToggleFavorite: (id: string) => void;
    onStartChat: (profileId: string) => void;
}

export function ExploreTab({favorites, onToggleFavorite, onStartChat}: ExploreTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [filters, setFilters] = useState<FilterPreferences>({
        ageRange: [18, 60],
        distanceRadius: 50,
        tribes: [],
        lookingFor: [],
        showOnlineOnly: false,
        showVerifiedOnly: false,
    });

    // Fetch real profiles from database
    const {data: profiles, isLoading, refetch, isRefetching} = useProfiles({
        minAge: filters.ageRange[0],
        maxAge: filters.ageRange[1],
        isOnline: filters.showOnlineOnly || undefined,
        isVerified: filters.showVerifiedOnly || undefined,
        tribes: filters.tribes.length > 0 ? filters.tribes : undefined,
    });

    // Get blocked users to filter them out
    const {blocks} = useBlocks();
    const blockedIds = blocks.map(b => b.blocked_id);

    const filteredProfiles = useMemo(() => {
        if (!profiles) return [];

        return profiles
            .filter((profile) => {
                // Filter out blocked users
                if (blockedIds.includes(profile.user_id)) return false;

                // Search filter
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const name = (profile.display_name || '').toLowerCase();
                    const city = (profile.city || '').toLowerCase();
                    const bio = (profile.bio || '').toLowerCase();
                    if (!name.includes(query) && !city.includes(query) && !bio.includes(query)) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                // Sort by online status first, then by last_seen
                if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
                return new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime();
            });
    }, [profiles, searchQuery, blockedIds]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) count++;
        if (filters.distanceRadius !== 50) count++;
        if (filters.tribes.length > 0) count++;
        if (filters.lookingFor.length > 0) count++;
        if (filters.showOnlineOnly) count++;
        if (filters.showVerifiedOnly) count++;
        return count;
    }, [filters]);

    const onlineCount = useMemo(() => {
        return filteredProfiles.filter(p => p.is_online).length;
    }, [filteredProfiles]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Convert database profile to display format for ProfileDetail
    const convertToDisplayProfile = (profile: Profile) => ({
        id: profile.user_id,
        name: profile.display_name || 'User',
        age: profile.age || 0,
        location: profile.city ? `${profile.city}${profile.country ? `, ${profile.country}` : ''}` : 'Unknown',
        avatar: profile.avatar_url || '/placeholder.svg',
        photos: profile.avatar_url ? [profile.avatar_url] : [],
        bio: profile.bio || '',
        height: profile.height ? `${Math.floor(profile.height / 12)}'${profile.height % 12}"` : undefined,
        weight: profile.weight ? `${profile.weight} lbs` : undefined,
        tribes: profile.tribes || [],
        lookingFor: profile.looking_for || [],
        isOnline: profile.is_online,
        isVerified: profile.is_verified,
        isPremium: profile.is_available_now,
        role: 'seeker' as const,
        hourlyRate: profile.hourly_rate || undefined,
        rating: profile.rating,
    });

    return (
        <div className="min-h-screen pb-24">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/30">
                <div className="px-4 py-4">
                    {/* Search Row */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                            <Input
                                type="text"
                                placeholder="Search by name, city, or bio..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowFilters(true)}
                            className="relative shrink-0 h-11 w-11"
                        >
                            <SlidersHorizontal className="w-5 h-5"/>
                            {activeFiltersCount > 0 && (
                                <motion.span
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-lg"
                                >
                                    {activeFiltersCount}
                                </motion.span>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            className="shrink-0 h-11 w-11"
                        >
                            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`}/>
                        </Button>
                    </div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        className="flex items-center justify-between mt-3"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-green-500"
                                        animate={{scale: [1, 1.2, 1]}}
                                        transition={{duration: 1.5, repeat: Infinity}}
                                    />
                                    <span className="text-sm font-medium text-green-400">{onlineCount} online</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Users className="w-4 h-4"/>
                                <span>{filteredProfiles.length} profiles</span>
                            </div>
                        </div>

                        <Badge variant="secondary" className="gap-1.5">
                            <Sparkles className="w-3 h-3 text-primary"/>
                            Live
                        </Badge>
                    </motion.div>
                </div>
            </header>

            {/* Profile Grid */}
            <div className="p-4">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <ProfileGridSkeleton count={8}/>
                    ) : filteredProfiles.length > 0 ? (
                        <motion.div
                            key="profiles"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {filteredProfiles.map((profile, index) => (
                                <ProfileCard
                                    key={profile.user_id}
                                    profile={profile}
                                    index={index}
                                    isFavorited={favorites.includes(profile.user_id)}
                                    onFavorite={onToggleFavorite}
                                    onMessage={onStartChat}
                                    onClick={() => setSelectedProfile(profile)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState
                            icon={Search}
                            title="No profiles found"
                            description="Try adjusting your filters or search terms to discover more people."
                            actionLabel="Reset Filters"
                            onAction={() => {
                                setSearchQuery('');
                                setFilters({
                                    ageRange: [18, 60],
                                    distanceRadius: 50,
                                    tribes: [],
                                    lookingFor: [],
                                    showOnlineOnly: false,
                                    showVerifiedOnly: false,
                                });
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Filter Dialog */}
            <FilterDialog
                open={showFilters}
                onOpenChange={setShowFilters}
                filters={filters}
                onFiltersChange={setFilters}
            />

            {/* Profile Detail Sheet */}
            {selectedProfile && (
                <ProfileDetail
                    profile={convertToDisplayProfile(selectedProfile)}
                    open={!!selectedProfile}
                    onOpenChange={(open) => !open && setSelectedProfile(null)}
                    isFavorited={favorites.includes(selectedProfile.user_id)}
                    onFavorite={onToggleFavorite}
                    onMessage={onStartChat}
                />
            )}
        </div>
    );
}
