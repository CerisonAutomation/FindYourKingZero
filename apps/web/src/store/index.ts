// ═══════════════════════════════════════════════════════════════
// STORE: Zustand — Auth + Chat + Discovery + UI state
// 1kB, no providers, no boilerplate
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Match, Message, Notification, Screen, GeoPosition } from '@/types';

// ── Auth Store ────────────────────────────────────────────────
interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
    }),
    { name: 'king-auth' },
  ),
);

// ── Navigation Store ──────────────────────────────────────────
interface NavState {
  screen: Screen;
  history: Screen[];
  viewingProfile: UserProfile | null;
  activeChatUser: UserProfile | null;
  go: (screen: Screen, data?: { profile?: UserProfile; chatUser?: UserProfile }) => void;
  back: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  screen: 'landing',
  history: ['landing'],
  viewingProfile: null,
  activeChatUser: null,
  go: (screen, data) =>
    set((s) => ({
      screen,
      history: [...s.history, screen],
      viewingProfile: data?.profile ?? s.viewingProfile,
      activeChatUser: data?.chatUser ?? s.activeChatUser,
    })),
  back: () =>
    set((s) => {
      const h = [...s.history];
      h.pop();
      return { screen: h[h.length - 1] ?? 'landing', history: h };
    }),
}));

// ── Discovery Store ───────────────────────────────────────────
interface DiscoveryState {
  nearbyUsers: UserProfile[];
  onlineUsers: UserProfile[];
  filter: string;
  search: string;
  loading: boolean;
  setNearby: (users: UserProfile[]) => void;
  setOnline: (users: UserProfile[]) => void;
  setFilter: (f: string) => void;
  setSearch: (s: string) => void;
  setLoading: (l: boolean) => void;
  addUser: (user: UserProfile) => void;
  removeUser: (userId: string) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  nearbyUsers: [],
  onlineUsers: [],
  filter: 'all',
  search: '',
  loading: true,
  setNearby: (users) => set({ nearbyUsers: users }),
  setOnline: (users) => set({ onlineUsers: users }),
  setFilter: (f) => set({ filter: f }),
  setSearch: (s) => set({ search: s }),
  setLoading: (l) => set({ loading: l }),
  addUser: (user) =>
    set((s) => {
      const exists = s.nearbyUsers.find((u) => u.id === user.id);
      if (exists) {
        return { nearbyUsers: s.nearbyUsers.map((u) => (u.id === user.id ? user : u)) };
      }
      return { nearbyUsers: [...s.nearbyUsers, user] };
    }),
  removeUser: (userId) =>
    set((s) => ({ nearbyUsers: s.nearbyUsers.filter((u) => u.id !== userId) })),
}));

// ── Chat Store ────────────────────────────────────────────────
interface ChatState {
  matches: Match[];
  messages: Record<string, Message[]>;  // matchId -> messages
  typingUsers: Record<string, string[]>; // matchId -> typing userIds
  setMatches: (matches: Match[]) => void;
  addMessage: (matchId: string, msg: Message) => void;
  setMessages: (matchId: string, msgs: Message[]) => void;
  markRead: (matchId: string, msgIds: string[]) => void;
  setTyping: (matchId: string, userId: string, isTyping: boolean) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  matches: [],
  messages: {},
  typingUsers: {},
  setMatches: (matches) => set({ matches }),
  addMessage: (matchId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [matchId]: [...(s.messages[matchId] ?? []), msg],
      },
    })),
  setMessages: (matchId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [matchId]: msgs } })),
  markRead: (matchId, msgIds) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [matchId]: (s.messages[matchId] ?? []).map((m) =>
          msgIds.includes(m.id) ? { ...m, read: true } : m,
        ),
      },
    })),
  setTyping: (matchId, userId, isTyping) =>
    set((s) => {
      const current = s.typingUsers[matchId] ?? [];
      const next = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return { typingUsers: { ...s.typingUsers, [matchId]: next } };
    }),
  updateMatch: (matchId, updates) =>
    set((s) => ({
      matches: s.matches.map((m) => (m.id === matchId ? { ...m, ...updates } : m)),
    })),
}));

// ── Notification Store ────────────────────────────────────────
interface NotifState {
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  addNotification: (n) =>
    set((s) => ({ notifications: [n, ...s.notifications.filter((x) => x.id !== n.id)] })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
