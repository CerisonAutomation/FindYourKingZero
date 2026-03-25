// =====================================================
// KEYBOARD HANDLER — Mobile virtual keyboard UX
// Detects keyboard open/close, scrolls focused input
// into view, hides bottom nav when keyboard is visible
// =====================================================
import {useCallback, useEffect, useRef, useState} from 'react';

export interface UseKeyboardReturn {
  /** Whether the virtual keyboard is currently open */
  isOpen: boolean;
  /** Height of the keyboard in px (approximate) */
  keyboardHeight: number;
}

/**
 * Hook that tracks mobile virtual keyboard state via visualViewport API.
 * - Sets `isOpen` / `keyboardHeight`
 * - Adds `keyboard-hidden` class to bottom nav elements
 * - Scrolls focused inputs into view
 */
export function useKeyboard(): UseKeyboardReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const initialHeight = useRef(0);

  // Capture the initial viewport height on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (vv) {
      initialHeight.current = vv.height;
    } else {
      initialHeight.current = window.innerHeight;
    }
  }, []);

  const handleViewportResize = useCallback(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const currentHeight = vv.height;
    const diff = initialHeight.current - currentHeight;

    // Keyboard is open if viewport shrank by more than 100px
    const keyboardOpen = diff > 100;
    setIsOpen(keyboardOpen);
    setKeyboardHeight(keyboardOpen ? diff : 0);

    // Toggle class on bottom nav elements
    const navElements = document.querySelectorAll(
      '.bottom-nav-bar, [data-bottom-nav]',
    );
    navElements.forEach((el) => {
      if (keyboardOpen) {
        el.classList.add('keyboard-hidden');
      } else {
        el.classList.remove('keyboard-hidden');
      }
    });
  }, []);

  // Listen to visualViewport resize (keyboard open/close)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    vv.addEventListener('resize', handleViewportResize);
    handleViewportResize(); // initial check

    return () => {
      vv.removeEventListener('resize', handleViewportResize);
      // Cleanup: remove keyboard-hidden classes
      const navElements = document.querySelectorAll(
        '.bottom-nav-bar, [data-bottom-nav]',
      );
      navElements.forEach((el) => el.classList.remove('keyboard-hidden'));
    };
  }, [handleViewportResize]);

  // Auto-scroll focused input into view
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        // Delay to allow keyboard to animate open
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  return { isOpen, keyboardHeight };
}

export default useKeyboard;
