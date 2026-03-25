// 🎯 Feature-Sliced State Management - Dating Store
import {create} from 'zustand';
import {devtools, persist, subscribeWithSelector} from 'zustand/middleware';
import type {DatingActions, FilterState, Profile} from '../types';

interface DatingStore {
  // State
  profiles: Profile[];
  matches: Profile[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  currentProfile: Profile | null;
  
  // Actions
  actions: DatingActions;
}

const initialFilters: FilterState = {
  ageRange: [18, 65],
  distance: 50,
  interests: [],
  relationshipGoals: [],
  verifiedOnly: false,
  onlineOnly: false
};

export const useDatingStore = create<DatingStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial State
        profiles: [],
        matches: [],
        filters: initialFilters,
        isLoading: false,
        error: null,
        currentProfile: null,
        
        // Actions
        actions: {
          loadProfiles: async (filters?: Partial<FilterState>) => {
            set({ isLoading: true, error: null });
            
            try {
              const currentFilters = { ...get().filters, ...filters };
              const response = await fetch('/api/dating/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentFilters)
              });
              
              if (!response.ok) throw new Error('Failed to load profiles');
              
              const profiles = await response.json();
              
              set({ 
                profiles, 
                filters: currentFilters,
                isLoading: false 
              });
            } catch (error) {
              set({ 
                error: error instanceof Error ? error.message : 'Unknown error',
                isLoading: false 
              });
            }
          },
          
          updateFilters: (filters: Partial<FilterState>) => {
            set({ filters: { ...get().filters, ...filters } });
          },
          
          likeProfile: async (profileId: string) => {
            try {
              await fetch(`/api/dating/like/${profileId}`, { method: 'POST' });
              
              // Update local state
              set(state => ({
                profiles: state.profiles.map(p => 
                  p.id === profileId ? { ...p, isLiked: true } : p
                )
              }));
            } catch (error) {
              set({ error: 'Failed to like profile' });
            }
          },
          
          passProfile: async (profileId: string) => {
            try {
              await fetch(`/api/dating/pass/${profileId}`, { method: 'POST' });
              
              // Remove from current profiles
              set(state => ({
                profiles: state.profiles.filter(p => p.id !== profileId)
              }));
            } catch (error) {
              set({ error: 'Failed to pass profile' });
            }
          },
          
          setCurrentProfile: (profile: Profile | null) => {
            set({ currentProfile: profile });
          },
          
          resetFilters: () => {
            set({ filters: initialFilters });
          },
          
          clearError: () => {
            set({ error: null });
          }
        }
      })),
      {
        name: 'dating-store',
        partialize: (state) => ({
          filters: state.filters,
          matches: state.matches.slice(0, 50) // Cache only first 50 matches
        })
      }
    ),
    { name: 'dating-store' }
  )
);

// Selectors for optimized re-renders
export const useProfiles = () => useDatingStore(state => state.profiles);
export const useMatches = () => useDatingStore(state => state.matches);
export const useFilters = () => useDatingStore(state => state.filters);
export const useDatingActions = () => useDatingStore(state => state.actions);
export const useDatingLoading = () => useDatingStore(state => state.isLoading);
export const useDatingError = () => useDatingStore(state => state.error);