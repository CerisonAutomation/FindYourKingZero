import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Navigate, Route, Routes, useLocation} from "react-router-dom";
import {AuthProvider, useAuth} from "@/auth";
import {ErrorBoundary} from "./components/ui/ErrorBoundary";
import {OfflineBanner} from "@/components/ui/OfflineBanner";
import {lazy, Suspense, useEffect} from "react";
import {log} from '@/lib/logger';
import {AIAvatarOrb} from "@/components/ai";
import {registerDeepLinkListener} from "@/lib/deeplinks";
import {AnimatePresence, motion} from "framer-motion";
import {PublicRoute} from "@/auth";
// Eager loaded critical components
import HomePage from "./pages/HomePage";
import ConnectPage from "./pages/ConnectPage";
import AppLayout from "./pages/AppLayout";
import NotFound from "./pages/NotFound";
import InstallPage from "./pages/InstallPage";

// Constants for route configuration
const ROUTES = {
  PUBLIC: {
    HOME: "/",
    INSTALL: "/install",
    CONNECT: "/connect",
    AUTH: {
      SIGN_IN: "/auth/sign-in",
      SIGN_UP: "/auth/sign-up",
      MAGIC_LINK: "/auth/magic-link",
      RESET_PASSWORD: "/auth/reset-password",
      CALLBACK: "/auth/callback"
    },
    LEGAL: {
      PRIVACY: "/legal/privacy",
      TERMS: "/legal/terms",
      COOKIES: "/legal/cookies",
      COMMUNITY_GUIDELINES: "/legal/community-guidelines"
    },
    SAFETY: {
      QUICK_TIPS: "/safety/quick-tips"
    }
  },
  ONBOARDING: "/onboarding",
  APP: "/app"
} as const;

// Lazy loaded components for performance
const LazyComponents = {
  // Legal pages
  PrivacyPolicy: lazy(() => import("./pages/PrivacyPolicy")),
  TermsOfService: lazy(() => import("./pages/TermsOfService")),
  CookiePolicy: lazy(() => import("./pages/CookiePolicy")),
  CommunityGuidelines: lazy(() => import("./pages/CommunityGuidelines")),
  SafetyTips: lazy(() => import("./pages/SafetyTips")),

  // Authentication pages
  SignIn: lazy(() => import("./pages/auth/SignIn")),
  SignUp: lazy(() => import("./pages/auth/SignUp")),
  MagicLink: lazy(() => import("./pages/auth/MagicLink")),
  ResetPassword: lazy(() => import("./pages/auth/ResetPassword")),
  Callback: lazy(() => import("./pages/auth/Callback")),

  // Onboarding flow
  OnboardingWelcome: lazy(() => import("@/features/onboarding/pages/OnboardingWelcome")),
  OnboardingBasics: lazy(() => import("@/features/onboarding/pages/OnboardingBasics")),
  OnboardingPhotos: lazy(() => import("@/features/onboarding/pages/OnboardingPhotos")),
  OnboardingTribes: lazy(() => import("@/features/onboarding/pages/OnboardingTribes")),
  OnboardingPreferences: lazy(() => import("@/features/onboarding/pages/OnboardingPreferences")),
  OnboardingLocation: lazy(() => import("@/features/onboarding/pages/OnboardingLocation")),
  OnboardingPrivacy: lazy(() => import("@/features/onboarding/pages/OnboardingPrivacy")),
  OnboardingNotifications: lazy(() => import("@/features/onboarding/pages/OnboardingNotifications")),
  OnboardingConsent: lazy(() => import("@/features/onboarding/pages/OnboardingConsent")),
  OnboardingFinish: lazy(() => import("@/features/onboarding/pages/OnboardingFinish")),

  // Core app features
  GridPage: lazy(() => import("@/features/grid/pages/GridPage")),
  RightNowFeed: lazy(() => import("@/features/rightNow/pages/RightNowFeed")),
  RightNowMap: lazy(() => import("@/features/rightNow/pages/RightNowMap")),
  MessagesPage: lazy(() => import("@/features/chat/pages/MessagesPage")),
  ChatThread: lazy(() => import("@/features/chat/pages/ChatThread")),
  RoomChatPage: lazy(() => import("@/features/chat/pages/RoomChatPage")),
  EventChatPage: lazy(() => import("@/features/chat/pages/EventChatPage")),
  EventsHub: lazy(() => import("@/features/events/pages/EventsHub")),
  EventDetail: lazy(() => import("@/features/events/pages/EventDetail")),
  CreateEvent: lazy(() => import("@/features/events/pages/CreateEvent")),

  // Profile management
  MePage: lazy(() => import("@/features/profile/pages/MePage")),
  EditProfile: lazy(() => import("@/features/profile/pages/EditProfile")),
  ProfilePhotosPage: lazy(() => import("@/features/profile/pages/ProfilePhotosPage")),
  ViewProfile: lazy(() => import("@/features/profile/pages/ViewProfile")),

  // User management
  NotificationsPage: lazy(() => import("@/features/notifications/pages/NotificationsPage")),
  SafetyPage: lazy(() => import("@/features/safety/pages/SafetyPage")),
  BlockedPage: lazy(() => import("@/features/safety/pages/BlockedPage")),
  ReportsPage: lazy(() => import("@/features/safety/pages/ReportsPage")),

  // Settings
  SettingsPage: lazy(() => import("@/features/settings/pages/SettingsPage")),
  SettingsAccount: lazy(() => import("@/features/settings/pages/SettingsAccount")),
  SettingsSecurity: lazy(() => import("@/features/settings/pages/SettingsSecurity")),
  SettingsPrivacy: lazy(() => import("@/features/settings/pages/SettingsPrivacy")),
  SettingsNotifications: lazy(() => import("@/features/settings/pages/SettingsNotifications")),
  SettingsContent: lazy(() => import("@/features/settings/pages/SettingsContent")),
  SubscriptionPage: lazy(() => import("@/features/settings/pages/SubscriptionPage")),

  // Admin dashboard
  AdminHome: lazy(() => import("@/features/admin/pages/AdminHome")),
  AdminReports: lazy(() => import("@/features/admin/pages/AdminReports")),
  AdminModeration: lazy(() => import("@/features/admin/pages/AdminModeration")),
  AdminAudit: lazy(() => import("@/features/admin/pages/AdminAudit")),
  AdminMetrics: lazy(() => import("@/features/admin/pages/AdminMetrics")),

  // Enterprise
  EnterprisePage: lazy(() => import("@/features/enterprise/pages/EnterprisePage")),

  // Additional features
  FavoritesPage: lazy(() => import("@/features/favorites/pages/FavoritesPage")),
  BookingsPage: lazy(() => import("@/features/bookings/pages/BookingsPage")),
  VerificationPage: lazy(() => import("@/features/verification/pages/VerificationPage")),
  AlbumsPage: lazy(() => import("@/features/albums/pages/AlbumsPage")),
  AnalyticsPage: lazy(() => import("@/features/analytics/pages/AnalyticsPage")),
  VoicePage: lazy(() => import("@/features/voice/pages/VoicePage")),
  AIPage: lazy(() => import("@/features/ai/pages/AIPage"))
};

// Enterprise Query Client Configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors
                if (error && 'status' in error && typeof error.status === 'number') {
                    if (error.status >= 400 && error.status < 500) {
                        return false;
                    }
                }
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 1,
        },
    },
});

// Enterprise Loading Component — Premium Gold Gradient Spinner
const LoadingSpinner = ({message = "Loading"}: {message?: string}) => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
            <div className="relative w-16 h-16">
                {/* Outer ring — gold gradient */}
                <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0%, #D4A853 25%, #F5D98A 40%, #D4A853 55%, transparent 75%)",
                        mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                    }}
                />
                {/* Inner glow pulse */}
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-500/15 to-yellow-600/10 animate-pulse"/>
                {/* Center crown icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-500/60 animate-pulse">
                        <path d="M2 17l3-9 5 5 2-8 2 8 5-5 3 9H2z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
            <p className="text-xs text-amber-500/70 tracking-[0.25em] uppercase animate-pulse font-medium">
                {message}
            </p>
        </div>
    </div>
);

// Route prefetch utility — preloads likely next chunks on idle/idle-hover
const prefetchRoute = (importFn: () => Promise<unknown>) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => importFn());
    } else {
        setTimeout(() => importFn(), 200);
    }
};

// Enterprise Route Guards — Using PublicRoute for marketing pages
const ProtectedRouteWrapper = ({children, requiredRole = "user"}: {
    children: React.ReactNode;
    requiredRole?: "user" | "admin";
}) => {
    const {user, isLoading} = useAuth();

    log.debug('ROUTE', 'Protected route check', {
        hasUser: !!user,
        isLoading,
        requiredRole
    });

    if (isLoading) return <LoadingSpinner message="Authenticating"/>;
    if (!user) {
        log.info('ROUTE', 'Redirecting unauthenticated user to connect');
        return <Navigate to={ROUTES.PUBLIC.CONNECT} replace/>;
    }

    // Future: Add role-based access control here
    if (requiredRole === "admin" && user.user_metadata?.role !== "admin") {
        log.warn('ROUTE', 'Access denied: insufficient permissions', {
            userId: user.id,
            requiredRole,
            userRole: user.user_metadata?.role
        });
        return <Navigate to={ROUTES.APP} replace/>;
    }

    return <>{children}</>;
};

// Scene Transition Wrapper — Animates route changes like cinematic scenes
const SceneRouteWrapper = ({children}: {children: React.ReactNode}) => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full h-full"
                style={{ willChange: 'transform, opacity' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

// Main App Routes Component
const AppRoutes = () => {
    const {user, isLoading} = useAuth();

    if (isLoading) {
        return <LoadingSpinner message="Initializing"/>;
    }

    log.info('ROUTE', 'App routes initialized', { hasUser: !!user });

    // Prefetch likely next routes on idle
    if (typeof window !== "undefined") {
        prefetchRoute(() => import("@/features/grid/pages/GridPage"));
        prefetchRoute(() => import("./pages/auth/SignIn"));
        prefetchRoute(() => import("./pages/auth/SignUp"));
    }

    return (
        <Suspense fallback={<LoadingSpinner/>}>
            <Routes>
                {/* Public Routes — Hide marketing when signed in */}
                <Route
                    path={ROUTES.PUBLIC.HOME}
                    element={
                        <PublicRoute>
                            <SceneRouteWrapper>
                                <HomePage/>
                            </SceneRouteWrapper>
                        </PublicRoute>
                    }
                />
                <Route path={ROUTES.PUBLIC.INSTALL} element={<SceneRouteWrapper><InstallPage/></SceneRouteWrapper>}/>
                <Route
                    path={ROUTES.PUBLIC.CONNECT}
                    element={
                        <PublicRoute redirectTo={ROUTES.APP + "/grid"}>
                            <SceneRouteWrapper>
                                <ConnectPage/>
                            </SceneRouteWrapper>
                        </PublicRoute>
                    }
                />

                {/* Authentication Routes — Hide when signed in */}
                <Route
                    path={ROUTES.PUBLIC.AUTH.SIGN_IN}
                    element={
                        <PublicRoute redirectTo={ROUTES.APP + "/grid"}>
                            <SceneRouteWrapper>
                                <LazyComponents.SignIn/>
                            </SceneRouteWrapper>
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.PUBLIC.AUTH.SIGN_UP}
                    element={
                        <PublicRoute redirectTo={ROUTES.APP + "/grid"}>
                            <SceneRouteWrapper>
                                <LazyComponents.SignUp/>
                            </SceneRouteWrapper>
                        </PublicRoute>
                    }
                />
                <Route path={ROUTES.PUBLIC.AUTH.MAGIC_LINK} element={<SceneRouteWrapper><LazyComponents.MagicLink/></SceneRouteWrapper>}/>
                <Route path={ROUTES.PUBLIC.AUTH.RESET_PASSWORD} element={<SceneRouteWrapper><LazyComponents.ResetPassword/></SceneRouteWrapper>}/>
                <Route path={ROUTES.PUBLIC.AUTH.CALLBACK} element={<SceneRouteWrapper><LazyComponents.Callback/></SceneRouteWrapper>}/>

                {/* Legal Routes */}
                <Route path={ROUTES.PUBLIC.LEGAL.PRIVACY} element={<SceneRouteWrapper><LazyComponents.PrivacyPolicy/></SceneRouteWrapper>}/>
                <Route path={ROUTES.PUBLIC.LEGAL.TERMS} element={<SceneRouteWrapper><LazyComponents.TermsOfService/></SceneRouteWrapper>}/>
                <Route path={ROUTES.PUBLIC.LEGAL.COOKIES} element={<SceneRouteWrapper><LazyComponents.CookiePolicy/></SceneRouteWrapper>}/>
                <Route path={ROUTES.PUBLIC.LEGAL.COMMUNITY_GUIDELINES} element={<SceneRouteWrapper><LazyComponents.CommunityGuidelines/></SceneRouteWrapper>}/>
                <Route path={ROUTES.PUBLIC.SAFETY.QUICK_TIPS} element={<SceneRouteWrapper><LazyComponents.SafetyTips/></SceneRouteWrapper>}/>

                {/* Legacy redirect routes */}
                <Route path="/privacy" element={<Navigate to={ROUTES.PUBLIC.LEGAL.PRIVACY} replace/>}/>
                <Route path="/terms" element={<Navigate to={ROUTES.PUBLIC.LEGAL.TERMS} replace/>}/>
                <Route path="/cookies" element={<Navigate to={ROUTES.PUBLIC.LEGAL.COOKIES} replace/>}/>

                {/* Onboarding Routes — Protected */}
                <Route path={ROUTES.ONBOARDING} element={<ProtectedRouteWrapper><LazyComponents.OnboardingWelcome/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/welcome"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingWelcome/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/basics"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingBasics/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/photos"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingPhotos/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/tribes-interests"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingTribes/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/preferences"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingPreferences/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/location"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingLocation/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/privacy"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingPrivacy/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/notifications"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingNotifications/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/consent"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingConsent/></ProtectedRouteWrapper>}/>
                <Route path={ROUTES.ONBOARDING + "/finish"} element={<ProtectedRouteWrapper><LazyComponents.OnboardingFinish/></ProtectedRouteWrapper>}/>

                {/* Protected App Routes with Scene Transitions */}
                <Route path={ROUTES.APP} element={<ProtectedRouteWrapper><AppLayout/></ProtectedRouteWrapper>}>
                    <Route index element={<Navigate to="grid" replace/>}/>
                    <Route path="grid" element={<SceneRouteWrapper><LazyComponents.GridPage/></SceneRouteWrapper>}/>
                    <Route path="right-now" element={<SceneRouteWrapper><LazyComponents.RightNowFeed/></SceneRouteWrapper>}/>
                    <Route path="right-now/map" element={<SceneRouteWrapper><LazyComponents.RightNowMap/></SceneRouteWrapper>}/>

                    {/* Communication */}
                    <Route path="messages" element={<SceneRouteWrapper><LazyComponents.MessagesPage/></SceneRouteWrapper>}/>
                    <Route path="chat/:conversationId" element={<SceneRouteWrapper><LazyComponents.ChatThread/></SceneRouteWrapper>}/>
                    <Route path="room/:roomId" element={<SceneRouteWrapper><LazyComponents.RoomChatPage/></SceneRouteWrapper>}/>
                    <Route path="events/:id/chat" element={<SceneRouteWrapper><LazyComponents.EventChatPage/></SceneRouteWrapper>}/>

                    {/* Events */}
                    <Route path="events" element={<SceneRouteWrapper><LazyComponents.EventsHub/></SceneRouteWrapper>}/>
                    <Route path="events/create" element={<SceneRouteWrapper><LazyComponents.CreateEvent/></SceneRouteWrapper>}/>
                    <Route path="events/:id" element={<SceneRouteWrapper><LazyComponents.EventDetail/></SceneRouteWrapper>}/>

                    {/* Profile */}
                    <Route path="profile/me" element={<SceneRouteWrapper><LazyComponents.MePage/></SceneRouteWrapper>}/>
                    <Route path="profile/me/edit" element={<SceneRouteWrapper><LazyComponents.EditProfile/></SceneRouteWrapper>}/>
                    <Route path="profile/me/photos" element={<SceneRouteWrapper><LazyComponents.ProfilePhotosPage/></SceneRouteWrapper>}/>
                    <Route path="profile/:userId" element={<SceneRouteWrapper><LazyComponents.ViewProfile/></SceneRouteWrapper>}/>

                    {/* User Management */}
                    <Route path="notifications" element={<SceneRouteWrapper><LazyComponents.NotificationsPage/></SceneRouteWrapper>}/>
                    <Route path="safety" element={<SceneRouteWrapper><LazyComponents.SafetyPage/></SceneRouteWrapper>}/>
                    <Route path="blocked" element={<SceneRouteWrapper><LazyComponents.BlockedPage/></SceneRouteWrapper>}/>
                    <Route path="reports" element={<SceneRouteWrapper><LazyComponents.ReportsPage/></SceneRouteWrapper>}/>

                    {/* Settings */}
                    <Route path="settings" element={<SceneRouteWrapper><LazyComponents.SettingsPage/></SceneRouteWrapper>}/>
                    <Route path="settings/account" element={<SceneRouteWrapper><LazyComponents.SettingsAccount/></SceneRouteWrapper>}/>
                    <Route path="settings/security" element={<SceneRouteWrapper><LazyComponents.SettingsSecurity/></SceneRouteWrapper>}/>
                    <Route path="settings/privacy" element={<SceneRouteWrapper><LazyComponents.SettingsPrivacy/></SceneRouteWrapper>}/>
                    <Route path="settings/notifications" element={<SceneRouteWrapper><LazyComponents.SettingsNotifications/></SceneRouteWrapper>}/>
                    <Route path="settings/content" element={<SceneRouteWrapper><LazyComponents.SettingsContent/></SceneRouteWrapper>}/>
                    <Route path="settings/subscription" element={<SceneRouteWrapper><LazyComponents.SubscriptionPage/></SceneRouteWrapper>}/>

                    {/* Admin Routes */}
                    <Route path="admin" element={<ProtectedRouteWrapper requiredRole="admin"><LazyComponents.AdminHome/></ProtectedRouteWrapper>}/>
                    <Route path="admin/reports" element={<ProtectedRouteWrapper requiredRole="admin"><LazyComponents.AdminReports/></ProtectedRouteWrapper>}/>
                    <Route path="admin/moderation" element={<ProtectedRouteWrapper requiredRole="admin"><LazyComponents.AdminModeration/></ProtectedRouteWrapper>}/>
                    <Route path="admin/audit" element={<ProtectedRouteWrapper requiredRole="admin"><LazyComponents.AdminAudit/></ProtectedRouteWrapper>}/>
                    <Route path="admin/metrics" element={<ProtectedRouteWrapper requiredRole="admin"><LazyComponents.AdminMetrics/></ProtectedRouteWrapper>}/>

                    {/* Additional Features */}
                    <Route path="favorites" element={<SceneRouteWrapper><LazyComponents.FavoritesPage/></SceneRouteWrapper>}/>
                    <Route path="bookings" element={<SceneRouteWrapper><LazyComponents.BookingsPage/></SceneRouteWrapper>}/>
                    <Route path="verification" element={<SceneRouteWrapper><LazyComponents.VerificationPage/></SceneRouteWrapper>}/>
                    <Route path="albums" element={<SceneRouteWrapper><LazyComponents.AlbumsPage/></SceneRouteWrapper>}/>
                    <Route path="analytics" element={<SceneRouteWrapper><LazyComponents.AnalyticsPage/></SceneRouteWrapper>}/>
                    <Route path="voice" element={<SceneRouteWrapper><LazyComponents.VoicePage/></SceneRouteWrapper>}/>
                    <Route path="ai" element={<SceneRouteWrapper><LazyComponents.AIPage/></SceneRouteWrapper>}/>
                    <Route path="enterprise" element={<SceneRouteWrapper><LazyComponents.EnterprisePage/></SceneRouteWrapper>}/>
                </Route>

                {/* Legacy redirects */}
                <Route path={ROUTES.APP + "/chills"} element={<Navigate to={ROUTES.APP + "/events?tab=plans"} replace/>}/>
                <Route path={ROUTES.APP + "/parties"} element={<Navigate to={ROUTES.APP + "/events?tab=parties"} replace/>}/>
                <Route path={ROUTES.APP + "/meetnow"} element={<Navigate to={ROUTES.APP + "/right-now"} replace/>}/>

                {/* 404 */}
                <Route path="*" element={<SceneRouteWrapper><NotFound/></SceneRouteWrapper>}/>
            </Routes>
        </Suspense>
    );
};

// Main App Component
const App = () => {
    log.info('APP', 'Application starting');

    // Register deep link listener on mount
    useEffect(() => {
        const cleanup = registerDeepLinkListener();
        return cleanup;
    }, []);

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Toaster/>
                <Sonner/>
                <OfflineBanner/>
                <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                    <AuthProvider>
                        <AppRoutes/>
                        {/* Global AI Avatar Orb - Premium Power Orb with Crown */}
                        <AIAvatarOrb
                            size="md"
                            position="fixed"
                            placement="bottom-right"
                            showChat={true}
                        />
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App;
