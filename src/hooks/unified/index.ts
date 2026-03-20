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
// DATING HOOK - Consolidates useP2PDating, useProductionDating, use-hybrid-p2p-dating
// ═══════════════════════════════════════════════════════════════════════════════
export { default as useDating, type DatingProfile, type DatingMessage, type DatingCall, type DatingRoom, type DiscoverySettings, type DatingState } from './useDating';

// ═══════════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY ALIASES
// ═══════════════════════════════════════════════════════════════════════════════
export { default as useP2PDating } from './useDating';
export { default as useProductionDating } from './useDating';
export { default as useHybridDating } from './useDating';

// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORT EXISTING HOOKS (for gradual migration)
// ═══════════════════════════════════════════════════════════════════════════════
export { useAuth } from '../useAuth';
export { useToast } from '../use-toast';
export { useIsMobile } from '../use-mobile';
export { useDebounce } from '../useDebounce';
export { useLocalStorage } from '../useLocalStorage';
export { useMediaQuery } from '../useMediaQuery';
export { useInfiniteScroll } from '../useInfiniteScroll';
export { useGeolocation } from '../useGeolocation';
export { usePWA } from '../usePWA';

// Feature-specific hooks (to be consolidated in future iterations)
export { useMatches } from '../useMatches';
export { useMessages } from '../useMessages';
export { useConversations } from '../useConversations';
export { useNotifications } from '../useNotifications';
export { useProfile } from '../useProfile';
export { useProfilePhotos } from '../useProfilePhotos';
export { useFavorites } from '../useFavorites';
export { useBlocks } from '../useBlocks';
export { useEvents } from '../useEvents';
export { useParties } from '../useParties';
export { useOnboarding } from '../useOnboarding';
export { useVerification } from '../useVerification';
export { useSafetyFeatures } from '../useSafetyFeatures';
export { useReports } from '../useReports';
export { useGDPR } from '../useGDPR';
export { useSubscription } from '../useSubscription';
export { useSubscriptionTier as UserSubscription } from '../useSubscriptionTier';
export { usePayments } from '../usePayments';
export { usePresence } from '../usePresence';
export { useConsent } from '../useConsent';
export { useBookings } from '../useBookings';
export { useFileUpload } from '../useFileUpload';
export { useReactions } from '../useReactions';
export { useAlbums } from '../useAlbums';
export { useChatRoom } from '../useChatRooms';
export { useMapMarkers } from '../useMapMarkers';
export { useRealtimeMap } from '../useRealtimeMap';
export { useRealtimeLocationTracking } from '../useRealtimeLocationTracking';

// AI hooks
export { useAI } from '../useAI';

// Audio/Voice hooks
export { useAudioFeatures } from '../useAudioFeatures';
export { useOmniAudio } from '../useOmniAudio';

// Map hooks
export { useOmniMapMarkers } from '../useOmniMapMarkers';

// Specialized hooks
export { useOmniGameChanger } from '../useOmniGameChanger';
export { useOmniSOS } from '../useOmniSOS';
export { useMeateorPatterns } from '../useMeateorPatterns';
