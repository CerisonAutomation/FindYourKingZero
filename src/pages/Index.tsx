import {useCallback, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {BottomNav} from '@/components/ui/BottomNav';
import {ExploreTab} from '@/components/tabs/ExploreTab';
import {MessagesTab} from '@/components/tabs/MessagesTab';
import {FavoritesTab} from '@/components/tabs/FavoritesTab';
import {BookingsTab} from '@/components/tabs/BookingsTab';
import {ProfileTab} from '@/components/tabs/ProfileTab';
import {Toaster} from '@/components/ui/toaster';
import {useToast} from '@/hooks/use-toast';

const Index = () => {
    const [activeTab, setActiveTab] = useState('explore');
    const [favorites, setFavorites] = useState<string[]>(['1', '5']);
    const {toast} = useToast();

    const handleToggleFavorite = useCallback((id: string) => {
        setFavorites(prev => {
            const isFavorited = prev.includes(id);
            if (isFavorited) {
                toast({
                    title: "Removed from favorites",
                    description: "Profile has been removed from your favorites",
                });
                return prev.filter(f => f !== id);
            } else {
                toast({
                    title: "Added to favorites",
                    description: "Profile has been saved to your favorites",
                });
                return [...prev, id];
            }
        });
    }, [toast]);

    const handleStartChat = useCallback((profileId: string) => {
        setActiveTab('messages');
        toast({
            title: "Opening chat",
            description: "Starting conversation...",
        });
    }, [toast]);

    const handleViewProfile = useCallback((profileId: string) => {
        setActiveTab('explore');
    }, []);

    const renderTab = () => {
        switch (activeTab) {
            case 'explore':
                return (
                    <ExploreTab
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        onStartChat={handleStartChat}
                    />
                );
            case 'messages':
                return (
                    <MessagesTab
                        onViewProfile={handleViewProfile}
                    />
                );
            case 'favorites':
                return (
                    <FavoritesTab
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        onStartChat={handleStartChat}
                        onViewProfile={handleViewProfile}
                    />
                );
            case 'bookings':
                return (
                    <BookingsTab
                        onViewProfile={handleViewProfile}
                    />
                );
            case 'profile':
                return <ProfileTab/>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.2}}
                >
                    {renderTab()}
                </motion.div>
            </AnimatePresence>

            <BottomNav/>
            <Toaster/>
        </div>
    );
};

export default Index;
