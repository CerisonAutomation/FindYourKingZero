# FIND YOUR KING — Complete App Blueprint

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vite + React)                  │
│  345 files · 90K lines · TypeScript · Tailwind · Framer     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages    │  │Components│  │  Hooks   │  │   Lib    │   │
│  │  (65)     │  │  (85)    │  │  (60)    │  │  (55)    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND (Supabase)                      │
│  30 tables · 6 edge functions · RLS · Realtime · Auth       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Postgres  │  │   Auth   │  │ Realtime │  │  Storage │   │
│  │  (RLS)   │  │  (PKCE)  │  │(WebSocket)│  │  (S3)   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                      P2P LAYER (Trystero)                    │
│  Nostr relays · Direct peer-to-peer · Offline-first         │
├─────────────────────────────────────────────────────────────┤
│                      PAYMENTS (Stripe)                       │
│  Checkout · Subscriptions · Webhooks                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 PAGES & ROUTES

### Public Routes (NOT authenticated)
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page — hero, features, CTA, stats |
| `/connect` | ConnectPage | Sign in / Sign up / Magic Link / Google OAuth |
| `/auth/sign-in` | SignIn | Dedicated sign-in page |
| `/auth/sign-up` | SignUp | Dedicated sign-up page |
| `/auth/magic-link` | MagicLink | Passwordless sign-in |
| `/auth/reset-password` | ResetPassword | Password reset form |
| `/auth/callback` | Callback | PKCE code exchange, profile creation |
| `/install` | InstallPage | PWA install prompt |
| `/legal/privacy` | PrivacyPolicy | GDPR privacy policy |
| `/legal/terms` | TermsOfService | Terms of service |
| `/legal/cookies` | CookiePolicy | Cookie policy |
| `/legal/community-guidelines` | CommunityGuidelines | Community rules |
| `/safety/quick-tips` | SafetyTips | Safety tips |

### Onboarding Routes (authenticated, no profile yet)
| Route | Component | Description |
|-------|-----------|-------------|
| `/onboarding` | OnboardingWelcome | Welcome screen |
| `/onboarding/basics` | OnboardingBasics | Name, age, bio |
| `/onboarding/photos` | OnboardingPhotos | Upload photos |
| `/onboarding/tribes-interests` | OnboardingTribes | Select tribes & interests |
| `/onboarding/preferences` | OnboardingPreferences | Looking for, age range |
| `/onboarding/location` | OnboardingLocation | Set location |
| `/onboarding/privacy` | OnboardingPrivacy | Privacy settings |
| `/onboarding/notifications` | OnboardingNotifications | Notification preferences |
| `/onboarding/consent` | OnboardingConsent | Terms & consent |
| `/onboarding/finish` | OnboardingFinish | Complete setup |

### Protected Routes (authenticated, has profile)
| Route | Component | Description |
|-------|-----------|-------------|
| `/app` | AppLayout | Shell — sidebar + bottom nav + content |
| `/app/grid` | GridPage | Profile grid — browse, filter, search |
| `/app/right-now` | RightNowFeed | Available now feed |
| `/app/right-now/map` | RightNowMap | Leaflet real-time map |
| `/app/messages` | MessagesPage | Conversation list |
| `/app/chat/:id` | ChatThread | 1:1 chat with messages |
| `/app/room/:id` | RoomChatPage | Group chat room |
| `/app/events` | EventsHub | Events list — parties, meetups |
| `/app/events/create` | CreateEvent | Create new event |
| `/app/events/:id` | EventDetail | Event details |
| `/app/events/:id/chat` | EventChatPage | Event group chat |
| `/app/profile/me` | MePage | Own profile view |
| `/app/profile/me/edit` | EditProfile | Edit profile |
| `/app/profile/me/photos` | ProfilePhotosPage | Manage photos |
| `/app/profile/:userId` | ViewProfile | View other user's profile |
| `/app/notifications` | NotificationsPage | Notifications list |
| `/app/favorites` | FavoritesPage | Favorited profiles |
| `/app/albums` | AlbumsPage | Photo albums |
| `/app/bookings` | BookingsPage | Bookings |
| `/app/verification` | VerificationPage | Photo verification |
| `/app/ai` | AIPage | AI assistant |
| `/app/voice` | VoicePage | Voice features |
| `/app/analytics` | AnalyticsPage | Usage analytics |
| `/app/safety` | SafetyPage | Safety center |
| `/app/blocked` | BlockedPage | Blocked users |
| `/app/reports` | ReportsPage | Reports |
| `/app/settings` | SettingsPage | Settings hub |
| `/app/settings/account` | SettingsAccount | Account settings |
| `/app/settings/security` | SettingsSecurity | Security settings |
| `/app/settings/privacy` | SettingsPrivacy | Privacy settings |
| `/app/settings/notifications` | SettingsNotifications | Notification settings |
| `/app/settings/content` | SettingsContent | Content preferences |
| `/app/settings/subscription` | SubscriptionPage | Subscription plans |
| `/app/admin` | AdminHome | Admin dashboard |
| `/app/admin/reports` | AdminReports | Admin reports |
| `/app/admin/moderation` | AdminModeration | Content moderation |
| `/app/admin/audit` | AdminAudit | Audit log |
| `/app/admin/metrics` | AdminMetrics | System metrics |

### Smart 404
| Route | Component | Description |
|-------|-----------|-------------|
| `*` | NotFound | Smart redirect — signed in → grid, signed out → home |

---

## 🧩 REUSABLE UI COMPONENTS

### App Shell
- **AppShell** — Wrapper with header, content, footer, error boundary
- **PageHeader** — Sticky glass header with back, title, actions
- **BottomNav** — Mobile bottom navigation (5 tabs)
- **OfflineBanner** — Shows when offline

### Content
- **ProfileCard** — Grid card with photo, name, badges, online dot
- **SwipeableCard** — Draggable profile card (swipe left/right)
- **EmptyState** — Empty list placeholder
- **Skeleton / SkeletonCard / SkeletonGrid** — Loading placeholders
- **LazyImage** — Intersection observer lazy loading

### Input
- **SearchBar** — Search with clear button
- **FilterBar** — Horizontal filter chips
- **CTAButton** — Primary/secondary/ghost button
- **GoldButton** — Gold gradient CTA

### Navigation
- **PageHeader** — Back + title + actions
- **Breadcrumb** — Navigation breadcrumbs

### Feedback
- **Toast / Toaster** — Notifications
- **ErrorBoundary** — Global error catch + retry
- **Progress** — Progress bars
- **Badge / CrownBadge** — Status badges

### Layout
- **Sheet** — Bottom sheet / side panel
- **Dialog** — Modal dialog
- **Drawer** — Slide-out drawer
- **Popover** — Floating content
- **Tooltip** — Hover info

---

## 🪝 HOOKS

### Auth
- **useAuth** — sign in, sign up, magic link, OAuth, sign out, session

### Profile
- **useProfile** — CRUD user profile
- **useProfileGrid** — Paginated profile grid with realtime
- **useProfilePhotos** — Photo management

### Social
- **useMatches** — Match detection
- **useFavorites** — Favorite/unfavorite profiles
- **useBlocks** — Block/unblock users
- **useReports** — Report users

### Chat
- **useMessages** — Send/receive messages
- **useConversations** — Conversation list
- **useChatRooms** — Group chat rooms
- **useQuickReply** — AI suggested replies
- **useReactions** — Message reactions
- **useVoiceNavigation** — Voice commands

### Events
- **useEvents** — Event CRUD
- **useParties** — Party management

### Location
- **useGeolocation** — GPS access
- **useLocation** — Location services
- **useRealtimeMap** — Real-time map markers
- **usePresence** — Online/offline status

### Payments
- **useSubscription** — Subscription management
- **usePayments** — Stripe payments
- **useBookings** — Booking management

### P2P
- **useP2PChat** — Peer-to-peer chat
- **useP2PDating** — P2P dating features
- **useP2PMatchmaking** — P2P matching
- **useVoiceQuickShare** — Voice-triggered file sharing

### Safety
- **useSafetyFeatures** — Safety tools
- **useConsent** — Consent management
- **useGDPR** — GDPR compliance

### Settings
- **useOnboarding** — Onboarding flow
- **useVerification** — Photo verification

### Utility
- **useDebounce** — Debounce values
- **useMediaQuery** — Responsive breakpoints
- **useLocalStorage** — Persistent state
- **useInfiniteScroll** — Infinite scroll
- **useSwipe** — Swipe gestures
- **useKeyboard** — Virtual keyboard detection
- **useVirtualScroll** — Virtual list rendering

---

## 🔄 USER FLOWS

### 1. Sign Up Flow
```
/connect → Enter email + password → Confirm → Email sent
→ Click email link → /auth/callback → Exchange code → Create profile
→ /onboarding → Fill profile → /app/grid
```

### 2. Sign In Flow
```
/connect → Enter email + password → Authenticate
→ /auth/callback → Restore session → /app/grid
```

### 3. Magic Link Flow
```
/connect → Toggle "Magic Link" → Enter email → Email sent
→ Click link → /auth/callback → Exchange code → /app/grid
```

### 4. Browse Profiles Flow
```
/app/grid → See profile cards → Tap card → /app/profile/:id
→ View profile → Like/Message/Favorite → Back to grid
```

### 5. Chat Flow
```
/app/messages → Tap conversation → /app/chat/:id
→ Send message → Real-time delivery → Read receipts
→ Quick share → Send photos/files
```

### 6. Events Flow
```
/app/events → Browse events → Tap event → /app/events/:id
→ View details → RSVP → Join event chat → /app/events/:id/chat
```

### 7. Settings Flow
```
/app/settings → Tap setting → /app/settings/[section]
→ Modify → Save → Back to settings
```

### 8. Subscription Flow
```
/app/settings/subscription → Choose plan → Stripe checkout
→ Payment success → Profile upgraded → Features unlocked
```

---

## 🗄️ DATABASE TABLES (30)

### Core
- **profiles** — User profiles (name, age, bio, photos, location, preferences)
- **users** — Auth users (email, created_at)
- **conversations** — Chat conversations (participant_a, participant_b)
- **messages** — Chat messages (content, sender, conversation, read_at)

### Social
- **matches** — User matches
- **favorites** — Favorited profiles
- **super_favorites** — Priority favorites with notes
- **blocks** — Blocked users
- **reports** — User reports
- **taps** — Profile taps/likes
- **profile_views** — Profile view tracking
- **friendships** — Friend connections
- **friend_requests** — Friend requests

### Content
- **albums** — Photo albums
- **album_photos** — Photos within albums
- **photos** — User photos
- **posts** — User posts
- **blog_posts** — Blog content

### Events
- **events** — Events (title, location, date, capacity)
- **event_attendees** — Event RSVPs
- **groups** — Groups
- **group_members** — Group members

### Chat
- **message_reactions** — Emoji reactions
- **message_templates** — Quick reply templates

### P2P
- **quickshare_albums** — Ephemeral file shares
- **voice_commands** — Voice command logs
- **ai_typing_responses** — AI reply suggestions

### User
- **user_kinks** — Kinks & limits
- **travel_mode** — Travel mode settings
- **subscriptions** — Stripe subscriptions
- **bookings** — Bookings
- **location_shares** — Real-time location sharing
- **notifications** — User notifications
- **push_subscriptions** — Push notification tokens
- **verification_documents** — Verification docs
- **verification_requests** — Verification requests
- **gdpr_consent_records** — GDPR consent
- **gdpr_data_requests** — Data export/delete requests

---

## 🔧 EDGE FUNCTIONS (6)

- **create-checkout** — Stripe checkout sessions
- **stripe-webhook** — Stripe webhook handler
- **voice-ai** — Voice command processing
- **quickshare-sign** — Ephemeral URL signing
- **moderation** — Content moderation
- **ai-chat** — AI chat responses

---

## 🔐 SECURITY

- **RLS** on all 30 tables
- **PKCE** auth flow
- **Cookie + localStorage** session persistence
- **Rate limiting** (5 attempts / 15s)
- **Content moderation** edge function
- **XSS prevention** in inputs
- **CSRF** via SameSite=Lax cookies
- **search_path** on all database functions

---

## 🌍 I18N

- **28 European languages** with full translations
- **Auto-detection** via cookie → URL → Accept-Language → timezone
- **16 currencies** with proper formatting
- **Cookie-persisted** preferences
