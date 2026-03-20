// Haptic feedback utility for mobile devices
export const haptic = {
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    },
    heavy: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    },
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 50, 10]);
        }
    },
    warning: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 50, 30]);
        }
    },
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 100, 50, 100, 50]);
        }
    },
};

// Hook for haptic feedback on button press
import {useCallback} from 'react';

export function useHaptic() {
    const trigger = useCallback((type: keyof typeof haptic = 'light') => {
        haptic[type]();
    }, []);

    return trigger;
}
