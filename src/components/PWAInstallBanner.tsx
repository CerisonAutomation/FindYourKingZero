import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Download, Share, X} from 'lucide-react';
import {usePWA} from '@/hooks/usePWA';

const DISMISSED_KEY = 'pwa-banner-dismissed';

export function PWAInstallBanner() {
    const {canPrompt, isInstalled, isIOS, install} = usePWA();
    const [visible, setVisible] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        if (isInstalled) return;
        const dismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (!dismissed && canPrompt) {
            // Show after 3s delay
            const t = setTimeout(() => setVisible(true), 3000);
            return () => clearTimeout(t);
        }
    }, [canPrompt, isInstalled]);

    const dismiss = () => {
        sessionStorage.setItem(DISMISSED_KEY, '1');
        setVisible(false);
    };

    const handleInstall = async () => {
        if (isIOS) {
            // Navigate to install page
            window.location.href = '/install';
            return;
        }
        setInstalling(true);
        await install();
        setInstalling(false);
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{y: 100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    exit={{y: 100, opacity: 0}}
                    transition={{type: 'spring', stiffness: 400, damping: 32}}
                    className="fixed bottom-[calc(var(--nav-h,60px)+env(safe-area-inset-bottom,0px)+12px)] left-3 right-3 z-[200]"
                >
                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border/30 shadow-2xl"
                        style={{
                            background: 'hsl(var(--card))',
                            boxShadow: '0 8px 40px hsl(0 0% 0% / 0.7)',
                        }}
                    >
                        {/* Icon */}
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{background: 'var(--gradient-primary)'}}
                        >
                            <span className="text-white font-black text-sm">M</span>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">Add MACHOBB to Home Screen</p>
                            <p className="text-[10px] text-muted-foreground">
                                {isIOS ? 'Tap Share → Add to Home Screen' : 'Install for the full experience'}
                            </p>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={handleInstall}
                            disabled={installing}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black text-primary-foreground"
                            style={{background: 'var(--gradient-primary)'}}
                        >
                            {isIOS ? <Share className="w-3 h-3"/> : <Download className="w-3 h-3"/>}
                            {installing ? '...' : isIOS ? 'How' : 'Install'}
                        </button>

                        <button onClick={dismiss}
                                className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center">
                            <X className="w-3 h-3 text-muted-foreground"/>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
