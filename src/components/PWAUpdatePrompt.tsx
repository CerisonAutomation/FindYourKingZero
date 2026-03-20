import {useEffect} from 'react';
import {useRegisterSW} from 'virtual:pwa-register/react';
import {useToast} from '@/hooks/use-toast';

/**
 * PWAUpdatePrompt — registers the service worker and shows a toast
 * when a new version is available.
 */
export function PWAUpdatePrompt() {
    const {toast} = useToast();
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(registration) {
            // Poll for updates every 60 minutes
            if (registration) {
                setInterval(() => registration.update(), 60 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.warn('SW registration error:', error);
        },
    });

    useEffect(() => {
        if (needRefresh) {
            toast({
                title: 'Update available',
                description: 'A new version of MACHOBB is ready.',
                duration: 10000,
                action: (
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                    >
                        Reload
                    </button>
                ) as any,
            });
        }
    }, [needRefresh, updateServiceWorker, toast]);

    return null;
}
