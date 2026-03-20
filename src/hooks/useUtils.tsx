import {useCallback, useEffect, useRef, useState} from 'react';

interface UseClipboardOptions {
    successDuration?: number;
}

interface UseClipboardReturn {
    copy: (text: string) => Promise<boolean>;
    isCopied: boolean;
    error: Error | null;
}

/**
 * Copy text to clipboard with success state
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
    const {successDuration = 2000} = options;
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const copy = useCallback(
        async (text: string): Promise<boolean> => {
            if (!navigator.clipboard) {
                setError(new Error('Clipboard API not supported'));
                return false;
            }

            try {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                setError(null);

                // Reset copied state after duration
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    setIsCopied(false);
                }, successDuration);

                return true;
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to copy'));
                setIsCopied(false);
                return false;
            }
        },
        [successDuration]
    );

    return {copy, isCopied, error};
}

/**
 * Hook for detecting clicks outside an element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    callback: () => void
): React.RefObject<T> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [callback]);

    return ref;
}

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyboardShortcut(
    keys: string[],
    callback: () => void,
    options: { enabled?: boolean; preventDefault?: boolean } = {}
): void {
    const {enabled = true, preventDefault = true} = options;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const pressedKeys: string[] = [];

            if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl');
            if (event.shiftKey) pressedKeys.push('shift');
            if (event.altKey) pressedKeys.push('alt');
            pressedKeys.push(event.key.toLowerCase());

            const normalizedKeys = keys.map((k) => k.toLowerCase());
            const isMatch = normalizedKeys.every((key) =>
                pressedKeys.includes(key)
            );

            if (isMatch) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callback();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keys, callback, enabled, preventDefault]);
}

/**
 * Hook for intersection observer
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
    options: IntersectionObserverInit = {}
): [React.RefObject<T>, boolean] {
    const ref = useRef<T>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [options]);

    return [ref, isIntersecting];
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * Hook for mounting state
 */
export function useMounted(): boolean {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}

/**
 * Hook for document visibility
 */
export function useDocumentVisibility(): boolean {
    const [isVisible, setIsVisible] = useState(
        typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
    );

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState === 'visible');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return isVisible;
}

/**
 * Hook for detecting online status
 */
export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}
