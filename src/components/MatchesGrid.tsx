import {motion} from 'framer-motion';
import {Crown, MessageSquare, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useMatches} from '@/hooks/useMatches';

interface MatchesGridProps {
    onViewProfile?: (userId: string) => void;
    onStartChat?: (userId: string) => void;
}

export const MatchesGrid = ({onViewProfile, onStartChat}: MatchesGridProps) => {
    const {matches, isLoading, matchCount} = useMatches();

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl"/>
                ))}
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-muted-foreground"/>
                </div>
                <h3 className="font-semibold mb-1">No matches yet</h3>
                <p className="text-sm text-muted-foreground">
                    Like profiles to start matching with your kings!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500"/>
                    <h3 className="font-semibold">Your Matches</h3>
                </div>
                <span className="text-sm text-muted-foreground">{matchCount} matches</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {matches.map((match, index) => (
                    <motion.div
                        key={match.id}
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{delay: index * 0.05}}
                        className="relative group"
                    >
                        <div
                            onClick={() => onViewProfile?.(match.matched_profile?.user_id || '')}
                            className="aspect-square rounded-xl overflow-hidden cursor-pointer"
                        >
                            <Avatar className="w-full h-full rounded-xl">
                                <AvatarImage
                                    src={match.matched_profile?.avatar_url || ''}
                                    alt={match.matched_profile?.display_name || ''}
                                    className="object-cover"
                                />
                                <AvatarFallback className="rounded-xl text-lg">
                                    {match.matched_profile?.display_name?.[0] || '?'}
                                </AvatarFallback>
                            </Avatar>

                            {/* Online indicator */}
                            {match.matched_profile?.is_online && (
                                <div
                                    className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500 border-2 border-background"/>
                            )}

                            {/* Overlay */}
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>

                            {/* Name */}
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-white text-sm font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {match.matched_profile?.display_name}
                                </p>
                            </div>
                        </div>

                        {/* Chat button */}
                        <Button
                            variant="default"
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartChat?.(match.matched_profile?.user_id || '');
                            }}
                        >
                            <MessageSquare className="h-4 w-4"/>
                        </Button>

                        {/* Match sparkle */}
                        <motion.div
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            transition={{delay: index * 0.05 + 0.2, type: 'spring'}}
                            className="absolute -top-1 -right-1"
                        >
                            <Sparkles className="h-4 w-4 text-yellow-400"/>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
