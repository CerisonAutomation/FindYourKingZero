// ⚡ Optimized React Query Hook
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {FilterState, Profile} from '../types';

// Query Keys Factory
export const datingKeys = {
  all: ['dating'] as const,
  profiles: (filters?: FilterState) => [...datingKeys.all, 'profiles', filters] as const,
  matches: () => [...datingKeys.all, 'matches'] as const,
  profile: (id: string) => [...datingKeys.all, 'profile', id] as const,
};

// Optimized Query Hook
export const useOptimizedQuery = <T>(
  key: string[],
  fetcher: () => Promise<T>,
  options = {}
) => {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });
};

// Dating-specific hooks
export const useProfiles = (filters?: FilterState) => {
  return useOptimizedQuery(
    datingKeys.profiles(filters),
    async () => {
      const response = await fetch('/api/dating/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters || {})
      });
      
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json() as Promise<Profile[]>;
    },
    {
      enabled: !!filters,
      select: (data: Profile[]) => data.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
    }
  );
};

export const useMatches = () => {
  return useOptimizedQuery(
    datingKeys.matches(),
    async () => {
      const response = await fetch('/api/dating/matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json() as Promise<Profile[]>;
    }
  );
};

export const useProfile = (id: string) => {
  return useOptimizedQuery(
    datingKeys.profile(id),
    async () => {
      const response = await fetch(`/api/dating/profile/${id}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json() as Promise<Profile>;
    },
    {
      enabled: !!id
    }
  );
};

// Mutation hooks
export const useLikeProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await fetch(`/api/dating/like/${profileId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to like profile');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: datingKeys.profiles() });
      queryClient.invalidateQueries({ queryKey: datingKeys.matches() });
    }
  });
};

export const usePassProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await fetch(`/api/dating/pass/${profileId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to pass profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datingKeys.profiles() });
    }
  });
};