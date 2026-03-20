import {useCallback, useEffect, useState} from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;

    prompt(): Promise<void>;
}

interface PWAState {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    canPrompt: boolean;
    install: () => Promise<boolean>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWA(): PWAState {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    useEffect(() => {
        // Check if already installed
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsInstalled(standalone);

        const handler = (e: Event) => {
            e.preventDefault();
            deferredPrompt = e as BeforeInstallPromptEvent;
            setIsInstallable(true);
        };

        const installedHandler = () => setIsInstalled(true);

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const install = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;
        await deferredPrompt.prompt();
        const {outcome} = await deferredPrompt.userChoice;
        deferredPrompt = null;
        setIsInstallable(false);
        if (outcome === 'accepted') {
            setIsInstalled(true);
            return true;
        }
        return false;
    }, []);

    return {
        isInstallable,
        isInstalled,
        isIOS,
        isAndroid,
        canPrompt: isInstallable || isIOS,
        install,
    };
}
