// =====================================================
// Profile Grid Hook — Ensures profiles appear everywhere
// after creation (grid, map, feed, search, matches)
// =====================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface GridFilters {
  ageMin?: number;
  ageMax?: number;
  distanceKm?: number;
  verificationOnly?: boolean;
  onlineOnly?: boolean;
  hasPhoto?: boolean;
  tribes?: string[];
  lookingFor?: string[];
  lat?: number;
  lng?: number;
}

interface UseProfileGridOptions {
  pageSize?: number;
  filters?: GridFilters;
  realtime?: boolean;
}

export function useProfileGrid(options: UseProfileGridOptions = {}) {
  const { pageSize = 24, filters = {}, realtime = true } = options;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchProfiles = useCallback(async (reset = false) => {
    if (reset) {
      pageRef.current = 0;
      setHasMore(true);
    }

    setLoading(true);
    const from = pageRef.current * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .eq('is_banned', false)
      .order('last_active_at', { ascending: false })
      .range(from, to);

    if (filters.ageMin) query = query.gte('age', filters.ageMin);
    if (filters.ageMax) query = query.lte('age', filters.ageMax);
    if (filters.verificationOnly) query = query.eq('verification_status', 'verified');
    if (filters.hasPhoto) query = query.not('avatar_url', 'is', null);
    if (filters.onlineOnly) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      query = query.gte('last_active_at', fiveMinAgo);
    }

    const { data, error } = await query;

    if (!error && data) {
      if (reset) {
        setProfiles(data);
      } else {
        setProfiles(prev => [...prev, ...data.filter(p => !prev.some(e => e.id === p.id))]);
      }
      setHasMore(data.length === pageSize);
      pageRef.current += 1;
    }

    setLoading(false);
  }, [pageSize, filters]);

  const refresh = useCallback(() => fetchProfiles(true), [fetchProfiles]);
  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchProfiles(false);
  }, [loading, hasMore, fetchProfiles]);

  // Realtime subscription — new profiles appear instantly
  useEffect(() => {
    if (!realtime) return;

    const channel = supabase.channel('grid-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profiles',
      }, (payload) => {
        const newProfile = payload.new as Profile;
        if (newProfile.is_active && !newProfile.is_banned) {
          setProfiles(prev => {
            if (prev.some(p => p.id === newProfile.id)) return prev;
            return [newProfile, ...prev];
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      }, (payload) => {
        const updated = payload.new as Profile;
        setProfiles(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'profiles',
      }, (payload) => {
        const deleted = payload.old as any;
        setProfiles(prev => prev.filter(p => p.id !== deleted.id));
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [realtime]);

  // Initial fetch
  useEffect(() => {
    fetchProfiles(true);
  }, []);

  // ── Pull-to-refresh support ──────────────────────
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const PULL_THRESHOLD = 80;
  const pullStartY = useRef(0);

  const pullRef = useRef<HTMLDivElement | null>(null);

  const handlePullStart = useCallback((e: React.TouchEvent) => {
    const el = pullRef.current;
    if (el && el.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handlePullMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    const el = pullRef.current;
    if (!el || el.scrollTop !== 0) return;

    const diff = Math.max(0, e.touches[0].clientY - pullStartY.current);
    const damped = Math.min(diff * 0.5, PULL_THRESHOLD * 1.5);
    setPullDistance(damped);
  }, [isRefreshing]);

  const handlePullEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await refresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, isRefreshing, refresh]);

  return {
    profiles,
    loading,
    hasMore,
    loadMore,
    refresh,
    // Pull-to-refresh state
    pullDistance,
    pullProgress: Math.min(pullDistance / PULL_THRESHOLD, 1),
    isRefreshing,
    pullRef,
    pullHandlers: {
      onTouchStart: handlePullStart,
      onTouchMove: handlePullMove,
      onTouchEnd: handlePullEnd,
    },
  };
}

// =====================================================
// Profile Creation Hook — Creates profile + ensures
// it appears in grid, map, feed, search everywhere
// =====================================================
export function useProfileCreation() {
  const { toast } = useToast();

  const createProfile = useCallback(async (profileData: {
    displayName: string;
    age: number;
    bio?: string;
    avatarUrl?: string;
    lat?: number;
    lng?: number;
    tribes?: string[];
    lookingFor?: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create profile
    const { data, error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: profileData.displayName,
      age: profileData.age,
      bio: profileData.bio || null,
      avatar_url: profileData.avatarUrl || null,
      location: profileData.lat && profileData.lng
        ? `POINT(${profileData.lng} ${profileData.lat})`
        : null,
      is_active: true,
      onboarding_completed: true,
      last_active_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).select().single();

    if (error) throw error;

    // Insert tribes if provided
    if (profileData.tribes?.length) {
      await supabase.from('profiles').update({
        tribes: profileData.tribes,
      }).eq('user_id', user.id);
    }

    toast({ title: 'Profile created!', description: 'You\'re now visible to others.' });
    return data;
  }, [toast]);

  return { createProfile };
}
