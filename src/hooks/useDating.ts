// =============================================================================
// useDating.ts — Dating filter and matching preferences hook
// =============================================================================

import { useState, useCallback } from 'react';

export interface FilterPreferences {
  ageRange: [number, number];
  distanceRadius: number;
  tribes: string[];
  lookingFor: string[];
  showOnlineOnly: boolean;
  showVerifiedOnly: boolean;
}

const defaultPreferences: FilterPreferences = {
  ageRange: [18, 65],
  distanceRadius: 50,
  tribes: [],
  lookingFor: [],
  showOnlineOnly: false,
  showVerifiedOnly: false,
};

export function useDating() {
  const [filters, setFilters] = useState<FilterPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);

  const updateFilters = useCallback((updates: Partial<FilterPreferences>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultPreferences);
  }, []);

  const applyFilters = useCallback(async () => {
    setIsLoading(true);
    try {
      // Filter application logic would go here
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    filters,
    isLoading,
    updateFilters,
    resetFilters,
    applyFilters,
    defaultPreferences,
  };
}

export default useDating;