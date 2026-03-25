// APP.TSX — Production-grade root with error boundaries + lazy screens
import React, { Suspense, lazy, useEffect, type ReactNode, type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useNavStore, useAuthStore } from './store';
import { CommandPalette } from './components/ui/CommandPalette';
import { BottomNav } from './components/ui/index';
import CookieConsent from './components/ui/CookieConsent';
import { useAuthInit } from './hooks/useAuthInit';

// Lazy screens — typed as FC (never returns null at screen level)
const Landing      = lazy(() => import('./screens/Landing'));
const SignIn       = lazy(() => import('./screens/SignIn'));
const SignUp       = lazy(() => import('./screens/SignUp'));
const Onboarding   = lazy(() => import('./screens/Onboarding'));
const Discover     = lazy(() => import('./screens/Discover'));
const ViewProfile  = lazy(() => import('./screens/ViewProfile'));
const Messages     = lazy(() => import('./screens/Messages'));
const Chat         = lazy(() => import('./screens/Chat'));
const RightNow     = lazy(() => import('./screens/RightNow'));
const Events       = lazy(() => import('./screens/Events'));
const EventDetail  = lazy(() => import('./screens/EventDetail'));
const Profile      = lazy(() => import('./screens/Profile'));
const EditProfile  = lazy(() => import('./screens/EditProfile'));
const Notifications = lazy(() => import('./screens/Notifications'));
const Settings     = lazy(() => import('./screens/Settings'));
const Subscription = lazy(() => import('./screens/Subscription'));
// ── Enterprise screens (from old codebase merge) ──────────
const Safety       = lazy(() => import('./screens/Safety'));
const Admin        = lazy(() => import('./screens/Admin'));
const GDPR         = lazy(() => import('./screens/GDPR'));
const Analytics    = lazy(() => import('./screens/Analytics'));
const Albums       = lazy(() => import('./screens/Albums'));
const Voice        = lazy(() => import('./screens/Voice'));
const TravelMode   = lazy(() => import('./screens/TravelMode'));
const PrivacyPolicy = lazy(() => import('./screens/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./screens/TermsOfService'));
const CommunityGuidelines = lazy(() => import('./screens/CommunityGuidelines'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

const BOTTOM_NAV_SCREENS = ['discover', 'right-now', 'messages', 'events', 'profile'] as const;

// ── Error Boundary ────────────────────────────────────────────
interface ErrorState { hasError: boolean; error: Error | null }

class AppErrorBoundary extends React.Component<{ children: ReactNode }, ErrorState> {
  state: ErrorState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) { console.error('[App Error Boundary]', error); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060610', color: '#fff', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#E5192E' }}>!</div>
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

// ── Screen Router ────────────────────────────────────────────
type AnyScreen = React.LazyExoticComponent<FC>;

function ScreenRouter() {
  const screen = useNavStore((s) => s.screen);
  const screens: Record<string, AnyScreen> = {
    landing: Landing as AnyScreen, signin: SignIn as AnyScreen, signup: SignUp as AnyScreen,
    onboarding: Onboarding as AnyScreen, discover: Discover as AnyScreen,
    'view-profile': ViewProfile as AnyScreen, messages: Messages as AnyScreen,
    chat: Chat as AnyScreen, 'right-now': RightNow as AnyScreen,
    events: Events as AnyScreen, 'event-detail': EventDetail as AnyScreen,
    profile: Profile as AnyScreen, 'edit-profile': EditProfile as AnyScreen,
    notifications: Notifications as AnyScreen, settings: Settings as AnyScreen,
    subscription: Subscription as AnyScreen,
    // Enterprise screens
    safety: Safety as AnyScreen, admin: Admin as AnyScreen,
    gdpr: GDPR as AnyScreen, analytics: Analytics as AnyScreen,
    albums: Albums as AnyScreen, voice: Voice as AnyScreen,
    'travel-mode': TravelMode as AnyScreen,
    'privacy-policy': PrivacyPolicy as AnyScreen,
    'terms-of-service': TermsOfService as AnyScreen,
    'community-guidelines': CommunityGuidelines as AnyScreen,
  };
  const Screen = screens[screen] ?? Landing as AnyScreen;
  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Screen />
      </Suspense>
    </AppErrorBoundary>
  );
}

// ── App Shell (calls useAuthInit to restore session) ────────
function AppShell() {
  useAuthInit(); // Supabase session restore + auth state listener

  const { isAuthenticated } = useAuthStore();
  const screen = useNavStore((s) => s.screen);

  useEffect(() => {
    if (isAuthenticated && screen === 'landing') {
      useNavStore.getState().go('discover');
    }
  }, [isAuthenticated, screen]);

  const showNav = (BOTTOM_NAV_SCREENS as readonly string[]).includes(screen) && isAuthenticated;

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#060610', overflow: 'hidden', position: 'relative' }}>
      <CosmicBg />
      <CommandPalette />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <ScreenRouter />
      </div>
      {showNav && <BottomNav />}
      <CookieConsent />
      <VercelAnalytics />
      <SpeedInsights />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
