import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider, useAuth} from "./hooks/useAuth";
import {ErrorBoundary} from "./components/ui/ErrorBoundary";
import {lazy, Suspense} from "react";

// Eager
import HomePage from "./pages/HomePage";
import ConnectPage from "./pages/ConnectPage";
import AppLayout from "./pages/AppLayout";
import NotFound from "./pages/NotFound";
import InstallPage from "./pages/InstallPage";

// Legal
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines"));
const SafetyTips = lazy(() => import("./pages/SafetyTips"));

// Auth pages
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const MagicLink = lazy(() => import("./pages/auth/MagicLink"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Callback = lazy(() => import("./pages/auth/Callback"));

// Onboarding
const OnboardingWelcome = lazy(() => import("@/features/onboarding/pages/OnboardingWelcome"));
const OnboardingBasics = lazy(() => import("@/features/onboarding/pages/OnboardingBasics"));
const OnboardingPhotos = lazy(() => import("@/features/onboarding/pages/OnboardingPhotos"));
const OnboardingTribes = lazy(() => import("@/features/onboarding/pages/OnboardingTribes"));
const OnboardingPreferences = lazy(() => import("@/features/onboarding/pages/OnboardingPreferences"));
const OnboardingLocation = lazy(() => import("@/features/onboarding/pages/OnboardingLocation"));
const OnboardingPrivacy = lazy(() => import("@/features/onboarding/pages/OnboardingPrivacy"));
const OnboardingNotifications = lazy(() => import("@/features/onboarding/pages/OnboardingNotifications"));
const OnboardingConsent = lazy(() => import("@/features/onboarding/pages/OnboardingConsent"));
const OnboardingFinish = lazy(() => import("@/features/onboarding/pages/OnboardingFinish"));

// App features
const GridPage = lazy(() => import("@/features/grid/pages/GridPage"));
const RightNowFeed = lazy(() => import("@/features/rightNow/pages/RightNowFeed"));
const RightNowMap = lazy(() => import("@/features/rightNow/pages/RightNowMap"));
const MessagesPage = lazy(() => import("@/features/chat/pages/MessagesPage"));
const ChatThread = lazy(() => import("@/features/chat/pages/ChatThread"));
const RoomChatPage = lazy(() => import("@/features/chat/pages/RoomChatPage"));
const EventChatPage = lazy(() => import("@/features/chat/pages/EventChatPage"));
const EventsHub = lazy(() => import("@/features/events/pages/EventsHub"));
const EventDetail = lazy(() => import("@/features/events/pages/EventDetail"));
const CreateEvent = lazy(() => import("@/features/events/pages/CreateEvent"));
const MePage = lazy(() => import("@/features/profile/pages/MePage"));
const EditProfile = lazy(() => import("@/features/profile/pages/EditProfile"));
const ProfilePhotosPage = lazy(() => import("@/features/profile/pages/ProfilePhotosPage"));
const ViewProfile = lazy(() => import("@/features/profile/pages/ViewProfile"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"));
const SafetyPage = lazy(() => import("@/features/safety/pages/SafetyPage"));
const BlockedPage = lazy(() => import("@/features/safety/pages/BlockedPage"));
const ReportsPage = lazy(() => import("@/features/safety/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
const SettingsAccount = lazy(() => import("@/features/settings/pages/SettingsAccount"));
const SettingsSecurity = lazy(() => import("@/features/settings/pages/SettingsSecurity"));
const SettingsPrivacy = lazy(() => import("@/features/settings/pages/SettingsPrivacy"));
const SettingsNotifications = lazy(() => import("@/features/settings/pages/SettingsNotifications"));
const SettingsContent = lazy(() => import("@/features/settings/pages/SettingsContent"));
const SettingsSubscription = lazy(() => import("@/features/settings/pages/SubscriptionPage"));

// Admin
const AdminHome = lazy(() => import("@/features/admin/pages/AdminHome"));
const AdminReports = lazy(() => import("@/features/admin/pages/AdminReports"));
const AdminModeration = lazy(() => import("@/features/admin/pages/AdminModeration"));
const AdminAudit = lazy(() => import("@/features/admin/pages/AdminAudit"));
const AdminMetrics = lazy(() => import("@/features/admin/pages/AdminMetrics"));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

const LoadingSpinner = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
                <div
                    className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"/>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-primary/20 animate-pulse"/>
                </div>
            </div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase animate-pulse">Loading</p>
        </div>
    </div>
);

const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
    const {user, isLoading} = useAuth();
    if (isLoading) return <LoadingSpinner/>;
    if (!user) return <Navigate to="/connect" replace/>;
    return <>{children}</>;
};

const AdminRoute = ({children}: { children: React.ReactNode }) => {
    const {user, isLoading} = useAuth();
    if (isLoading) return <LoadingSpinner/>;
    if (!user) return <Navigate to="/connect" replace/>;
    return <>{children}</>;
};

const AppRoutes = () => {
    const {user, isLoading} = useAuth();
    if (isLoading) return <LoadingSpinner/>;

    return (
        <Suspense fallback={<LoadingSpinner/>}>
            <Routes>
                {/* ── Public ── */}
                <Route path="/" element={user ? <Navigate to="/app/grid" replace/> : <HomePage/>}/>
                <Route path="/install" element={<InstallPage/>}/>
                <Route path="/connect" element={user ? <Navigate to="/app/grid" replace/> : <ConnectPage/>}/>
                <Route path="/auth/sign-in" element={user ? <Navigate to="/app/grid" replace/> : <SignIn/>}/>
                <Route path="/auth/sign-up" element={user ? <Navigate to="/app/grid" replace/> : <SignUp/>}/>
                <Route path="/auth/magic-link" element={<MagicLink/>}/>
                <Route path="/auth/reset-password" element={<ResetPassword/>}/>
                <Route path="/auth/callback" element={<Callback/>}/>

                {/* Legal */}
                <Route path="/legal/privacy" element={<PrivacyPolicy/>}/>
                <Route path="/legal/terms" element={<TermsOfService/>}/>
                <Route path="/legal/cookies" element={<CookiePolicy/>}/>
                <Route path="/legal/community-guidelines" element={<CommunityGuidelines/>}/>
                <Route path="/safety/quick-tips" element={<SafetyTips/>}/>
                <Route path="/privacy" element={<PrivacyPolicy/>}/>
                <Route path="/terms" element={<TermsOfService/>}/>
                <Route path="/cookies" element={<CookiePolicy/>}/>

                {/* ── Onboarding ── */}
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingWelcome/></ProtectedRoute>}/>
                <Route path="/onboarding/welcome" element={<ProtectedRoute><OnboardingWelcome/></ProtectedRoute>}/>
                <Route path="/onboarding/basics" element={<ProtectedRoute><OnboardingBasics/></ProtectedRoute>}/>
                <Route path="/onboarding/photos" element={<ProtectedRoute><OnboardingPhotos/></ProtectedRoute>}/>
                <Route path="/onboarding/profile-fields"
                       element={<ProtectedRoute><OnboardingTribes/></ProtectedRoute>}/>
                <Route path="/onboarding/tribes-interests"
                       element={<ProtectedRoute><OnboardingTribes/></ProtectedRoute>}/>
                <Route path="/onboarding/preferences"
                       element={<ProtectedRoute><OnboardingPreferences/></ProtectedRoute>}/>
                <Route path="/onboarding/location" element={<ProtectedRoute><OnboardingLocation/></ProtectedRoute>}/>
                <Route path="/onboarding/privacy" element={<ProtectedRoute><OnboardingPrivacy/></ProtectedRoute>}/>
                <Route path="/onboarding/notifications"
                       element={<ProtectedRoute><OnboardingNotifications/></ProtectedRoute>}/>
                <Route path="/onboarding/consent" element={<ProtectedRoute><OnboardingConsent/></ProtectedRoute>}/>
                <Route path="/onboarding/finish" element={<ProtectedRoute><OnboardingFinish/></ProtectedRoute>}/>

                {/* ── Protected App ── */}
                <Route path="/app" element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
                    <Route index element={<Navigate to="grid" replace/>}/>
                    <Route path="grid" element={<GridPage/>}/>
                    <Route path="right-now" element={<RightNowFeed/>}/>
                    <Route path="right-now/map" element={<RightNowMap/>}/>
                    <Route path="map" element={<RightNowMap/>}/>
                    <Route path="messages" element={<MessagesPage/>}/>
                    <Route path="chat/:conversationId" element={<ChatThread/>}/>
                    <Route path="room/:roomId" element={<RoomChatPage/>}/>
                    <Route path="events/:id/chat" element={<EventChatPage/>}/>
                    <Route path="events" element={<EventsHub/>}/>
                    <Route path="events/create" element={<CreateEvent/>}/>
                    <Route path="events/:id" element={<EventDetail/>}/>
                    <Route path="chills" element={<EventsHub/>}/>
                    <Route path="chills/create" element={<CreateEvent/>}/>
                    <Route path="chills/:id" element={<EventDetail/>}/>
                    <Route path="house-parties" element={<EventsHub/>}/>
                    <Route path="house-parties/create" element={<CreateEvent/>}/>
                    <Route path="house-parties/:id" element={<EventDetail/>}/>
                    <Route path="profile/me" element={<MePage/>}/>
                    <Route path="profile/me/edit" element={<EditProfile/>}/>
                    <Route path="profile/me/photos" element={<ProfilePhotosPage/>}/>
                    <Route path="profile/:userId" element={<ViewProfile/>}/>
                    <Route path="notifications" element={<NotificationsPage/>}/>
                    <Route path="safety" element={<SafetyPage/>}/>
                    <Route path="blocked" element={<BlockedPage/>}/>
                    <Route path="reports" element={<ReportsPage/>}/>
                    <Route path="settings" element={<SettingsPage/>}/>
                    <Route path="settings/account" element={<SettingsAccount/>}/>
                    <Route path="settings/security" element={<SettingsSecurity/>}/>
                    <Route path="settings/privacy" element={<SettingsPrivacy/>}/>
                    <Route path="settings/notifications" element={<SettingsNotifications/>}/>
                    <Route path="settings/content" element={<SettingsContent/>}/>
                    <Route path="settings/subscription" element={<SettingsSubscription/>}/>
                    {/* Admin */}
                    <Route path="admin" element={<AdminRoute><AdminHome/></AdminRoute>}/>
                    <Route path="admin/reports" element={<AdminRoute><AdminReports/></AdminRoute>}/>
                    <Route path="admin/moderation" element={<AdminRoute><AdminModeration/></AdminRoute>}/>
                    <Route path="admin/audit" element={<AdminRoute><AdminAudit/></AdminRoute>}/>
                    <Route path="admin/metrics" element={<AdminRoute><AdminMetrics/></AdminRoute>}/>
                </Route>

                {/* Legacy redirects */}
                <Route path="/app/chills" element={<Navigate to="/app/events?tab=plans" replace/>}/>
                <Route path="/app/parties" element={<Navigate to="/app/events?tab=parties" replace/>}/>
                <Route path="/app/meetnow" element={<Navigate to="/app/right-now" replace/>}/>

                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </Suspense>
    );
};

const App = () => (
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <BrowserRouter>
                    <AuthProvider>
                        <AppRoutes/>
                    </AuthProvider>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    </ErrorBoundary>
);

export default App;
