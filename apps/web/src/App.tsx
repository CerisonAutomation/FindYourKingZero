// ═══════════════════════════════════════════════════════════════
// APP.TSX — Production-grade root with error boundaries + lazy
// ═══════════════════════════════════════════════════════════════

import React, { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useNavStore, useAuthStore } from './store';
import { CommandPalette } from './components/ui/CommandPalette';
import { BottomNav } from './components/ui/index';

const Landing     = lazy(() => import('./screens/Landing'));
const SignIn      = lazy(() => import('./screens/SignIn'));
const SignUp      = lazy(() => import('./screens/SignUp'));
const Onboarding  = lazy(() => import('./screens/Onboarding'));
const Discover    = lazy(() => import('./screens/Discover'));
const ViewProfile = lazy(() => import('./screens/ViewProfile'));
const Messages    = lazy(() => import('./screens/Messages'));
const Chat        = lazy(() => import('./screens/Chat'));
const RightNow    = lazy(() => import('./screens/RightNow'));
const Events      = lazy(() => import('./screens/Events'));
const EventDetail = lazy(() => import('./screens/EventDetail'));
const Profile     = lazy(() => import('./screens/Profile'));
const EditProfile = lazy(() => import('./screens/EditProfile'));
const Notifications = lazy(() => import('./screens/Notifications'));
const Settings    = lazy(() => import('./screens/Settings'));
const Subscription = lazy(() => import('./screens/Subscription'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

const BOTTOM_NAV_SCREENS = ['discover', 'right-now', 'messages', 'events', 'profile'] as const;

interface ErrorState { hasError: boolean; error: Error | null }

class AppErrorBoundary extends React.Component<{ children: ReactNode }, ErrorState> {
  state: ErrorState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error('[App Error Boundary]', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060610', color: '#fff', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginBottom: 24 }}>{this.state.error?.message ?? 'An unexpected error occurred'}</p>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ padding: '12px 32px', background: 'linear-gradient(135deg,#E5192E,#FF4020)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CosmicBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 10% 0%,rgba(229,25,46,.1) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 90% 110%,rgba(37,99,235,.08) 0%,transparent 55%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,rgba(229,25,46,.9),rgba(37,99,235,.5),rgba(217,119,6,.4),transparent)', boxShadow: '0 0 18px rgba(229,25,46,.5)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(37,99,235,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.6) 1px,transparent 1px)', backgroundSize: '48px 48px', opacity: 0.012, maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 80%)' }} />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,.15)', borderTop: '2px solid #E5192E', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );
}

function ScreenRouter() {
  const screen = useNavStore((s) => s.screen);
  const screens: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
    landing: Landing, signin: SignIn, signup: SignUp, onboarding: Onboarding,
    discover: Discover, 'view-profile': ViewProfile, messages: Messages,
    chat: Chat, 'right-now': RightNow, events: Events, 'event-detail': EventDetail,
    profile: Profile, 'edit-profile': EditProfile, notifications: Notifications,
    settings: Settings, subscription: Subscription,
  };
  const Screen = screens[screen] ?? Landing;
  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Screen />
      </Suspense>
    </AppErrorBoundary>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const screen = useNavStore((s) => s.screen);

  useEffect(() => {
    if (isAuthenticated && screen === 'landing') {
      useNavStore.getState().go('discover');
    }
  }, []);

  const showNav = (BOTTOM_NAV_SCREENS as readonly string[]).includes(screen) && isAuthenticated;

  // dvh with vh fallback — must use style prop array trick via CSS var, not duplicate key
  const appHeight: React.CSSProperties = {
    maxWidth: 430,
    margin: '0 auto',
    width: '100%',
    height: '100vh',     // fallback for browsers without dvh
    display: 'flex',
    flexDirection: 'column',
    background: '#060610',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={appHeight}>
        <CosmicBg />
        <CommandPalette />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          <ScreenRouter />
        </div>
        {showNav && <BottomNav />}
        <Analytics />
        <SpeedInsights />
      </div>
    </QueryClientProvider>
  );
}
