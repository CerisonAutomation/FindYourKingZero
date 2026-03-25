/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 UNIFIED HOOKS INDEX - Enterprise Grade 15/10
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Central export point for all unified hooks.
 * Consolidates scattered hooks into organized, enterprise-ready exports.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 * @license Enterprise
 */

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED HOOKS (Primary exports - use these)
// ═══════════════════════════════════════════════════════════════════════════════

// Dating - Unified hook consolidating useP2PDating, useProductionDating, use-hybrid-p2p-dating
export {
  default as useDating,
  type DatingProfile,
  type DatingMessage,
  type DatingCall,
  type DatingRoom,
  type DiscoverySettings,
  type DatingState
} from './useDating';

// Map - Unified hook consolidating useMapMarkers, useOmniMapMarkers, useRealtimeMap
export {
  default as useMap,
  type MapMarker,
  type DeviceMarker,
  type MarkerCluster,
  type LocationEvent,
  type MapConfig,
  type MapState
} from './useMap';

// Audio - Unified hook consolidating useAudioFeatures, useOmniAudio
export {
  default as useAudio,
  type AudioMessage,
  type VoiceNote,
  type AudioConfig,
  type AudioClip,
  type AudioState
} from './useAudio';

// Chat - Unified hook consolidating useMessages, useConversations, useChatRooms, useP2PChat
export {
  useChat,
  default as useChatDefault,
  type ChatMessage,
  type ChatRoom,
  type RoomMember,
  type Conversation,
  type P2PPeer,
  type ChatState,
  type RoomType,
  type MsgType,
  type ConnectionQuality,
  type ReactionSummary
} from './useChat';

// Location - Unified hook consolidating useGeolocation, useRealtimeLocationTracking, useLocation
export {
  useLocation,
  useTravelMode,
  calculateDistance,
  default as useLocationDefault,
  type LocationCoordinates,
  type NearbyProfile,
  type DeviceInfo,
  type SOSAlert,
  type WebRTCState,
  type LocationState,
  type LocationOptions
} from './useLocation';

// ═══════════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY ALIASES (Legacy support - migrate away from these)
// ═══════════════════════════════════════════════════════════════════════════════

// Dating aliases
export { default as useP2PDating } from './useDating';
export { default as useProductionDating } from './useDating';
export { default as useHybridDating } from './useDating';

// Map aliases
export { default as useMapMarkers } from './useMap';
export { default as useOmniMapMarkers } from './useMap';
export { default as useRealtimeMap } from './useMap';

// Audio aliases
export { default as useAudioFeatures } from './useAudio';
export { default as useOmniAudio } from './useAudio';

// ═══════════════════════════════════════════════════════════════════════════════
// CORE SYSTEM HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export { useAuth } from '../useAuth';
export { useToast } from '../use-toast';
export { useIsMobile } from '../useMobile';
export { useDebounce } from '../useDebounce';
export { useLocalStorage } from '../useLocalStorage';

// ═══════════════════════════════════════════════════════════════════════════════
// P2P & COMMUNICATION HOOKS (use unified useChat above)
// ═══════════════════════════════════════════════════════════════════════════════
// Legacy exports for backward compatibility - migrate to unified useChat
export { useChat } from './useChat';
export { useReactions } from '../useReactions';

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION & MAPS HOOKS (use unified useLocation above)
// ═══════════════════════════════════════════════════════════════════════════════
// Legacy exports for backward compatibility - migrate to unified useLocation
export { useLocation, useTravelMode, calculateDistance } from './useLocation';

// ═══════════════════════════════════════════════════════════════════════════════
// AI FEATURES HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export {
  useAI,
  useIcebreakers,
  useBioOptimizer,
  useModeration,
  useCompatibilityAnalysis,
  useConversationHelp,
  useAIAssistant
} from '../useAI';
export { useOmniGameChanger } from '../useOmniGameChanger';
export { useOmniSOS } from '../useOmniSOS';
export { useMeateorPatterns } from '../useMeateorPatterns';

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL & MATCHING HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export { useMatches } from '../useMatches';
export { useFavorites } from '../useFavorites';
export { useBlocks } from '../useBlocks';
export { usePresence } from '../usePresence';

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE & USER HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export { useProfile } from '../useProfile';
export { useProfilePhotos } from '../useProfilePhotos';
export { useOnboarding } from '../useOnboarding';
export { useVerification } from '../useVerification';
export { useSafetyFeatures } from '../useSafetyFeatures';
export { useReports } from '../useReports';
export { useGDPR } from '../useGDPR';
export { useConsent } from '../useConsent';

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS & BOOKINGS HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export { useEvents } from '../useEvents';
export { useParties } from '../useParties';
export { useBookings } from '../useBookings';
export { useAlbums } from '../useAlbums';

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS & SUBSCRIPTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export { useSubscription } from '../useSubscription';
export { useMySubscription, useMyLevel, useAwardXP } from '../useSubscriptionTier';
export { usePayments } from '../usePayments';

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS & UTILITIES HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export { useNotifications, type Notification } from '../useNotifications';
export { useFileUpload } from '../useFileUpload';

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE & SPECIALIZED HOOKS
// ═══════════════════════════════════════════════════════════════════════════════
export { useAutoReply } from '../voice/useAutoReply';
export { useVoiceNavigation } from '../voice/useVoiceNavigation';
export { useGameChanger } from '../useAdvancedMatching';
export { useMeetNowUsers, useMyMeetNowStatus, useShareLocation, useStopSharing } from '../useMeetNow';
export { useP2PMatchmaking } from '../useP2PMatchmaking';
export { useClipboard, useClickOutside, useKeyboardShortcut, useIntersectionObserver, usePrevious, useMounted, useDocumentVisibility, useOnlineStatus } from '../useUtils';
