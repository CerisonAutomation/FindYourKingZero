// =============================================================================
// FINDYOURKINGZERO — UNIFIED BACKEND + HOOKS + SERVICES
// Single source of truth for all data, auth, and business logic
// =============================================================================

import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {createClient, type Session, type User} from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: BACKEND — Supabase Client + Auth + DB + Realtime + Geo
// ═══════════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 10 } },
  global: { headers: { 'X-Client-Info': 'findyourking-unified@4.0' } },
});

// ── Auth Service ──────────────────────────────────────────────────────────────
export const auth = {
  getSession: () => supabase.auth.getSession(),
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string, meta?: Record<string, unknown>) =>
    supabase.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: `${window.location.origin}/auth/callback` } }),
  signInWithMagicLink: (email: string) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } }),
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') =>
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } }),
  signOut: () => supabase.auth.signOut(),
  resetPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` }),
  onAuthChange: (cb: (event: string, session: Session | null) => void) =>
    supabase.auth.onAuthStateChange(cb),
};

// ── DB Service (type-safe, no SQL injection) ──────────────────────────────────
export const db = {
  from: (table: string) => ({
    select: (cols = '*') => supabase.from(table).select(cols),
    insert: (row: Record<string, unknown>) => supabase.from(table).insert(row).select().single(),
    update: (row: Record<string, unknown>) => supabase.from(table).update(row),
    delete: () => supabase.from(table).delete(),
    eq: (col: string, val: unknown) => supabase.from(table).select().eq(col, val),
    single: () => supabase.from(table).select().single(),
  }),
  rpc: (fn: string, params?: Record<string, unknown>) => supabase.rpc(fn, params),
};

// ── Realtime Service (stable channels, no leaks) ─────────────────────────────
const channels = new Map<string, ReturnType<typeof supabase.channel>>();
export const realtime = {
  subscribe: (key: string, setup: (ch: ReturnType<typeof supabase.channel>) => void) => {
    if (channels.has(key)) return channels.get(key)!;
    const ch = supabase.channel(key);
    setup(ch);
    ch.subscribe();
    channels.set(key, ch);
    return ch;
  },
  unsubscribe: async (key: string) => {
    const ch = channels.get(key);
    if (ch) { await supabase.removeChannel(ch); channels.delete(key); }
  },
  unsubscribeAll: async () => { await supabase.removeAllChannels(); channels.clear(); },
};

// ── Geo Service (PostGIS proximity) ──────────────────────────────────────────
export const geo = {
  findNearby: (lat: number, lng: number, radiusMeters: number) =>
    supabase.rpc('find_nearby_users', { lat, lng, radius_meters: radiusMeters }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: TYPES — All shared interfaces
// ═══════════════════════════════════════════════════════════════════════════════

export type UserTier = 'free' | 'plus' | 'pro' | 'elite' | 'host';
export type MessageType = 'text' | 'image' | 'voice' | 'video' | 'file' | 'system';

export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  photos: string[];
  age: number | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  interests: string[];
  looking_for: string[];
  tier: UserTier;
  is_verified: boolean;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  starts_at: string;
  ends_at: string | null;
  cover_url: string | null;
  host_id: string;
  attendee_count: number;
  max_attendees: number | null;
  type: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  host_id: string;
  guest_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  starts_at: string;
  ends_at: string;
  message: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: HOOKS — All data fetching + state management
// ═══════════════════════════════════════════════════════════════════════════════

// ── Auth Context ──────────────────────────────────────────────────────────────
interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: typeof auth.signIn;
  signUp: typeof auth.signUp;
  signOut: typeof auth.signOut;
}

const AuthContext = createContext<AuthCtx>({
  user: null, session: null, loading: true,
  signIn: auth.signIn, signUp: auth.signUp, signOut: auth.signOut,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = auth.onAuthChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn: auth.signIn, signUp: auth.signUp, signOut: auth.signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ── Profile Hook ──────────────────────────────────────────────────────────────
export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const id = userId || user?.id;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    db.from('profiles').eq('id', id).then(({ data }) => {
      setProfile(data?.[0] as UserProfile ?? null);
      setLoading(false);
    });
  }, [id]);

  return { profile, loading };
};

export const useProfiles = (filters?: { ageMin?: number; ageMax?: number; interests?: string[] }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from('profiles').select('*').eq('is_online', true).order('last_seen', { ascending: false }).limit(50);
    if (filters?.ageMin) query = query.gte('age', filters.ageMin);
    if (filters?.ageMax) query = query.lte('age', filters.ageMax);
    query.then(({ data }) => { setProfiles((data as UserProfile[]) || []); setLoading(false); });
  }, [filters?.ageMin, filters?.ageMax]);

  return { profiles, loading };
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const update = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    return { error };
  }, [user]);
  return { update };
};

// ── Messages Hook ─────────────────────────────────────────────────────────────
export const useMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) { setLoading(false); return; }
    supabase.from('messages').select('*').eq('room_id', conversationId).order('created_at', { ascending: true }).limit(100)
      .then(({ data }) => { setMessages((data as Message[]) || []); setLoading(false); });

    const ch = realtime.subscribe(`messages:${conversationId}`, (c) => {
      c.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${conversationId}` },
        (payload) => setMessages(prev => [...prev, payload.new as Message]));
    });
    return () => { realtime.unsubscribe(`messages:${conversationId}`); };
  }, [conversationId]);

  const send = useCallback(async (content: string, type: MessageType = 'text') => {
    const { user } = (await auth.getSession()).data;
    if (!user || !conversationId) return;
    await supabase.from('messages').insert({ room_id: conversationId, sender_id: user.id, content, type });
  }, [conversationId]);

  return { messages, loading, send };
};

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from('conversations').select('*').contains('participant_ids', [user.id]).order('last_message_at', { ascending: false })
      .then(({ data }) => { setConversations((data as Conversation[]) || []); setLoading(false); });
  }, [user]);

  return { conversations, loading };
};

// ── Events Hook ───────────────────────────────────────────────────────────────
export const useEvents = (filter?: 'upcoming' | 'my_events') => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from('events').select('*');
    if (filter === 'upcoming') query = query.gte('starts_at', new Date().toISOString()).order('starts_at', { ascending: true });
    else if (filter === 'my_events' && user) query = query.eq('host_id', user.id);
    query.limit(50).then(({ data }) => { setEvents((data as Event[]) || []); setLoading(false); });
  }, [filter, user]);

  return { events, loading };
};

export const useCreateEvent = () => {
  const { user } = useAuth();
  const create = useCallback(async (event: Omit<Event, 'id' | 'host_id' | 'attendee_count' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };
    return supabase.from('events').insert({ ...event, host_id: user.id, attendee_count: 0 }).select().single();
  }, [user]);
  return { create };
};

// ── Notifications Hook ────────────────────────────────────────────────────────
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => {
        const notifs = (data as Notification[]) || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      });
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};

// ── Favorites Hook ────────────────────────────────────────────────────────────
export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('favorites').select('profile_id').eq('user_id', user.id)
      .then(({ data }) => setFavorites(data?.map((f: { profile_id: string }) => f.profile_id) || []));
  }, [user]);

  const toggle = useCallback(async (profileId: string) => {
    if (!user) return;
    const isFav = favorites.includes(profileId);
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('profile_id', profileId);
      setFavorites(prev => prev.filter(id => id !== profileId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, profile_id: profileId });
      setFavorites(prev => [...prev, profileId]);
    }
  }, [user, favorites]);

  return { favorites, toggle };
};

// ── Bookings Hook ─────────────────────────────────────────────────────────────
export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from('bookings').select('*').or(`host_id.eq.${user.id},guest_id.eq.${user.id}`).order('starts_at', { ascending: false })
      .then(({ data }) => { setBookings((data as Booking[]) || []); setLoading(false); });
  }, [user]);

  return { bookings, loading };
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: SERVICES — Business logic + integrations
// ═══════════════════════════════════════════════════════════════════════════════

export const services = {
  // Matching algorithm
  getMatches: async (userId: string) => {
    const { data } = await supabase.rpc('get_compatible_profiles', { user_id: userId, limit_count: 20 });
    return data || [];
  },

  // Location tracking
  updateLocation: async (lat: number, lng: number) => {
    const { user } = (await auth.getSession()).data;
    if (!user) return;
    await supabase.from('profiles').update({ lat, lng, last_seen: new Date().toISOString() }).eq('id', user.id);
  },

  // Report user
  reportUser: async (reportedId: string, reason: string, details?: string) => {
    const { user } = (await auth.getSession()).data;
    if (!user) return;
    await supabase.from('reports').insert({ reporter_id: user.id, reported_id: reportedId, reason, details });
  },

  // Block user
  blockUser: async (blockedId: string) => {
    const { user } = (await auth.getSession()).data;
    if (!user) return;
    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: blockedId });
  },

  // Upload photo
  uploadPhoto: async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('photos').upload(path, file, { upsert: true });
    if (error) return { url: null, error };
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(data.path);
    return { url: publicUrl, error: null };
  },
};

// GAP FIXES - Top 10 Priority Features
// SECTION 5: GAP FIXES - Top 10 Priority Features

// 1. TYPING INDICATORS
export const useTypingIndicator = (conversationId?: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  useEffect(() => {
    if (!conversationId) return;
    const ch = realtime.subscribe(`typing:${conversationId}`, (c) => {
      c.on("presence", { event: "sync" }, () => {
        const state = c.presenceState();
        const typers = Object.values(state).flat()
          .filter((p: any) => p.user_id !== user?.id && p.is_typing)
          .map((p: any) => p.user_id);
        setTypingUsers(typers);
      });
    });
    return () => { realtime.unsubscribe(`typing:${conversationId}`); };
  }, [conversationId, user?.id]);
  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !user) return;
    await supabase.channel(`typing:${conversationId}`).track({ user_id: user.id, is_typing: isTyping, updated_at: Date.now() });
  }, [conversationId, user]);
  return { typingUsers, setTyping };
};

// 2. DISTANCE FILTER
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useDistanceFilter = () => {
  const [maxDistance, setMaxDistance] = useState(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}, { enableHighAccuracy: true }
      );
    }
  }, []);
  const filterByDistance = useCallback((profiles: UserProfile[]) => {
    if (!userLocation) return profiles;
    return profiles.filter((p) => {
      if (!p.lat || !p.lng) return false;
      return haversine(userLocation.lat, userLocation.lng, p.lat, p.lng) <= maxDistance;
    });
  }, [userLocation, maxDistance]);
  return { maxDistance, setMaxDistance, userLocation, filterByDistance };
};

// 3. SWIPE MODE
export const useSwipeMode = (profiles: UserProfile[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedRight, setSwipedRight] = useState<string[]>([]);
  const [swipedLeft, setSwipedLeft] = useState<string[]>([]);
  const current = profiles[currentIndex] || null;
  const swipeRight = useCallback(() => {
    if (!current) return;
    setSwipedRight((prev) => [...prev, current.id]);
    setCurrentIndex((i) => i + 1);
  }, [current]);
  const swipeLeft = useCallback(() => {
    if (!current) return;
    setSwipedLeft((prev) => [...prev, current.id]);
    setCurrentIndex((i) => i + 1);
  }, [current]);
  const undo = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setSwipedRight((prev) => prev.slice(0, -1));
    setSwipedLeft((prev) => prev.slice(0, -1));
  }, [currentIndex]);
  return { current, currentIndex, swipeRight, swipeLeft, undo, swipedRight, swipedLeft, total: profiles.length };
};

// 4. PROFILE COMPLETENESS
export const useProfileCompleteness = (profile: UserProfile | null) => {
  const fields = [
    { key: "display_name", label: "Name", weight: 15 },
    { key: "bio", label: "Bio", weight: 20 },
    { key: "avatar_url", label: "Profile Photo", weight: 25 },
    { key: "age", label: "Age", weight: 10 },
    { key: "location", label: "Location", weight: 10 },
    { key: "interests", label: "Interests", weight: 10 },
    { key: "looking_for", label: "Looking For", weight: 10 },
  ];
  const completed = fields.filter((f) => {
    const val = (profile as any)?.[f.key];
    return val !== null && val !== undefined && val !== "" && (!Array.isArray(val) || val.length > 0);
  });
  const percentage = completed.reduce((sum, f) => sum + f.weight, 0);
  const missing = fields.filter((f) => !completed.includes(f));
  return { percentage, completed, missing, isComplete: percentage >= 90 };
};

// 5. MESSAGE SEARCH
export const useMessageSearch = (conversationId?: string) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [searching, setSearching] = useState(false);
  const search = useCallback(async (q: string) => {
    if (!conversationId || !q.trim()) { setResults([]); return; }
    setSearching(true);
    setQuery(q);
    const { data } = await supabase.from("messages").select("*")
      .eq("room_id", conversationId).ilike("content", `%${q}%`)
      .order("created_at", { ascending: false }).limit(20);
    setResults((data as Message[]) || []);
    setSearching(false);
  }, [conversationId]);
  return { query, results, searching, search };
};

// 6. PUSH NOTIFICATIONS
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_KEY || ""),
      });
      setSubscription(sub);
      const { user } = (await auth.getSession()).data;
      if (user) await supabase.from("push_subscriptions").upsert({ user_id: user.id, subscription: JSON.stringify(sub) });
    }
    return result === "granted";
  }, []);
  const sendLocal = useCallback((title: string, body: string, icon?: string) => {
    if (permission === "granted") new Notification(title, { body, icon });
  }, [permission]);
  return { permission, requestPermission, sendLocal, subscription };
};

// 7. EMAIL VERIFICATION
export const useEmailVerification = () => {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  useEffect(() => { setVerified(!!user?.email_confirmed_at); }, [user]);
  const resend = useCallback(async () => {
    if (!user?.email) return;
    setSending(true);
    await supabase.auth.resend({ type: "signup", email: user.email });
    setSending(false);
  }, [user]);
  return { verified, sending, resend };
};

// 8. EVENT CALENDAR VIEW
export const useEventCalendar = (events: Event[]) => {
  const [viewDate, setViewDate] = useState(new Date());
  const monthEvents = events.filter((e) => {
    const d = new Date(e.starts_at);
    return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  });
  const dayEvents = useCallback((date: Date) => {
    return events.filter((e) => new Date(e.starts_at).toDateString() === date.toDateString());
  }, [events]);
  const nextMonth = useCallback(() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)), []);
  const prevMonth = useCallback(() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)), []);
  return { viewDate, monthEvents, dayEvents, nextMonth, prevMonth };
};

// 9. 2FA / MFA
export const use2FA = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkStatus = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setEnabled((data?.totp?.length || 0) > 0);
  }, []);
  const enroll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setLoading(false);
    return { qrCode: data?.totp?.qr_code, uri: data?.totp?.uri, secret: data?.totp?.secret, error };
  }, []);
  const verify = useCallback(async (factorId: string, code: string) => {
    const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
    if (!challenge) return { error: new Error("Challenge failed") };
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (!error) setEnabled(true);
    return { error };
  }, []);
  const unenroll = useCallback(async (factorId: string) => {
    await supabase.auth.mfa.unenroll({ factorId });
    setEnabled(false);
  }, []);
  return { enabled, loading, checkStatus, enroll, verify, unenroll };
};

// 10. IN-APP PURCHASES
export type PurchaseType = "boost" | "super_like" | "gift_rose" | "gift_diamond" | "gift_crown";

export interface PurchaseItem {
  type: PurchaseType;
  name: string;
  description: string;
  price_coins: number;
  icon: string;
}

export const PURCHASE_ITEMS: PurchaseItem[] = [
  { type: "boost", name: "Profile Boost", description: "Be seen by 10x more people for 30 min", price_coins: 100, icon: "🚀" },
  { type: "super_like", name: "Super Like", description: "Stand out with a special notification", price_coins: 25, icon: "⭐" },
  { type: "gift_rose", name: "Rose", description: "Send a beautiful rose", price_coins: 10, icon: "🌹" },
  { type: "gift_diamond", name: "Diamond", description: "A sparkling diamond gift", price_coins: 50, icon: "💎" },
  { type: "gift_crown", name: "Crown", description: "The ultimate gift of admiration", price_coins: 200, icon: "👑" },
];

export const useInAppPurchases = () => {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);
  useEffect(() => {
    if (!user) return;
    supabase.from("user_coins").select("balance").eq("user_id", user.id).single()
      .then(({ data }) => setCoins((data as any)?.balance || 0));
  }, [user]);
  const purchase = useCallback(async (item: PurchaseItem, targetUserId?: string) => {
    if (!user || coins < item.price_coins) return { error: new Error("Insufficient coins") };
    const { error } = await supabase.from("purchases").insert({
      user_id: user.id, type: item.type, target_user_id: targetUserId, coins_spent: item.price_coins,
    });
    if (!error) setCoins((c) => c - item.price_coins);
    return { error };
  }, [user, coins]);
  return { coins, purchase, items: PURCHASE_ITEMS };
};
