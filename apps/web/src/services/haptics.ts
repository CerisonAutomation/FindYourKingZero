// haptics.ts — Haptic feedback via Vibration API
const vibe = (pattern: VibratePattern) => {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
};

export const haptics = {
  light:       () => vibe(10),
  medium:      () => vibe(20),
  heavy:       () => vibe([30, 10, 30]),
  success:     () => vibe([10, 50, 10]),
  warning:     () => vibe([20, 30, 20]),
  error:       () => vibe([50, 30, 50, 30, 50]),
  tap:         () => vibe(8),
  match:       () => vibe([10, 40, 10, 40, 80]),
  message:     () => vibe(15),
  sendMessage: () => vibe(15),
};

// ── Backwards-compat alias ─────────────────────────────────────
// Screens import { haptic } (singular) — keep both exports
export const haptic = haptics;
