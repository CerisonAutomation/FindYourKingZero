import { useEffect, useState } from 'react';

export function PWAUpdatePrompt() {
  const [showReload, setShowReload] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowReload(true);
              }
            });
          }
        });
      });
    }
  }, []);

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-50">
      <p className="text-sm text-white mb-2">New version available!</p>
      <button
        onClick={() => registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })}
        className="bg-amber-400 text-black text-sm font-semibold px-4 py-2 rounded-lg"
      >
        Update
      </button>
    </div>
  );
}
