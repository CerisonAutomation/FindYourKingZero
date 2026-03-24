import type { UserProfile, Message, KingEvent } from '@/types';
// ═══════════════════════════════════════════════════════════════
// SERVICES: API Client — Hono backend (Vercel serverless or standalone)
//
// Base URL resolution:
//   VITE_API_URL set  → use that URL (standalone Hono server)
//   VITE_API_URL empty/unset → use '' (relative URLs → Vercel serverless /api/*)
// ═══════════════════════════════════════════════════════════════

import { useAuthStore } from '@/store';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText, body);
  }

  return res.json();
}

export const api = {
  // Auth
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ user: { id: string; email: string; name: string }; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { email: string; password: string; name: string; age: number }) =>
      request<{ user: { id: string; email: string; name: string }; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    verify: () => request<{ user: { id: string; email: string; name: string }; token?: string }>('/auth/verify'),
    forgotPassword: (data: { email: string }) =>
      request<void>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
  },

  // Users
  users: {
    getProfile: (id: string) => request<UserProfile>(`/users/${id}`),
    updateProfile: (data: Record<string, unknown>) =>
      request<Partial<UserProfile>>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
    getNearby: (h3Hexes: string[], limit = 20) =>
      request<any[]>(`/users/nearby?hexes=${h3Hexes.join(',')}&limit=${limit}`),
    search: (query: string) => request<any[]>(`/users/search?q=${encodeURIComponent(query)}`),
    block: (userId: string) =>
      request<void>(`/users/${userId}/block`, { method: 'POST' }),
    unblock: (userId: string) =>
      request<void>(`/users/${userId}/block`, { method: 'DELETE' }),
    report: (userId: string, reason: string) =>
      request<void>(`/users/${userId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  // Matches
  matches: {
    list: () => request<any[]>('/matches'),
    swipe: (userId: string, action: 'like' | 'pass' | 'superlike') =>
      request<{ matched: boolean; match?: any }>('/matches/swipe', {
        method: 'POST',
        body: JSON.stringify({ userId, action }),
      }),
    getSuggestions: () => request<any[]>('/matches/suggestions'),
  },

  // Messages
  messages: {
    list: (matchId: string, cursor?: string) =>
      request<any[]>(`/messages/${matchId}${cursor ? `?cursor=${cursor}` : ''}`),
    send: (matchId: string, content: string, type = 'text') =>
      request<any>('/messages', {
        method: 'POST',
        body: JSON.stringify({ matchId, content, type }),
      }),
    markRead: (matchId: string) =>
      request<void>(`/messages/${matchId}/read`, { method: 'POST' }),
  },

  // Events
  events: {
    list: (filters?: { type?: string; attending?: boolean }) => {
      const params = new URLSearchParams();
      if (filters?.type) params.set('type', filters.type);
      if (filters?.attending) params.set('attending', 'true');
      return request<any[]>(`/events?${params}`);
    },
    create: (data: Record<string, unknown>) =>
      request<any>('/events', { method: 'POST', body: JSON.stringify(data) }),
    update: (eventId: string, data: Record<string, unknown>) =>
      request<any>(`/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    rsvp: (eventId: string, going: boolean) =>
      request<void>(`/events/${eventId}/rsvp`, {
        method: 'POST',
        body: JSON.stringify({ going }),
      }),
  },

  // Presence
  presence: {
    update: (data: { h3Hex: string; lat: number; lng: number; online: boolean; intent?: string }) =>
      request<void>('/presence', { method: 'POST', body: JSON.stringify(data) }),
  },
};
