import {useEffect, useState} from 'react';
import {useProfile} from './useProfile';

export const useOnboarding = () => {
    const {profile, isLoading} = useProfile();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    useEffect(() => {
        // Check local storage first
        const seen = localStorage.getItem('onboarding_completed');
        if (seen) {
            setHasSeenOnboarding(true);
            return;
        }

        // If profile exists and has minimal info, they need onboarding
        if (!isLoading && profile) {
            const needsOnboarding = !profile.display_name ||
                (!profile.avatar_url && !profile.bio);

            if (needsOnboarding && !hasSeenOnboarding) {
                setShowOnboarding(true);
            }
        }
    }, [profile, isLoading, hasSeenOnboarding]);

    const completeOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        setShowOnboarding(false);
        setHasSeenOnboarding(true);
    };

    const skipOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        setShowOnboarding(false);
        setHasSeenOnboarding(true);
    };

    const resetOnboarding = () => {
        localStorage.removeItem('onboarding_completed');
        setHasSeenOnboarding(false);
        setShowOnboarding(true);
    };

    return {
        showOnboarding,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
        isLoading,
    };
};
