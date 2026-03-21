// =====================================================
// VIRTUAL SCROLL HOOK — Render only visible items
// For long message lists with efficient memory usage
// =====================================================
import { useRef, useState, useCallback, useEffect, type RefObject } from 'react';

export interface UseVirtualScrollOptions {
  /** Height of each item in px (fixed) */
  itemHeight: number;
  /** Number of items to render outside viewport */
  overscan?: number;
  /** Total number of items */
  itemCount: number;
}

export interface UseVirtualScrollReturn {
  /** Ref to attach to the scroll container */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Items to render (start index + end index) */
  virtualItems: Array<{
    index: number;
    /** Offset from top of the virtual list */
    offsetTop: number;
  }>;
  /** Total height of the virtual list */
  totalHeight: number;
  /** Scroll to a specific item */
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
  /** Currently visible start index */
  startIndex: number;
  /** Currently visible end index */
  endIndex: number;
}

export function useVirtualScroll({
  itemHeight,
  overscan = 5,
  itemCount,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Track scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      setScrollTop(el.scrollTop);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    // Also set initial height
    setContainerHeight(el.clientHeight);

    // Observe container resize
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);

  const virtualItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      index: i,
      offsetTop: i * itemHeight,
    });
  }

  const totalHeight = itemCount * itemHeight;

  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      const el = containerRef.current;
      if (!el) return;

      let targetTop: number;
      if (align === 'start') {
        targetTop = index * itemHeight;
      } else if (align === 'center') {
        targetTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
      } else {
        targetTop = index * itemHeight - containerHeight + itemHeight;
      }

      el.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    },
    [itemHeight, containerHeight],
  );

  return {
    containerRef,
    virtualItems,
    totalHeight,
    scrollToIndex,
    startIndex,
    endIndex,
  };
}

export default useVirtualScroll;
