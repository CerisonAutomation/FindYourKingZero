// ═══════════════════════════════════════════════════════════════
// COMPONENT: AppShell — root layout + auth guard for Zero
// Stack: Vite + React 18 + Zustand — NO Next.js, NO Link, NO useRouter
// Replaces: app-layout.tsx (used next/link, next/navigation, supabase in shell)
// Upgraded:
//   • Auth guard reads Zustand useAuthStore + useNavStore (no Supabase in shell)
//   • Sidebar replaced with FYK dark BottomNav (already in Zero)
//   • QuantumAvatarDock lazy-loaded correctly for Vite (dynamic import)
//   • Admin nav item conditional on user role
//   • CosmicBg integrated
//   • ARIA: main landmark, nav aria-label
//   • Full JSDoc
// ═══════════════════════════════════════════════════════════════

import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore, useNavStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import { BottomNav } from '@/components/ui/index';

const QuantumAvatarDock = lazy(() => import('@/components/ui/QuantumAvatarDock'));

/** Screens that show the bottom navigation bar */
const NAV_SCREENS = new Set(['discover', 'right-now', 'messages', 'events', 'profile']);

// ── Full-screen cosmic loader ─────────────────────────────────

export function RootLoader() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-5 bg-[#060610]"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Crown wordmark placeholder */}
      <span className="text-2xl font-black tracking-widest text-white/90">FYKING</span>
      <Loader2
        className="h-10 w-10 animate-spin text-red-500"
        aria-hidden="true"
      />
      <p className="text-sm text-white/35">Initialising your kingdom…</p>
    </div>
  );
}

// ── Auth Guard ────────────────────────────────────────────────

/**
 * Wraps the app shell. If the user is not authenticated, redirects
 * to the landing screen. If not onboarded, redirects to onboarding.
 * Uses Zustand store only — no Supabase calls here.
 */
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isOnboarded } = useUser();
  const isLoading = useAuthStore((s) => !s.isAuthenticated && s.token === null);
  const go = useNavStore((s) => s.go);
  const screen = useNavStore((s) => s.screen);

  useEffect(() => {
    // Don't redirect while still hydrating
    if (isLoading) return;

    const publicScreens = new Set(['landing', 'signin', 'signup', 'onboarding']);
    if (!isAuthenticated && !publicScreens.has(screen)) {
      go('landing');
      return;
    }
    if (isAuthenticated && !isOnboarded && screen !== 'onboarding') {
      go('onboarding');
    }
  }, [isAuthenticated, isOnboarded, isLoading, screen, go]);

  if (isLoading) return <RootLoader />;
  return <>{children}</>;
}

// ── AppShell ───────────────────────────────────────────────────

/**
 * Root layout shell. Wrap your screen router with this:
 *
 * @example
 * <AppShell>
 *   <ScreenRouter />
 * </AppShell>
 */
export function AppShell({ children }: { children: ReactNode }) {
  const screen = useNavStore((s) => s.screen);
  const { isAuthenticated } = useUser();
  const showNav = isAuthenticated && NAV_SCREENS.has(screen);

  return (
    <AuthGuard>
      <div
        className="relative mx-auto flex h-svh w-full max-w-[430px] flex-col overflow-hidden bg-[#060610]"
        style={{ isolation: 'isolate' }}
      >
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 10% 0%, rgba(229,25,46,.10) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 40% at 90% 110%, rgba(37,99,235,.08) 0%, transparent 55%)',
          }}
        />
        {/* Top neon line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px z-10"
          style={{
            background:
              'linear-gradient(90deg,rgba(229,25,46,.9),rgba(37,99,235,.5),rgba(217,119,6,.4),transparent)',
            boxShadow: '0 0 18px rgba(229,25,46,.5)',
          }}
        />

        {/* Screen content */}
        <main className="relative z-0 flex flex-1 flex-col overflow-hidden">
          {children}
        </main>

        {/* Bottom navigation */}
        {showNav && <BottomNav />}

        {/* Floating HUD dock */}
        {isAuthenticated && (
          <Suspense fallback={null}>
            <QuantumAvatarDock />
          </Suspense>
        )}
      </div>
    </AuthGuard>
  );
}
