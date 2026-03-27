/**
 * =============================================================================
 * CANONICAL HOOKS SYSTEM v15.0 — Enterprise-Grade React Hooks Consolidation
 * =============================================================================
 *
 * Consolidates ALL React hooks into ONE canonical source.
 * Clean barrel exports from the hooks directory for simplified imports.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA | Enterprise Production
 *
 * @module hooks
 * @version 15.0.0
 */

// =============================================================================
// CORE AUTH HOOK (From Consolidated Auth System)
// =============================================================================
export {
  useAuth,
  useAuthStatus,
  useRequireAuth,
  useAuthStore,
  AuthProvider,
  AuthContext,
  ProtectedRoute,
  PublicRoute,
  RoleRoute,
  authService,
  biometricAuth,
  BiometricAuthService,
  supabase,
  classifyAuthError,
  authQueryKeys,
  useAuthSessionQuery,
  useSignInMutation,
  useSignOutMutation,
} from '@/auth';

export type {
  AuthContextType,
  AuthState,
  UserRole,
  UserPermissions,
  SubscriptionTier,
  AuthErrorCode,
  ClassifiedAuthError,
  BiometricResult,
  RouteGuardConfig,
} from '@/auth';

// =============================================================================
// UI & INTERACTION HOOKS
// =============================================================================
export { useToast } from './use-toast';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouchDevice,
  useIsPortrait,
  useBreakpoint,
  useWindowSize,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useResponsiveValue,
} from './useMediaQuery';
export { useDebounce } from './useDebounce';
export { useKeyboard } from './useKeyboard';
export { useLocalStorage } from './useLocalStorage';

// =============================================================================
// DATA & STATE MANAGEMENT HOOKS
// =============================================================================
export { useProfile } from './useProfile';
export { useConversations } from './useConversations';
export { useMessages } from './useMessages';
export {
  useChatRoom,
  useCreateRoom,
  useJoinRoom,
  useRoomMembers,
  useRoomMessages,
  useSendRoomMessage,
  useRoomReaction,
  useRoomTyping,
  useMessageSearch,
  useDeleteMessage,
  useEditMessage,
  usePinMessage,
  usePinnedMessages
} from './useChatRooms';
export { useEvents } from './useEvents';
export { useParties } from './useParties';
export { useAlbums } from './useAlbums';
export { useProfilePhotos } from './useProfilePhotos';
export { useBookings } from './useBookings';
export { useConsent } from './useConsent';
export { usePresence } from './usePresence';
export { useNotifications } from './useNotifications';
export { usePayments } from './usePayments';
export { useSubscription } from './useSubscription';
export { useFavorites } from './useFavorites';
export { useBlocks } from './useBlocks';
export { useReactions } from './useReactions';
export { useSafetyFeatures } from './useSafetyFeatures';
export { useGDPR } from './useGDPR';
export { useFileUpload } from './useFileUpload';
export { useQuickReply } from './useQuickReply';
export { useVirtualScroll } from './useVirtualScroll';
export { useProfileGrid } from './useProfileGrid';
export { useSwipe } from './useSwipe';

// =============================================================================
// P2P & DATING HOOKS
// =============================================================================
export { useDating } from './useDating';
export { useP2PMatchmaking } from './useP2PMatchmaking';
export { useLocation } from './useLocation';

// =============================================================================
// AI HOOKS — All consolidated into canonical useUnifiedAI
// =============================================================================
export { useUnifiedAI, useAI, useKeylessAI } from '@/lib/ai/canonical';
export { useChatAI } from './useChatAI';
export { useLocalAI } from '@/lib/ai';

// =============================================================================
// CANONICAL FEATURE EXPORTS — All 15/10 Enterprise Grade
// =============================================================================
export * from '@/features/admin';
export * from '@/features/ai';
export * from '@/features/albums';
export * from '@/features/analytics';
export * from '@/features/bookings';
export * from '@/features/chat';
export * from '@/features/dating';
export * from '@/features/events';
export * from '@/features/enterprise';
export * from '@/features/favorites';
export * from '@/features/grid';
export * from '@/features/map';
export * from '@/features/notifications';
export * from '@/features/onboarding';
export * from '@/features/profile';
export * from '@/features/rightNow';
export * from '@/features/safety';
export * from '@/features/settings';
export * from '@/features/verification';
export * from '@/features/voice';

// =============================================================================
// UNIFIED HOOKS (Modern Consolidated APIs)
// =============================================================================
export { useChat } from './unified/useChat';
export { useDating as useUnifiedDating } from './unified/useDating';
export { useAudio } from './unified/useAudio';
export { useMap } from './unified/useMap';
export { useLocation as useUnifiedLocation } from './unified/useLocation';

// =============================================================================
// VOICE HOOKS
// =============================================================================
export { useAutoReply } from './voice/useAutoReply';

// =============================================================================
// REUSABLE FORM HOOKS
// =============================================================================
export { useFormValidation } from './reusable/useFormValidation';

