// =====================================================
// DEEP LINK HANDLER — Custom scheme + Universal Links
// Handles fyking:// protocol and fyking.men universal links
// =====================================================

export interface DeepLinkRoute {
  /** Route path inside the app (e.g., '/app/chat/abc123') */
  path: string;
  /** Parsed query parameters */
  params: Record<string, string>;
  /** Original URL */
  raw: string;
}

/**
 * Registered deep link patterns.
 * Add new routes here as the app grows.
 */
const ROUTE_PATTERNS: Array<{
  pattern: RegExp;
  build: (match: RegExpMatchArray) => DeepLinkRoute;
}> = [
  // Profile view
  {
    pattern: /\/profile\/([a-z0-9-]+)/i,
    build: (m) => ({
      path: `/app/profile/${m[1]}`,
      params: { userId: m[1] },
      raw: m[0],
    }),
  },
  // Chat thread
  {
    pattern: /\/chat\/([a-z0-9-]+)/i,
    build: (m) => ({
      path: `/app/chat/${m[1]}`,
      params: { conversationId: m[1] },
      raw: m[0],
    }),
  },
  // Event detail
  {
    pattern: /\/events?\/([a-z0-9-]+)/i,
    build: (m) => ({
      path: `/app/events/${m[1]}`,
      params: { eventId: m[1] },
      raw: m[0],
    }),
  },
  // Grid / browse
  {
    pattern: /\/grid|\/browse/i,
    build: (m) => ({
      path: '/app/grid',
      params: {},
      raw: m[0],
    }),
  },
  // Right now feed
  {
    pattern: /\/right-now|\/meetnow/i,
    build: (m) => ({
      path: '/app/right-now',
      params: {},
      raw: m[0],
    }),
  },
  // Settings
  {
    pattern: /\/settings/i,
    build: (m) => ({
      path: '/app/settings',
      params: {},
      raw: m[0],
    }),
  },
  // Deep link with invite/referral code
  {
    pattern: /\/invite\/([a-z0-9]+)/i,
    build: (m) => ({
      path: '/connect',
      params: { referralCode: m[1] },
      raw: m[0],
    }),
  },
  // Home / connect
  {
    pattern: /^\/$|^\/connect$/i,
    build: (m) => ({
      path: '/connect',
      params: {},
      raw: m[0],
    }),
  },
];

/**
 * Parse a deep link URL into an app route.
 * Supports:
 *   - fyking://profile/abc123
 *   - https://fyking.men/profile/abc123
 *   - http://localhost:5173/app/chat/abc123 (dev)
 */
export function parseDeepLink(rawUrl: string): DeepLinkRoute | null {
  try {
    const url = new URL(rawUrl);

    // Normalize: strip scheme + host to get path
    const path = url.pathname + url.search;

    for (const route of ROUTE_PATTERNS) {
      const match = path.match(route.pattern);
      if (match) {
        const parsed = route.build(match);
        // Merge query params from URL
        url.searchParams.forEach((value, key) => {
          parsed.params[key] = value;
        });
        return parsed;
      }
    }

    return null;
  } catch {
    // Invalid URL — try as bare path
    for (const route of ROUTE_PATTERNS) {
      const match = rawUrl.match(route.pattern);
      if (match) {
        return route.build(match);
      }
    }
    return null;
  }
}

/**
 * Check if a URL is a deep link for this app.
 */
export function isDeepLink(url: string): boolean {
  return (
    url.startsWith('fyking://') ||
    url.includes('fyking.men') ||
    (url.startsWith('http') && parseDeepLink(url) !== null)
  );
}

/**
 * Handle an incoming deep link — called from App.tsx or a listener.
 * Returns the route to navigate to, or null if not recognized.
 */
export function handleDeepLink(rawUrl: string): DeepLinkRoute | null {
  const route = parseDeepLink(rawUrl);
  if (route) {
    // Dispatch a custom event so the router can pick it up
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('deeplink', { detail: route }),
      );
    }
  }
  return route;
}

/**
 * Register a universal link / app link listener.
 * Call once during app initialization.
 */
export function registerDeepLinkListener(): () => void {
  // Capacitor / native app deep links
  const handleUrl = (event: any) => {
    const url = event?.url ?? event?.detail?.url;
    if (url) handleDeepLink(url);
  };

  // Capacitor AppUrlOpen event
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable?.('App')) {
    (window as any).Capacitor.Plugins.App.addListener('appUrlOpen', handleUrl);
  }

  // Also handle browser visibility (PWA / universal links)
  const onVisibility = () => {
    if (document.visibilityState === 'visible' && window.location.search.includes('deep=')) {
      const deep = new URLSearchParams(window.location.search).get('deep');
      if (deep) handleDeepLink(deep);
    }
  };

  document.addEventListener('visibilitychange', onVisibility);

  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable?.('App')) {
      (window as any).Capacitor.Plugins.App.removeAllListeners?.();
    }
  };
}

export default {
  parseDeepLink,
  isDeepLink,
  handleDeepLink,
  registerDeepLinkListener,
};
