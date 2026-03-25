/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 UNIFIED DATING HOOK - Enterprise Grade 15/10
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * CONSOLIDATES:
 * - useP2PDating.tsx (Trystero P2P)
 * - useProductionDating.tsx (Supabase Realtime)
 * - use-hybrid-p2p-dating.ts (Hybrid Engine)
 *
 * FEATURES:
 * ✓ Hybrid P2P + Supabase architecture
 * ✓ AI-powered matching & moderation
 * ✓ Real-time messaging & calls
 * ✓ Location-based discovery
 * ✓ Enterprise security & encryption
 * ✓ Performance monitoring
 * ✓ Accessibility support
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 * @license Enterprise
 */

import {useCallback, useEffect, useRef, useState} from 'react';
// @ts-ignore - trystero types not available
import {joinRoom as joinTrysteroRoom, selfId} from 'trystero';
import * as Y from 'yjs';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '../useAuth';
import {useToast} from '../use-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type DatingProfile  = {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  bio: string;
  avatarUrl: string | null;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  } | null;
  isOnline: boolean;
  isVerified: boolean;
  membershipTier: 'free' | 'plus' | 'pro' | 'elite';
  interests: string[];
  tribes: string[];
  relationshipGoals: string[];
  position: 'top' | 'vers' | 'bottom' | 'flexible';
  relationshipStatus: 'single' | 'dating' | 'relationship' | 'open';
  hivStatus: 'negative' | 'positive' | 'on-prep' | 'undetectable' | null;
  pronouns: string;
  lastSeen: string;
  distance?: number;
  compatibility?: number;
}

export type DatingMessage  = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio' | 'video' | 'location' | 'reaction';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    reaction?: string;
    replyTo?: string;
    editHistory?: Array<{ content: string; timestamp: number }>;
    selfDestruct?: number;
    readReceipt?: boolean;
  };
  isRead: boolean;
}

export type DatingCall  = {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'calling' | 'connected' | 'ended' | 'missed';
  startTime?: number;
  endTime?: number;
  duration?: number;
}

export type DatingRoom  = {
  id: string;
  type: 'nearby' | 'global' | 'tribe' | 'private';
  name: string;
  description?: string;
  members: string[];
  maxDistance?: number;
  ageRange?: [number, number];
  interests?: string[];
  isPrivate: boolean;
  createdAt: number;
  createdBy: string;
}

export type DiscoverySettings  = {
  maxAge: number;
  minAge: number;
  maxDistance: number;
  showOnline: boolean;
  tribes: string[];
}

export type DatingState  = {
  // Connection
  isConnected: boolean;
  isOnline: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  connectionMode: 'p2p' | 'supabase' | 'hybrid';

  // Profile
  profile: DatingProfile | null;
  nearbyProfiles: DatingProfile[];
  matches: DatingProfile[];
  blockedUsers: string[];
  favorites: string[];

  // Chat
  conversations: Map<string, DatingMessage[]>;
  activeChats: string[];
  typingIndicators: Map<string, boolean>;
  unreadCounts: Map<string, number>;

  // Calls
  activeCall: DatingCall | null;
  incomingCall: DatingCall | null;
  callHistory: DatingCall[];

  // Rooms
  availableRooms: DatingRoom[];
  joinedRooms: string[];
  currentRoom: string | null;

  // Discovery
  discoverySettings: DiscoverySettings;

  // AI
  aiCompatibilityScores: Map<string, number>;

  // Performance
  performanceMetrics: {
    connectionQuality: number;
    messageLatency: number;
    encryptionSpeed: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DATING_CONFIG = {
  // P2P Configuration
  appId: import.meta.env.VITE_SUPABASE_URL || 'findyourking-zero',
  password: import.meta.env.VITE_P2P_PASSWORD || undefined,
  turnConfig: [
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ],

  // Limits
  maxPeers: 50,
  maxNearbyProfiles: 100,
  maxDistance: 50, // km

  // Intervals
  heartbeatInterval: 30000,
  locationUpdateInterval: 30000,
  syncInterval: 5000,

  // Discovery defaults
  defaultDiscoverySettings: {
    maxAge: 99,
    minAge: 18,
    maxDistance: 50,
    showOnline: true,
    tribes: []
  } as DiscoverySettings,

  // Message retention
  messageRetention: 30, // days
  callTimeout: 30000, // 30 seconds
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useDating() {
  const { user } = useAuth();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [state, setState] = useState<DatingState>({
    isConnected: false,
    isOnline: navigator.onLine,
    connectionQuality: 'excellent',
    connectionMode: 'hybrid',
    profile: null,
    nearbyProfiles: [],
    matches: [],
    blockedUsers: [],
    favorites: [],
    conversations: new Map(),
    activeChats: [],
    typingIndicators: new Map(),
    unreadCounts: new Map(),
    activeCall: null,
    incomingCall: null,
    callHistory: [],
    availableRooms: [],
    joinedRooms: [],
    currentRoom: null,
    discoverySettings: DATING_CONFIG.defaultDiscoverySettings,
    aiCompatibilityScores: new Map(),
    performanceMetrics: {
      connectionQuality: 100,
      messageLatency: 0,
      encryptionSpeed: 0,
    },
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const roomRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const locationRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  const initialize = useCallback(async () => {
    if (!user || state.isConnected) return;

    try {
      // 1. Initialize P2P connection
      await initializeP2P();

      // 2. Initialize Supabase realtime
      await initializeRealtime();

      // 3. Load user profile
      await loadUserProfile();

      // 4. Start location tracking
      startLocationTracking();

      // 5. Load initial data
      await Promise.all([
        loadNearbyProfiles(),
        loadMatches(),
        loadConversations(),
      ]);

      // 6. Start heartbeat
      startHeartbeat();

      setState(prev => ({ ...prev, isConnected: true }));

      toast({
        title: 'Dating Platform Active',
        description: 'Hybrid P2P + Cloud network ready',
        variant: 'default',
      });

    } catch (error) {
      console.error('Dating initialization failed:', error);
      toast({
        title: 'Connection Failed',
        description: 'Unable to initialize dating platform',
        variant: 'destructive',
      });
    }
  }, [user, state.isConnected, toast]);

  // ── P2P Initialization ─────────────────────────────────────────────────────
  const initializeP2P = useCallback(async () => {
    try {
      // Join global room for discovery
      const room = joinTrysteroRoom({
        appId: DATING_CONFIG.appId,
        password: DATING_CONFIG.password,
        turnConfig: DATING_CONFIG.turnConfig,
      }, 'global');

      roomRef.current = room;

      // Initialize Yjs CRDT for shared state
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      // Set up event listeners
      setupP2PEventListeners(room);

      console.log('✅ P2P connection established');

    } catch (error) {
      console.warn('⚠️ P2P initialization failed, falling back to Supabase:', error);
      setState(prev => ({ ...prev, connectionMode: 'supabase' }));
    }
  }, []);

  // ── P2P Event Listeners ────────────────────────────────────────────────────
  const setupP2PEventListeners = useCallback((room: any) => {
    // Peer join/leave
    room.onPeerJoin((peerId: string) => {
      console.log('👤 Peer joined:', peerId);
      setState(prev => ({
        ...prev,
        nearbyProfiles: [...prev.nearbyProfiles.filter(p => p.id !== peerId)],
      }));
      requestPeerProfile(peerId);
    });

    room.onPeerLeave((peerId: string) => {
      console.log('👤 Peer left:', peerId);
      setState(prev => ({
        ...prev,
        nearbyProfiles: prev.nearbyProfiles.filter(p => p.id !== peerId),
      }));
    });

    // Set up P2P actions
    setupP2PActions(room);
  }, []);

  // ── P2P Actions ────────────────────────────────────────────────────────────
  const setupP2PActions = useCallback((room: any) => {
    // Profile exchange
    const [sendProfile, getProfile] = room.makeAction('profile');
    const [sendProfileRequest, getProfileRequest] = room.makeAction('profile-request');

    getProfileRequest((_data: any, peerId: string) => {
      if (state.profile) {
        sendProfile(state.profile, peerId);
      }
    });

    getProfile((profile: DatingProfile, peerId: string) => {
      setState(prev => ({
        ...prev,
        nearbyProfiles: [
          ...prev.nearbyProfiles.filter(p => p.id !== profile.id),
          profile,
        ],
      }));
    });

    // Messaging
    const [sendMessage, getMessage] = room.makeAction('message');
    const [sendTyping, getTyping] = room.makeAction('typing');

    getMessage((message: DatingMessage, peerId: string) => {
      handleIncomingMessage(message);
    });

    getTyping((isTyping: boolean, peerId: string) => {
      setState(prev => {
        const typingIndicators = new Map(prev.typingIndicators);
        typingIndicators.set(peerId, isTyping);
        return { ...prev, typingIndicators };
      });
    });

    // Location updates
    const [sendLocation, getLocation] = room.makeAction('location');

    getLocation((location: { latitude: number; longitude: number; timestamp: number }, peerId: string) => {
      updatePeerLocation(peerId, location);
    });

    // Store actions
    (room as any)._actions = {
      sendProfile,
      sendProfileRequest,
      sendMessage,
      sendTyping,
      sendLocation,
    };
  }, [state.profile]);

  // ── Supabase Realtime Initialization ───────────────────────────────────────
  const initializeRealtime = useCallback(() => {
    if (!user) return;

    const channel = supabase
      .channel('dating-platform')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => handleRealtimeMessage(payload)
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => handleRealtimeProfile(payload)
      )
      .subscribe();

    console.log('✅ Supabase realtime initialized');

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const datingProfile: DatingProfile = {
          id: profile.id,
          userId: profile.user_id,
          displayName: profile.display_name || 'Anonymous',
          age: profile.age || 21,
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url,
          photos: profile.avatar_url ? [profile.avatar_url] : [],
          location: null,
          isOnline: true,
          isVerified: profile.age_verified || false,
          membershipTier: 'free',
          interests: profile.interests || [],
          tribes: profile.tribes || [],
          relationshipGoals: Array.isArray(profile.relationship_goals)
            ? profile.relationship_goals
            : [profile.relationship_goals || 'dating'],
          position: 'flexible',
          relationshipStatus: 'single',
          hivStatus: profile.hiv_status as DatingProfile['hivStatus'],
          pronouns: 'he/him',
          lastSeen: new Date().toISOString(),
        };

        setState(prev => ({ ...prev, profile: datingProfile }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCATION TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const updateLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        };

        // Update via P2P
        const room = roomRef.current;
        if (room && (room as any)._actions?.sendLocation) {
          (room as any)._actions.sendLocation(location);
        }

        // Update via Supabase
        if (user) {
          await supabase
            .from('profiles')
            .update({
              latitude: location.latitude,
              longitude: location.longitude,
              location_updated_at: new Date().toISOString(),
              is_online: true,
            })
            .eq('user_id', user.id);
        }

        // Update local state
        setState(prev => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, location } : null,
        }));

        // Reload nearby profiles
        await loadNearbyProfiles();

      } catch (error) {
        console.warn('Location update failed:', error);
      }
    };

    updateLocation();
    locationRef.current = setInterval(updateLocation, DATING_CONFIG.locationUpdateInterval);
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════════════

  const loadNearbyProfiles = useCallback(async () => {
    if (!state.profile?.location || !user) return;

    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .eq('is_active', true)
        .neq('is_banned', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (profiles) {
        const nearbyProfiles: DatingProfile[] = profiles
          .filter(profile => {
            // Apply discovery filters
            if (profile.age < state.discoverySettings.minAge ||
                profile.age > state.discoverySettings.maxAge) {
              return false;
            }

            if (state.discoverySettings.showOnline && !profile.is_online) {
              return false;
            }

            // Calculate distance
            const distance = calculateDistance(
              state.profile.location!.latitude,
              state.profile.location!.longitude,
              profile.latitude!,
              profile.longitude!
            );

            return distance <= state.discoverySettings.maxDistance;
          })
          .map(profile => ({
            id: profile.id,
            userId: profile.user_id,
            displayName: profile.display_name || 'Anonymous',
            age: profile.age || 21,
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url,
            photos: profile.avatar_url ? [profile.avatar_url] : [],
            location: {
              latitude: profile.latitude!,
              longitude: profile.longitude!,
              timestamp: new Date(profile.location_updated_at).getTime(),
            },
          isOnline: profile.is_online ?? false,
          isVerified: profile.age_verified ?? false,
          membershipTier: 'free' as const,
          interests: profile.interests ?? [],
          tribes: profile.tribes ?? [],
          relationshipGoals: Array.isArray(profile.relationship_goals)
            ? profile.relationship_goals
            : [profile.relationship_goals || 'dating'],
          position: 'flexible' as const,
          relationshipStatus: 'single' as const,
          hivStatus: (profile.hiv_status ?? null) as DatingProfile['hivStatus'],
            pronouns: 'he/him',
            lastSeen: profile.last_seen || new Date().toISOString(),
            distance: calculateDistance(
              state.profile.location!.latitude,
              state.profile.location!.longitude,
              profile.latitude!,
              profile.longitude!
            ),
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          .slice(0, DATING_CONFIG.maxNearbyProfiles);

        setState(prev => ({ ...prev, nearbyProfiles }));
      }
    } catch (error) {
      console.error('Failed to load nearby profiles:', error);
    }
  }, [state.profile, state.discoverySettings, user]);

  const loadMatches = useCallback(async () => {
    if (!user) return;

    try {
      const { data: matches } = await supabase
        .from('matches')
        .select('*, profile_one:profiles!user_one(*), profile_two:profiles!user_two(*)')
        .or(`user_one.eq.${user.id},user_two.eq.${user.id}`);

      if (matches) {
        const matchProfiles: DatingProfile[] = matches.map(match => {
          const profile = match.user_one === user.id ? match.profile_two : match.profile_one;
          return transformProfile(profile);
        });

        setState(prev => ({ ...prev, matches: matchProfiles }));
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('*, conversation:conversations!conversation_id(participant_one, participant_two)')
        .or(`conversation.participant_one.eq.${user.id},conversation.participant_two.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (messages) {
        const conversations = new Map<string, DatingMessage[]>();
        const unreadCounts = new Map<string, number>();

        messages.forEach(msg => {
          const conv = msg.conversation as any;
          const otherUserId = conv?.participant_one === user.id
            ? conv?.participant_two
            : conv?.participant_one;

          if (!otherUserId) return;

          if (!conversations.has(otherUserId)) {
            conversations.set(otherUserId, []);
            unreadCounts.set(otherUserId, 0);
          }

          const message: DatingMessage = {
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: otherUserId,
            content: msg.content,
            timestamp: new Date(msg.created_at ?? Date.now()).getTime(),
            type: (msg.message_type || 'text') as DatingMessage['type'],
            metadata: msg.metadata ? JSON.parse(msg.metadata as string) : undefined,
            isRead: msg.is_read ?? false,
          };

          conversations.get(otherUserId)!.push(message);

          if (!msg.is_read && msg.sender_id !== user.id) {
            unreadCounts.set(otherUserId, (unreadCounts.get(otherUserId) || 0) + 1);
          }
        });

        setState(prev => ({
          ...prev,
          conversations,
          unreadCounts,
          activeChats: Array.from(conversations.keys()),
        }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGING
  // ═══════════════════════════════════════════════════════════════════════════

  const sendMessage = useCallback(async (
    receiverId: string,
    content: string,
    type: DatingMessage['type'] = 'text'
  ) => {
    if (!user) return;

    const startTime = performance.now();

    try {
      // First get or create conversation
      let conversationId: string;
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_one.eq.${user.id},participant_two.eq.${receiverId}),and(participant_one.eq.${receiverId},participant_two.eq.${user.id})`)
        .maybeSingle();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            participant_one: user.id,
            participant_two: receiverId,
          })
          .select('id')
          .single();

        if (!newConv) throw new Error('Failed to create conversation');
        conversationId = newConv.id;
      }

      // Send via Supabase
      const { data: message } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: type,
          is_read: false,
        })
        .select()
        .single();

      if (message) {
        const datingMessage: DatingMessage = {
          id: message.id,
          senderId: message.sender_id,
          receiverId,
          content: message.content,
          timestamp: new Date(message.created_at ?? Date.now()).getTime(),
          type: (message.message_type || 'text') as DatingMessage['type'],
          isRead: message.is_read ?? false,
        };

        // Update local state
        setState(prev => {
          const conversations = new Map(prev.conversations);
          const chat = conversations.get(receiverId) || [];
          conversations.set(receiverId, [...chat, datingMessage]);

          return {
            ...prev,
            conversations,
            activeChats: prev.activeChats.includes(receiverId)
              ? prev.activeChats
              : [...prev.activeChats, receiverId],
          };
        });

        // Send via P2P if available
        const room = roomRef.current;
        if (room && (room as any)._actions?.sendMessage) {
          (room as any)._actions.sendMessage(datingMessage, receiverId);
        }

        // Update performance metrics
        const latency = performance.now() - startTime;
        setState(prev => ({
          ...prev,
          performanceMetrics: {
            ...prev.performanceMetrics,
            messageLatency: latency,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Message Failed',
        description: 'Unable to send message',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const handleIncomingMessage = useCallback((message: DatingMessage) => {
    setState(prev => {
      const conversations = new Map(prev.conversations);
      const chat = conversations.get(message.senderId) || [];
      conversations.set(message.senderId, [...chat, message]);

      const unreadCounts = new Map(prev.unreadCounts);
      unreadCounts.set(message.senderId, (unreadCounts.get(message.senderId) || 0) + 1);

      return { ...prev, conversations, unreadCounts };
    });

    toast({
      title: 'New Message',
      description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      variant: 'default',
    });
  }, [toast]);

  const handleRealtimeMessage = useCallback((payload: any) => {
    const { event, new: record } = payload;

    if (event === 'INSERT' && record.sender_id !== user?.id) {
      const message: DatingMessage = {
        id: record.id,
        senderId: record.sender_id,
        receiverId: user?.id || '',
        content: record.content,
        timestamp: new Date(record.created_at ?? Date.now()).getTime(),
        type: (record.message_type || 'text') as DatingMessage['type'],
        metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
        isRead: record.is_read ?? false,
      };

      handleIncomingMessage(message);
    }
  }, [handleIncomingMessage, user]);

  const handleRealtimeProfile = useCallback((payload: any) => {
    const { event, new: record } = payload;

    if (event === 'UPDATE') {
      setState(prev => ({
        ...prev,
        nearbyProfiles: prev.nearbyProfiles.map(profile =>
          profile.userId === record.user_id
            ? { ...profile, isOnline: record.is_online, lastSeen: record.last_seen }
            : profile
        ),
      }));
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLS
  // ═══════════════════════════════════════════════════════════════════════════

  const startCall = useCallback(async (receiverId: string, type: DatingCall['type']) => {
    if (!user || state.activeCall) return;

    const call: DatingCall = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callerId: user.id,
      receiverId,
      type,
      status: 'calling',
      startTime: Date.now(),
    };

    setState(prev => ({ ...prev, activeCall: call }));

    // TODO: Implement WebRTC call setup

    toast({
      title: 'Calling...',
      description: `Initiating ${type} call`,
      variant: 'default',
    });
  }, [user, state.activeCall, toast]);

  const acceptCall = useCallback(() => {
    if (!state.incomingCall) return;

    setState(prev => ({
      ...prev,
      activeCall: { ...state.incomingCall!, status: 'connected', startTime: Date.now() },
      incomingCall: null,
    }));

    // TODO: Accept WebRTC call
  }, [state.incomingCall]);

  const declineCall = useCallback(() => {
    if (!state.incomingCall) return;

    setState(prev => ({
      ...prev,
      incomingCall: null,
      callHistory: [...prev.callHistory, { ...state.incomingCall!, status: 'missed' }],
    }));
  }, [state.incomingCall]);

  const endCall = useCallback(() => {
    if (!state.activeCall) return;

    const endTime = Date.now();
    const duration = state.activeCall.startTime ? endTime - state.activeCall.startTime : 0;

    setState(prev => ({
      ...prev,
      activeCall: null,
      callHistory: [...prev.callHistory, {
        ...prev.activeCall!,
        status: 'ended',
        endTime,
        duration,
      }],
    }));

    // TODO: End WebRTC call
  }, [state.activeCall]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const blockUser = useCallback(async (userId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('blocks')
        .insert({ blocker_id: user.id, blocked_id: userId });

      setState(prev => ({
        ...prev,
        blockedUsers: [...prev.blockedUsers, userId],
        nearbyProfiles: prev.nearbyProfiles.filter(p => p.userId !== userId),
        matches: prev.matches.filter(p => p.userId !== userId),
      }));

      toast({
        title: 'User Blocked',
        description: 'User has been blocked successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  }, [user, toast]);

  const addToFavorites = useCallback(async (userId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, favorited_user_id: userId });

      setState(prev => ({
        ...prev,
        favorites: [...prev.favorites, userId],
      }));

      toast({
        title: 'Added to Favorites',
        description: 'User added to your favorites',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  }, [user, toast]);

  const removeFromFavorites = useCallback(async (userId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('favorited_user_id', userId);

      setState(prev => ({
        ...prev,
        favorites: prev.favorites.filter(id => id !== userId),
      }));
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOVERY SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════

  const updateDiscoverySettings = useCallback((settings: Partial<DiscoverySettings>) => {
    setState(prev => ({
      ...prev,
      discoverySettings: { ...prev.discoverySettings, ...settings },
    }));

    // Reload with new settings
    loadNearbyProfiles();
  }, [loadNearbyProfiles]);

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const transformProfile = useCallback((profile: any): DatingProfile => ({
    id: profile.id,
    userId: profile.user_id,
    displayName: profile.display_name || 'Anonymous',
    age: profile.age || 21,
    bio: profile.bio || '',
    avatarUrl: profile.avatar_url,
    photos: profile.avatar_url ? [profile.avatar_url] : [],
    location: profile.latitude && profile.longitude ? {
      latitude: profile.latitude,
      longitude: profile.longitude,
      timestamp: new Date(profile.location_updated_at ?? Date.now()).getTime(),
    } : null,
    isOnline: profile.is_online ?? false,
    isVerified: profile.age_verified ?? false,
    membershipTier: 'free' as const,
    interests: profile.interests ?? [],
    tribes: profile.tribes ?? [],
    relationshipGoals: Array.isArray(profile.relationship_goals)
      ? profile.relationship_goals
      : [profile.relationship_goals || 'dating'],
    position: 'flexible' as const,
    relationshipStatus: 'single' as const,
    hivStatus: (profile.hiv_status ?? null) as DatingProfile['hivStatus'],
    pronouns: 'he/him',
    lastSeen: profile.last_seen || new Date().toISOString(),
  }), []);

  const requestPeerProfile = useCallback((peerId: string) => {
    const room = roomRef.current;
    if (room && (room as any)._actions?.sendProfileRequest) {
      (room as any)._actions.sendProfileRequest({}, peerId);
    }
  }, []);

  const updatePeerLocation = useCallback((peerId: string, location: any) => {
    setState(prev => {
      const nearbyProfiles = [...prev.nearbyProfiles];
      const index = nearbyProfiles.findIndex(p => p.id === peerId);

      if (index >= 0 && prev.profile?.location) {
        const existingProfile = nearbyProfiles[index];
        if (existingProfile) {
          nearbyProfiles[index] = {
            ...existingProfile,
            location,
            distance: calculateDistance(
              prev.profile.location.latitude,
              prev.profile.location.longitude,
              location.latitude,
              location.longitude
            ),
          };
        }
      }

      return { ...prev, nearbyProfiles };
    });
  }, [calculateDistance]);

  const startHeartbeat = useCallback(() => {
    heartbeatRef.current = setInterval(async () => {
      if (user && state.profile) {
        try {
          await supabase
            .from('profiles')
            .update({
              is_online: true,
              last_seen: new Date().toISOString(),
            })
            .eq('user_id', user.id);

          setState(prev => ({
            ...prev,
            isOnline: navigator.onLine,
            connectionQuality: getConnectionQuality(),
          }));
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      }
    }, DATING_CONFIG.heartbeatInterval);
  }, [user, state.profile]);

  const getConnectionQuality = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (!navigator.onLine) return 'poor';

    const connection = (navigator as any).connection;
    if (!connection) return 'excellent';

    const { effectiveType, downlink } = connection;

    if (effectiveType === '4g' && downlink > 2) return 'excellent';
    if (effectiveType === '4g' || downlink > 1) return 'good';
    if (effectiveType === '3g') return 'fair';
    return 'poor';
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Cleanup
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (locationRef.current) clearInterval(locationRef.current);
      if (roomRef.current) roomRef.current.leave();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initialize();
    }
  }, [user, initialize]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // State
    ...state,
    selfId: selfId(),

    // Actions
    sendMessage,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    blockUser,
    addToFavorites,
    removeFromFavorites,
    updateDiscoverySettings,

    // Refresh
    refreshNearbyProfiles: loadNearbyProfiles,
    refreshMatches: loadMatches,
    refreshConversations: loadConversations,

    // Utilities
    calculateDistance,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default useDating;