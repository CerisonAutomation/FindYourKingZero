import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider, useAuth} from "./hooks/useAuth";
import {ErrorBoundary} from "./components/ui/ErrorBoundary";
import {OfflineBanner} from "@/components/ui/OfflineBanner";
import {lazy, Suspense, useEffect} from "react";
import {log} from '@/lib/enterprise/Logger';
import {VoiceAssistantButton} from "@/components/voice/VoiceAssistantButton";
import {registerDeepLinkListener} from "@/lib/deeplinks";

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

// Eager loaded critical components
import HomePage from "./pages/HomePage";
import ConnectPage from "./pages/ConnectPage";
import AppLayout from "./pages/AppLayout";
import NotFound from "./pages/NotFound";
import InstallPage from "./pages/InstallPage";

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
        (window as any).requestIdleCallback(() => importFn());
    } else {
        setTimeout(() => importFn(), 200);
    }
};

// Enterprise Route Guards
const ProtectedRoute = ({children, requiredRole = "user"}: {
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

// PublicRoute component (currently unused but available for future use)
// const PublicRoute = ({children}: {children: React.ReactNode}) => {
//     const {user, isLoading} = useAuth();
//
//     if (isLoading) return <LoadingSpinner message="Loading"/>;
//     if (user) {
//         log.info('ROUTE', 'Redirecting authenticated user to app');
//         return <Navigate to={ROUTES.APP + "/grid"} replace/>;
//     }
//
//     return <>{children}</>;
// };

// Route configuration helper (currently unused but available for future use)
// const createRoute = (path: string, Component: React.ComponentType, options?: {
//     protected?: boolean;
//     adminOnly?: boolean;
//     lazy?: boolean;
// }) => {
//     const WrappedComponent = options?.lazy ? (
//         <Suspense fallback={<LoadingSpinner/>}>
//             <Component/>
//         </Suspense>
//     ) : <Component/>;
//
//     const element = options?.protected ? (
//         <ProtectedRoute requiredRole={options.adminOnly ? "admin" : "user"}>
//             {WrappedComponent}
//         </ProtectedRoute>
//     ) : options?.protected === false ? (
//         <PublicRoute>{WrappedComponent}</PublicRoute>
//     ) : WrappedComponent;
//
//     return {path, element};
// };

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
                {/* Public Routes */}
                <Route
                    path={ROUTES.PUBLIC.HOME}
                    element={user ? <Navigate to={ROUTES.APP + "/grid"} replace/> : <HomePage/>}
                />
                <Route path={ROUTES.PUBLIC.INSTALL} element={<InstallPage/>}/>
                <Route
                    path={ROUTES.PUBLIC.CONNECT}
                    element={user ? <Navigate to={ROUTES.APP + "/grid"} replace/> : <ConnectPage/>}
                />

                {/* Authentication Routes */}
                <Route
                    path={ROUTES.PUBLIC.AUTH.SIGN_IN}
                    element={user ? <Navigate to={ROUTES.APP + "/grid"} replace/> : <LazyComponents.SignIn/>}
                />
                <Route
                    path={ROUTES.PUBLIC.AUTH.SIGN_UP}
                    element={user ? <Navigate to={ROUTES.APP + "/grid"} replace/> : <LazyComponents.SignUp/>}
                />
                <Route path={ROUTES.PUBLIC.AUTH.MAGIC_LINK} element={<LazyComponents.MagicLink/>}/>
                <Route path={ROUTES.PUBLIC.AUTH.RESET_PASSWORD} element={<LazyComponents.ResetPassword/>}/>
                <Route path={ROUTES.PUBLIC.AUTH.CALLBACK} element={<LazyComponents.Callback/>}/>

                {/* Legal Routes */}
                <Route path={ROUTES.PUBLIC.LEGAL.PRIVACY} element={<LazyComponents.PrivacyPolicy/>}/>
                <Route path={ROUTES.PUBLIC.LEGAL.TERMS} element={<LazyComponents.TermsOfService/>}/>
                <Route path={ROUTES.PUBLIC.LEGAL.COOKIES} element={<LazyComponents.CookiePolicy/>}/>
                <Route path={ROUTES.PUBLIC.LEGAL.COMMUNITY_GUIDELINES} element={<LazyComponents.CommunityGuidelines/>}/>
                <Route path={ROUTES.PUBLIC.SAFETY.QUICK_TIPS} element={<LazyComponents.SafetyTips/>}/>

                {/* Legacy redirect routes */}
                <Route path="/privacy" element={<Navigate to={ROUTES.PUBLIC.LEGAL.PRIVACY} replace/>}/>
                <Route path="/terms" element={<Navigate to={ROUTES.PUBLIC.LEGAL.TERMS} replace/>}/>
                <Route path="/cookies" element={<Navigate to={ROUTES.PUBLIC.LEGAL.COOKIES} replace/>}/>

                {/* Onboarding Routes */}
                <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><LazyComponents.OnboardingWelcome/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/welcome"} element={<ProtectedRoute><LazyComponents.OnboardingWelcome/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/basics"} element={<ProtectedRoute><LazyComponents.OnboardingBasics/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/photos"} element={<ProtectedRoute><LazyComponents.OnboardingPhotos/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/tribes-interests"} element={<ProtectedRoute><LazyComponents.OnboardingTribes/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/preferences"} element={<ProtectedRoute><LazyComponents.OnboardingPreferences/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/location"} element={<ProtectedRoute><LazyComponents.OnboardingLocation/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/privacy"} element={<ProtectedRoute><LazyComponents.OnboardingPrivacy/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/notifications"} element={<ProtectedRoute><LazyComponents.OnboardingNotifications/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/consent"} element={<ProtectedRoute><LazyComponents.OnboardingConsent/></ProtectedRoute>}/>
                <Route path={ROUTES.ONBOARDING + "/finish"} element={<ProtectedRoute><LazyComponents.OnboardingFinish/></ProtectedRoute>}/>

                {/* Protected App Routes */}
                <Route path={ROUTES.APP} element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
                    <Route index element={<Navigate to="grid" replace/>}/>
                    <Route path="grid" element={<LazyComponents.GridPage/>}/>
                    <Route path="right-now" element={<LazyComponents.RightNowFeed/>}/>
                    <Route path="right-now/map" element={<LazyComponents.RightNowMap/>}/>

                    {/* Communication */}
                    <Route path="messages" element={<LazyComponents.MessagesPage/>}/>
                    <Route path="chat/:conversationId" element={<LazyComponents.ChatThread/>}/>
                    <Route path="room/:roomId" element={<LazyComponents.RoomChatPage/>}/>
                    <Route path="events/:id/chat" element={<LazyComponents.EventChatPage/>}/>

                    {/* Events */}
                    <Route path="events" element={<LazyComponents.EventsHub/>}/>
                    <Route path="events/create" element={<LazyComponents.CreateEvent/>}/>
                    <Route path="events/:id" element={<LazyComponents.EventDetail/>}/>

                    {/* Profile */}
                    <Route path="profile/me" element={<LazyComponents.MePage/>}/>
                    <Route path="profile/me/edit" element={<LazyComponents.EditProfile/>}/>
                    <Route path="profile/me/photos" element={<LazyComponents.ProfilePhotosPage/>}/>
                    <Route path="profile/:userId" element={<LazyComponents.ViewProfile/>}/>

                    {/* User Management */}
                    <Route path="notifications" element={<LazyComponents.NotificationsPage/>}/>
                    <Route path="safety" element={<LazyComponents.SafetyPage/>}/>
                    <Route path="blocked" element={<LazyComponents.BlockedPage/>}/>
                    <Route path="reports" element={<LazyComponents.ReportsPage/>}/>

                    {/* Settings */}
                    <Route path="settings" element={<LazyComponents.SettingsPage/>}/>
                    <Route path="settings/account" element={<LazyComponents.SettingsAccount/>}/>
                    <Route path="settings/security" element={<LazyComponents.SettingsSecurity/>}/>
                    <Route path="settings/privacy" element={<LazyComponents.SettingsPrivacy/>}/>
                    <Route path="settings/notifications" element={<LazyComponents.SettingsNotifications/>}/>
                    <Route path="settings/content" element={<LazyComponents.SettingsContent/>}/>
                    <Route path="settings/subscription" element={<LazyComponents.SubscriptionPage/>}/>

                    {/* Admin Routes */}
                    <Route path="admin" element={<ProtectedRoute requiredRole="admin"><LazyComponents.AdminHome/></ProtectedRoute>}/>
                    <Route path="admin/reports" element={<ProtectedRoute requiredRole="admin"><LazyComponents.AdminReports/></ProtectedRoute>}/>
                    <Route path="admin/moderation" element={<ProtectedRoute requiredRole="admin"><LazyComponents.AdminModeration/></ProtectedRoute>}/>
                    <Route path="admin/audit" element={<ProtectedRoute requiredRole="admin"><LazyComponents.AdminAudit/></ProtectedRoute>}/>
                    <Route path="admin/metrics" element={<ProtectedRoute requiredRole="admin"><LazyComponents.AdminMetrics/></ProtectedRoute>}/>

                    {/* Additional Features */}
                    <Route path="favorites" element={<LazyComponents.FavoritesPage/>}/>
                    <Route path="bookings" element={<LazyComponents.BookingsPage/>}/>
                    <Route path="verification" element={<LazyComponents.VerificationPage/>}/>
                    <Route path="albums" element={<LazyComponents.AlbumsPage/>}/>
                    <Route path="analytics" element={<LazyComponents.AnalyticsPage/>}/>
                    <Route path="voice" element={<LazyComponents.VoicePage/>}/>
                    <Route path="ai" element={<LazyComponents.AIPage/>}/>
                </Route>

                {/* Legacy redirects */}
                <Route path={ROUTES.APP + "/chills"} element={<Navigate to={ROUTES.APP + "/events?tab=plans"} replace/>}/>
                <Route path={ROUTES.APP + "/parties"} element={<Navigate to={ROUTES.APP + "/events?tab=parties"} replace/>}/>
                <Route path={ROUTES.APP + "/meetnow"} element={<Navigate to={ROUTES.APP + "/right-now"} replace/>}/>

                {/* 404 */}
                <Route path="*" element={<NotFound/>}/>
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
                        {/* Global Voice Assistant - Floating */}
                        <VoiceAssistantButton
                            variant="floating"
                            showSettings={true}
                        />
                    </AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App;
