// =====================================================
// SWIPE GESTURE HOOK — Touch-based gesture detection
// Swipe right = like, left = pass, down = close
// =====================================================
import {type RefObject, useCallback, useRef, useState} from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeState {
  /** Current horizontal offset (px) */
  deltaX: number;
  /** Current vertical offset (px) */
  deltaY: number;
  /** Whether user is actively swiping */
  isSwiping: boolean;
  /** Detected direction during swipe */
  direction: SwipeDirection | null;
  /** Velocity in px/ms */
  velocity: number;
}

export interface UseSwipeOptions {
  /** Minimum distance in px to trigger swipe callback */
  threshold?: number;
  /** Maximum duration in ms for a swipe gesture */
  maxDuration?: number;
  /** Minimum velocity in px/ms to trigger */
  minVelocity?: number;
  /** Prevent vertical scroll while swiping horizontally */
  preventScroll?: boolean;
  /** Enable horizontal swipes */
  horizontal?: boolean;
  /** Enable vertical swipes */
  vertical?: boolean;
  /** Callback when swipe is confirmed */
  onSwipe?: (direction: SwipeDirection, velocity: number) => void;
  /** Callback during swipe (for UI updates like card translation) */
  onSwiping?: (state: SwipeState) => void;
  /** Callback when swipe starts */
  onSwipeStart?: () => void;
  /** Callback when swipe ends (may or may not trigger onSwipe) */
  onSwipeEnd?: () => void;
}

export interface UseSwipeReturn {
  /** Attach to the swipeable container */
  ref: RefObject<HTMLDivElement | null>;
  /** Current swipe state */
  state: SwipeState;
  /** Touch event handlers — spread on the target element */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

const DEFAULT_STATE: SwipeState = {
  deltaX: 0,
  deltaY: 0,
  isSwiping: false,
  direction: null,
  velocity: 0,
};

export function useSwipe(options: UseSwipeOptions = {}): UseSwipeReturn {
  const {
    threshold = 50,
    maxDuration = 500,
    minVelocity = 0.3,
    preventScroll = false,
    horizontal = true,
    vertical = true,
    onSwipe,
    onSwiping,
    onSwipeStart,
    onSwipeEnd,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<SwipeState>(DEFAULT_STATE);

  const startRef = useRef({ x: 0, y: 0, time: 0 });
  const lockedRef = useRef(false); // direction lock — once locked, ignore perpendicular

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      lockedRef.current = false;
      setState((s) => ({ ...s, isSwiping: true, direction: null }));
      onSwipeStart?.();
    },
    [onSwipeStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!state.isSwiping && !startRef.current.time) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startRef.current.x;
      const deltaY = touch.clientY - startRef.current.y;
      const elapsed = Date.now() - startRef.current.time;

      // Lock direction based on first significant movement
      if (!lockedRef.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        lockedRef.current = true;

        if (horizontal && Math.abs(deltaX) > Math.abs(deltaY)) {
          setState((s) => ({
            ...s,
            direction: deltaX > 0 ? 'right' : 'left',
            deltaX,
            deltaY: 0,
            velocity: Math.abs(deltaX) / Math.max(elapsed, 1),
          }));
          if (preventScroll) e.preventDefault();
          return;
        }

        if (vertical && Math.abs(deltaY) > Math.abs(deltaX)) {
          setState((s) => ({
            ...s,
            direction: deltaY > 0 ? 'down' : 'up',
            deltaX: 0,
            deltaY,
            velocity: Math.abs(deltaY) / Math.max(elapsed, 1),
          }));
          return;
        }
      }

      // Continue tracking in locked direction
      if (lockedRef.current) {
        const d = state.direction;
        if ((d === 'left' || d === 'right') && horizontal) {
          if (preventScroll) e.preventDefault();
          const velocity = Math.abs(deltaX) / Math.max(elapsed, 1);
          const newState: SwipeState = {
            deltaX,
            deltaY: 0,
            isSwiping: true,
            direction: deltaX > 0 ? 'right' : 'left',
            velocity,
          };
          setState(newState);
          onSwiping?.(newState);
        } else if ((d === 'up' || d === 'down') && vertical) {
          const velocity = Math.abs(deltaY) / Math.max(elapsed, 1);
          const newState: SwipeState = {
            deltaX: 0,
            deltaY,
            isSwiping: true,
            direction: deltaY > 0 ? 'down' : 'up',
            velocity,
          };
          setState(newState);
          onSwiping?.(newState);
        }
      }
    },
    [state.isSwiping, state.direction, horizontal, vertical, preventScroll, onSwiping],
  );

  const handleTouchEnd = useCallback(() => {
    const elapsed = Date.now() - startRef.current.time;
    const { direction, deltaX, deltaY, velocity } = state;

    if (direction && elapsed < maxDuration) {
      const dist =
        direction === 'left' || direction === 'right'
          ? Math.abs(deltaX)
          : Math.abs(deltaY);

      if (dist >= threshold || velocity >= minVelocity) {
        onSwipe?.(direction, velocity);
      }
    }

    onSwipeEnd?.();
    setState(DEFAULT_STATE);
    startRef.current = { x: 0, y: 0, time: 0 };
    lockedRef.current = false;
  }, [state, threshold, maxDuration, minVelocity, onSwipe, onSwipeEnd]);

  return {
    ref,
    state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

export default useSwipe;
