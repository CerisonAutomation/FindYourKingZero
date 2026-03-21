// =====================================================
// OFFLINE BANNER — Shows when network is unavailable
// Auto-hides when back online. Respects safe area insets.
// =====================================================
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  const goOnline = useCallback(() => setIsOffline(false), []);
  const goOffline = useCallback(() => setIsOffline(true), []);

  useEffect(() => {
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [goOnline, goOffline]);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2.5 bg-destructive/95 backdrop-blur-md text-destructive-foreground py-3 px-4 shadow-lg"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
          role="alert"
          aria-live="assertive"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">
            You&apos;re offline — check your connection
          </span>
          <Wifi className="w-4 h-4 shrink-0 animate-pulse opacity-50" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineBanner;
