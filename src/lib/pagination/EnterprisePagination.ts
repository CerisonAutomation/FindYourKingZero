import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { z } from 'zod';

// Configuration schema with enterprise defaults
const PaginationConfigSchema = z.object({
  defaultPageSize: z.number().min(1).max(1000).default(20),
  maxPageSize: z.number().min(10).max(10000).default(100),
  pageSizeOptions: z.array(z.number()).default([10, 20, 50, 100]),
  enableVirtualScrolling: z.boolean().default(false),
  virtualThreshold: z.number().min(100).default(1000),
  enablePrefetching: z.boolean().default(true),
  prefetchThreshold: z.number().min(0.1).max(1).default(0.8),
  enableInfiniteScroll: z.boolean().default(false),
  debounceMs: z.number().min(50).max(1000).default(300),
  cacheSize: z.number().min(10).max(1000).default(100),
  enableSmartLoading: z.boolean().default(true),
});

export type PaginationConfig = z.infer<typeof PaginationConfigSchema>;

// Enhanced pagination state interface
export interface EnterprisePaginationState <T = any> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  hasMore: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  error: Error | null;
  cache: Map<string, T[]>;
  lastFetchTime: number;
  fetchCount: number;
}

// Pagination result interface
export interface PaginationResult <T = any> extends EnterprisePaginationState<T> {
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
  reset: () => void;
  prefetchNextPage: () => Promise<void>;
  clearCache: () => void;
  getPageInfo: () => PageInfo;
  getVisibleRange: () => { start: number; end: number };
}

// Page information interface
export interface PageInfo  {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  visibleItems: number;
  hiddenItems: number;
  progress: number;
}

// Fetch function interface
export type FetchFunction<T = any> = (
  page: number,
  pageSize: number,
  signal?: AbortSignal
) => Promise<{
  data: T[];
  totalCount: number;
  hasMore?: boolean;
}>;

// Smart loading strategies
enum LoadingStrategy {
  IMMEDIATE = 'immediate',
  DEBOUNCED = 'debounced',
  THROTTLED = 'throttled',
  PREDICTIVE = 'predictive',
}

// Enterprise Pagination Hook
export function useEnterprisePagination<T = any>(
  fetchFunction: FetchFunction<T>,
  config: Partial<PaginationConfig> = {}
): PaginationResult<T> {
  const finalConfig = useMemo(() => PaginationConfigSchema.parse(config), [config]);

  // State management
  const [state, setState] = useState<EnterprisePaginationState<T>>({
    data: [],
    currentPage: 1,
    pageSize: finalConfig.defaultPageSize,
    totalCount: 0,
    totalPages: 0,
    isLoading: false,
    isFetching: false,
    hasMore: false,
    hasNextPage: false,
    hasPreviousPage: false,
    error: null,
    cache: new Map(),
    lastFetchTime: 0,
    fetchCount: 0,
  });

  // Refs for optimization
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchQueueRef = useRef<Set<number>>(new Set());

  // Cache key generation
  const generateCacheKey = useCallback((page: number, pageSize: number) => {
    return `${page}:${pageSize}`;
  }, []);

  // Smart loading strategy selection
  const selectLoadingStrategy = useCallback(() => {
    if (!finalConfig.enableSmartLoading) return LoadingStrategy.IMMEDIATE;

    const { fetchCount, lastFetchTime } = state;
    const timeSinceLastFetch = Date.now() - lastFetchTime;

    if (fetchCount > 10 && timeSinceLastFetch < 5000) {
      return LoadingStrategy.THROTTLED;
    } else if (fetchCount > 5 && timeSinceLastFetch < 2000) {
      return LoadingStrategy.DEBOUNCED;
    } else if (fetchCount > 3) {
      return LoadingStrategy.PREDICTIVE;
    }

    return LoadingStrategy.IMMEDIATE;
  }, [state.fetchCount, state.lastFetchTime, finalConfig.enableSmartLoading]);

  // Enhanced data fetching with cancellation and caching
  const fetchData = useCallback(async (
    page: number,
    pageSize: number,
    options: { silent?: boolean; signal?: AbortSignal } = {}
  ) => {
    const cacheKey = generateCacheKey(page, pageSize);

    // Check cache first
    if (state.cache.has(cacheKey) && !options.silent) {
      const cachedData = state.cache.get(cacheKey)!;
      return {
        data: cachedData,
        totalCount: state.totalCount,
        hasMore: state.hasMore,
      };
    }

    // Cancel previous request if not silent
    if (!options.silent && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = options.signal || controller.signal;

    try {
      setState(prev => ({
        ...prev,
        isLoading: !options.silent,
        isFetching: true,
        error: null,
      }));

      const result = await fetchFunction(page, pageSize, signal);

      // Update cache
      if (!options.silent) {
        setState(prev => {
          const newCache = new Map(prev.cache);
          newCache.set(cacheKey, result.data);

          // Limit cache size
          if (newCache.size > finalConfig.cacheSize) {
            const firstKey = newCache.keys().next().value;
            if (firstKey) {
              newCache.delete(firstKey);
            }
          }

          return {
            ...prev,
            data: result.data,
            totalCount: result.totalCount,
            totalPages: Math.ceil(result.totalCount / pageSize),
            hasMore: result.hasMore ?? page * pageSize < result.totalCount,
            hasNextPage: page * pageSize < result.totalCount,
            hasPreviousPage: page > 1,
            cache: newCache,
            lastFetchTime: Date.now(),
            fetchCount: prev.fetchCount + 1,
          };
        });
      }

      return result;
    } catch (error) {
      if (signal.aborted) return { data: [], totalCount: 0, hasMore: false };

      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
        isFetching: false,
      }));

      throw error;
    } finally {
      if (!options.silent) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isFetching: false,
        }));
      }
    }
  }, [fetchFunction, generateCacheKey, state.cache, state.totalCount, state.hasMore, finalConfig.cacheSize]);

  // Debounced fetch
  const debouncedFetch = useCallback((page: number, pageSize: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData(page, pageSize);
    }, finalConfig.debounceMs);
  }, [fetchData, finalConfig.debounceMs]);

  // Navigation functions
  const nextPage = useCallback(() => {
    if (state.hasNextPage && !state.isLoading) {
      const nextPage = state.currentPage + 1;
      const strategy = selectLoadingStrategy();

      switch (strategy) {
        case LoadingStrategy.DEBOUNCED:
          debouncedFetch(nextPage, state.pageSize);
          break;
        case LoadingStrategy.THROTTLED:
          setTimeout(() => fetchData(nextPage, state.pageSize), 500);
          break;
        case LoadingStrategy.PREDICTIVE:
          fetchData(nextPage, state.pageSize);
          prefetchNextPage();
          break;
        default:
          fetchData(nextPage, state.pageSize);
      }

      setState(prev => ({ ...prev, currentPage: nextPage }));
    }
  }, [state.hasNextPage, state.isLoading, state.currentPage, state.pageSize, fetchData, debouncedFetch, selectLoadingStrategy]);

  const previousPage = useCallback(() => {
    if (state.hasPreviousPage && !state.isLoading) {
      const prevPage = state.currentPage - 1;
      setState(prev => ({ ...prev, currentPage: prevPage }));
      fetchData(prevPage, state.pageSize);
    }
  }, [state.hasPreviousPage, state.isLoading, state.currentPage, state.pageSize, fetchData]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages && !state.isLoading) {
      setState(prev => ({ ...prev, currentPage: page }));
      fetchData(page, state.pageSize);
    }
  }, [state.totalPages, state.isLoading, state.pageSize, fetchData]);

  const setPageSize = useCallback((newPageSize: number) => {
    if (newPageSize >= 1 && newPageSize <= finalConfig.maxPageSize) {
      setState(prev => ({ ...prev, pageSize: newPageSize }));
      fetchData(1, newPageSize);
    }
  }, [finalConfig.maxPageSize, fetchData]);

  const refresh = useCallback(() => {
    fetchData(state.currentPage, state.pageSize);
  }, [state.currentPage, state.pageSize, fetchData]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: [],
      currentPage: 1,
      pageSize: finalConfig.defaultPageSize,
      totalCount: 0,
      totalPages: 0,
      isLoading: false,
      isFetching: false,
      hasMore: false,
      hasNextPage: false,
      hasPreviousPage: false,
      error: null,
      cache: new Map(),
      lastFetchTime: 0,
      fetchCount: 0,
    }));
  }, [finalConfig.defaultPageSize]);

  const clearCache = useCallback(() => {
    setState(prev => ({ ...prev, cache: new Map() }));
  }, []);

  // Prefetch next page
  const prefetchNextPage = useCallback(async () => {
    if (!finalConfig.enablePrefetching || !state.hasNextPage) return;

    const nextPage = state.currentPage + 1;
    const cacheKey = generateCacheKey(nextPage, state.pageSize);

    if (!state.cache.has(cacheKey) && !prefetchQueueRef.current.has(nextPage)) {
      prefetchQueueRef.current.add(nextPage);

      try {
        await fetchData(nextPage, state.pageSize, { silent: true });
      } catch (error) {
        // Silent fail for prefetch
      } finally {
        prefetchQueueRef.current.delete(nextPage);
      }
    }
  }, [finalConfig.enablePrefetching, state.hasNextPage, state.currentPage, state.pageSize, state.cache, fetchData, generateCacheKey]);

  // Get page information
  const getPageInfo = useCallback((): PageInfo => {
    const { currentPage, totalPages, totalCount, pageSize, hasNextPage, hasPreviousPage } = state;
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    const visibleItems = state.data.length;
    const hiddenItems = totalCount - visibleItems;
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

    return {
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      hasNextPage,
      hasPreviousPage,
      isFirstPage,
      isLastPage,
      visibleItems,
      hiddenItems,
      progress,
    };
  }, [state]);

  // Get visible range
  const getVisibleRange = useCallback(() => {
    const start = (state.currentPage - 1) * state.pageSize + 1;
    const end = Math.min(start + state.data.length - 1, state.totalCount);
    return { start, end };
  }, [state.currentPage, state.pageSize, state.data.length, state.totalCount]);

  // Effects
  useEffect(() => {
    // Initial data fetch
    if (state.totalCount === 0 && !state.isLoading) {
      fetchData(1, state.pageSize);
    }
  }, []);

  useEffect(() => {
    // Prefetch when reaching threshold
    const progress = state.totalPages > 0 ? state.currentPage / state.totalPages : 0;
    if (progress >= finalConfig.prefetchThreshold && finalConfig.enablePrefetching) {
      prefetchNextPage();
    }
  }, [state.currentPage, state.totalPages, finalConfig.prefetchThreshold, finalConfig.enablePrefetching, prefetchNextPage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    refresh,
    reset,
    prefetchNextPage,
    clearCache,
    getPageInfo,
    getVisibleRange,
  };
}

// Virtual scrolling hook for large datasets
export function useVirtualScrolling<T = any>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop),
  };
}

// Pagination utilities
export const paginationUtils = {
  // Generate page numbers for pagination controls
  generatePageNumbers: (currentPage: number, totalPages: number, maxVisible: number = 7) => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - halfVisible);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  },

  // Format page info for display
  formatPageInfo: (info: PageInfo) => {
    const { start, end } = info.visibleItems > 0
      ? { start: 1, end: info.visibleItems }
      : { start: 0, end: 0 };

    return `Showing ${start}-${end} of ${info.totalCount} items`;
  },

  // Calculate optimal page size based on container
  calculateOptimalPageSize: (containerHeight: number, itemHeight: number, buffer: number = 2) => {
    return Math.max(1, Math.floor(containerHeight / itemHeight) - buffer);
  },
};

export default useEnterprisePagination;
