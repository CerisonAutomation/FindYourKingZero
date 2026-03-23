// ═══════════════════════════════════════════════════════════════
// SERVICES: Haptic Feedback — Mobile vibration patterns
// From FINDYOURKING00 — premium UX touch
// ═══════════════════════════════════════════════════════════════

export const haptic = {
  light: () => { if ('vibrate' in navigator) navigator.vibrate(10); },
  medium: () => { if ('vibrate' in navigator) navigator.vibrate(20); },
  heavy: () => { if ('vibrate' in navigator) navigator.vibrate(30); },
  success: () => { if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]); },
  warning: () => { if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]); },
  error: () => { if ('vibrate' in navigator) navigator.vibrate([50, 100, 50, 100, 50]); },
  tap: () => { if ('vibrate' in navigator) navigator.vibrate(5); },
  match: () => { if ('vibrate' in navigator) navigator.vibrate([10, 30, 10, 30, 50]); },
  message: () => { if ('vibrate' in navigator) navigator.vibrate(15); },
};

export function useHaptic() {
  return {
    trigger: (type: keyof typeof haptic = 'light') => haptic[type](),
    onButtonPress: () => haptic.light(),
    onSwipe: () => haptic.medium(),
    onMatch: () => haptic.match(),
    onSendMessage: () => haptic.tap(),
  };
}
