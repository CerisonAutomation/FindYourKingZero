/**
 * OfflineBanner — Network status indicator
 * Shows when offline; shows "back online" briefly on reconnection.
 * Respects safe area insets. 100% on-device — no server calls.
 */
import {useCallback, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Wifi, WifiOff} from 'lucide-react';

type NetState = 'online' | 'offline' | 'reconnected';

export function OfflineBanner() {
    const [netState, setNetState] = useState<NetState>('online');

    const goOnline = useCallback(() => {
        setNetState('reconnected');
        const t = setTimeout(() => setNetState('online'), 3000);
        return () => clearTimeout(t);
    }, []);

    const goOffline = useCallback(() => setNetState('offline'), []);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setNetState('offline');
        }
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, [goOnline, goOffline]);

    const visible = netState !== 'online';

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key={netState}
                    initial={{y: -40, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    exit={{y: -40, opacity: 0}}
                    transition={{type: 'spring', damping: 28, stiffness: 340}}
                    className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4"
                    style={{
                        paddingTop: 'max(10px, env(safe-area-inset-top))',
                        paddingBottom: '10px',
                        background: netState === 'reconnected'
                            ? 'hsl(142 72% 24% / 0.97)'
                            : 'hsl(0 72% 38% / 0.97)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 4px 24px hsl(0 0% 0% / 0.4)',
                    }}
                    role="alert"
                    aria-live="assertive"
                >
                    {netState === 'reconnected' ? (
                        <>
                            <Wifi className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2}/>
                            <span className="text-[11px] font-bold text-white tracking-wide">
                                Back online
                            </span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-3.5 h-3.5 text-white shrink-0" strokeWidth={2}/>
                            <span className="text-[11px] font-bold text-white tracking-wide">
                                No connection — AI features still work offline
                            </span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default OfflineBanner;
