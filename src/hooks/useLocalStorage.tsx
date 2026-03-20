import {useCallback, useEffect, useState} from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

/**
 * Persist state to localStorage with type safety
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, SetValue<T>, () => void] {
    // Get stored value or use initial
    const readValue = useCallback((): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Return a wrapped version of useState's setter function
    const setValue: SetValue<T> = useCallback(
        (value) => {
            if (typeof window === 'undefined') {
                console.warn(
                    `Tried setting localStorage key "${key}" even though environment is not a client`
                );
            }

            try {
                const newValue = value instanceof Function ? value(storedValue) : value;
                window.localStorage.setItem(key, JSON.stringify(newValue));
                setStoredValue(newValue);

                // Dispatch a custom event to notify other instances
                window.dispatchEvent(new StorageEvent('storage', {key}));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    // Remove the value from localStorage
    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [initialValue, key]);

    // Listen for storage changes from other tabs/windows
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
                setStoredValue(readValue());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, readValue]);

    return [storedValue, setValue, removeValue];
}

/**
 * Session storage hook (clears on browser close)
 */
export function useSessionStorage<T>(
    key: string,
    initialValue: T
): [T, SetValue<T>, () => void] {
    const readValue = useCallback((): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.sessionStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error);
            return initialValue;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState<T>(readValue);

    const setValue: SetValue<T> = useCallback(
        (value) => {
            try {
                const newValue = value instanceof Function ? value(storedValue) : value;
                window.sessionStorage.setItem(key, JSON.stringify(newValue));
                setStoredValue(newValue);
            } catch (error) {
                console.warn(`Error setting sessionStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    const removeValue = useCallback(() => {
        try {
            window.sessionStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Error removing sessionStorage key "${key}":`, error);
        }
    }, [initialValue, key]);

    return [storedValue, setValue, removeValue];
}
