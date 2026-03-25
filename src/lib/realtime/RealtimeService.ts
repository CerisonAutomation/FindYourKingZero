// =====================================================
// RealtimeService — Supabase Realtime + Trystero P2P
// Proven patterns from official Supabase docs
// =====================================================
import {supabase} from '@/integrations/supabase/client';
import type {RealtimeChannel} from '@supabase/supabase-js';

// ── Channel Management ──────────────────────────────
const channels = new Map<string, RealtimeChannel>();

function getChannel(name: string): RealtimeChannel {
  if (!channels.has(name)) {
    channels.set(name, supabase.channel(name));
  }
  return channels.get(name)!;
}

// ── Messages Realtime ───────────────────────────────
export function subscribeToMessages(
  conversationId: string,
  onInsert: (msg: any) => void,
  onUpdate?: (msg: any) => void
) {
  const ch = getChannel(`messages:${conversationId}`);
  ch.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => onInsert(payload.new));

  if (onUpdate) {
    ch.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => onUpdate(payload.new));
  }

  ch.subscribe();
  return () => { supabase.removeChannel(ch); channels.delete(`messages:${conversationId}`); };
}

// ── Conversations Realtime ──────────────────────────
export function subscribeToConversations(
  userId: string,
  onChange: (conv: any, event: string) => void
) {
  const ch = getChannel(`conversations:${userId}`);
  ch.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'conversations',
    filter: `participant_a=eq.${userId}`,
  }, (payload) => onChange(payload.new, payload.eventType));

  ch.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'conversations',
    filter: `participant_b=eq.${userId}`,
  }, (payload) => onChange(payload.new, payload.eventType));

  ch.subscribe();
  return () => { supabase.removeChannel(ch); channels.delete(`conversations:${userId}`); };
}

// ── Notifications Realtime ──────────────────────────
export function subscribeToNotifications(
  userId: string,
  onNew: (notif: any) => void
) {
  const ch = getChannel(`notifications:${userId}`);
  ch.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => onNew(payload.new));

  ch.subscribe();
  return () => { supabase.removeChannel(ch); channels.delete(`notifications:${userId}`); };
}

// ── Presence (online status) ────────────────────────
export function subscribeToPresence(
  userId: string,
  onPresence: (users: any[]) => void
) {
  const ch = getChannel(`presence:${userId}`);

  ch.on('presence', { event: 'sync' }, () => {
    const state = ch.presenceState();
    const users = Object.values(state).flat();
    onPresence(users);
  });

  ch.on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // console.log('User joined:', key, newPresences);
  });

  ch.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // console.log('User left:', key, leftPresences);
  });

  ch.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await ch.track({ user_id: userId, online_at: new Date().toISOString() });
    }
  });

  return {
    unsubscribe: () => { supabase.removeChannel(ch); channels.delete(`presence:${userId}`); },
    updateStatus: (status: string) => ch.track({ user_id: userId, status, online_at: new Date().toISOString() }),
  };
}

// ── Typing Indicator ────────────────────────────────
export function subscribeToTyping(
  conversationId: string,
  userId: string,
  onTyping: (data: { userId: string; isTyping: boolean }) => void
) {
  const ch = getChannel(`typing:${conversationId}`);

  ch.on('broadcast', { event: 'typing' }, (payload) => {
    if (payload.payload.userId !== userId) {
      onTyping(payload.payload);
    }
  });

  ch.subscribe();

  let timer: ReturnType<typeof setTimeout> | null = null;
  const sendTyping = (isTyping: boolean) => {
    if (timer) clearTimeout(timer);
    ch.send({ type: 'broadcast', event: 'typing', payload: { userId, isTyping } });
    if (isTyping) {
      timer = setTimeout(() => ch.send({ type: 'broadcast', event: 'typing', payload: { userId, isTyping: false } }), 3000);
    }
  };

  return {
    sendTyping,
    unsubscribe: () => { if (timer) clearTimeout(timer); supabase.removeChannel(ch); channels.delete(`typing:${conversationId}`); },
  };
}

// ── Profile Updates (grid realtime) ─────────────────
export function subscribeToProfileUpdates(
  onInsert: (profile: any) => void,
  onUpdate: (profile: any) => void,
  onDelete: (profile: any) => void
) {
  const ch = getChannel('profiles-global');
  ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (p) => onInsert(p.new));
  ch.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (p) => onUpdate(p.new));
  ch.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, (p) => onDelete(p.old));
  ch.subscribe();
  return () => { supabase.removeChannel(ch); channels.delete('profiles-global'); };
}

// ── Taps/Likes Realtime ─────────────────────────────
export function subscribeToTaps(
  userId: string,
  onNew: (tap: any) => void
) {
  const ch = getChannel(`taps:${userId}`);
  ch.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'taps',
    filter: `to_user_id=eq.${userId}`,
  }, (p) => onNew(p.new));
  ch.subscribe();
  return () => { supabase.removeChannel(ch); channels.delete(`taps:${userId}`); };
}

// ── Cleanup All ─────────────────────────────────────
export function unsubscribeAll() {
  channels.forEach((ch) => supabase.removeChannel(ch));
  channels.clear();
}
