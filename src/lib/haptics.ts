// =====================================================
// HAPTICS — Native Capacitor + Web Vibration API
// Unified haptic feedback for mobile-first UX
// =====================================================

/**
 * Vibration pattern definitions (ms).
 * First element = vibrate, second = pause, etc.
 */
const PATTERNS = {
  tap: [10],
  success: [10, 50, 10, 50, 20],
  error: [50, 100, 50, 100, 50],
  selection: [5],
  warning: [30, 50, 30],
  heavy: [40],
  light: [8],
} as const;

type HapticType = keyof typeof PATTERNS;

/**
 * Detect if Capacitor Haptics plugin is available.
 * Lazy-checked at call time to avoid SSR issues.
 */
function getCapacitorHaptics(): any | null {
  try {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable?.('Haptics')) {
      return (window as any).Capacitor.Plugins.Haptics;
    }
  } catch {
    // Capacitor not loaded — fall back to web API
  }
  return null;
}

/**
 * Trigger haptic feedback.
 * Uses Capacitor Haptics plugin when available, falls back to navigator.vibrate().
 */
function trigger(type: HapticType): void {
  try {
    const haptics = getCapacitorHaptics();

    if (haptics) {
      // Map to Capacitor haptic types
      const capacitorMap: Record<HapticType, { style: string }> = {
        tap: { style: 'LIGHT' },
        light: { style: 'LIGHT' },
        success: { style: 'MEDIUM' },
        error: { style: 'HEAVY' },
        heavy: { style: 'HEAVY' },
        selection: { style: 'LIGHT' },
        warning: { style: 'MEDIUM' },
      };

      const method = type === 'selection' ? 'selectionChanged' : 'impact';
      haptics[method]?.(capacitorMap[type]);
      return;
    }

    // Web fallback: navigator.vibrate()
    if ('vibrate' in navigator) {
      navigator.vibrate(PATTERNS[type]);
    }
  } catch {
    // Silently degrade — haptics are non-critical
  }
}

/**
 * Public haptic API — call haptics.tap() etc.
 */
export const haptics = {
  /** Light haptic for button taps */
  tap: () => trigger('tap'),
  /** Notification haptic for success actions */
  success: () => trigger('success'),
  /** Heavy haptic for errors */
  error: () => trigger('error'),
  /** Subtle haptic for picker/slider changes */
  selection: () => trigger('selection'),
  /** Warning haptic */
  warning: () => trigger('warning'),
  /** Strong impact */
  heavy: () => trigger('heavy'),
  /** Very light feedback */
  light: () => trigger('light'),
};

export default haptics;
