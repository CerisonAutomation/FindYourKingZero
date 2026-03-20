import {useCallback, useEffect, useRef, useState} from 'react';
import {useToast} from './use-toast';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number | null;
    error: GeolocationPositionError | null;
    isLoading: boolean;
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    watchPosition?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 0,
        watchPosition = false,
    } = options;

    const {toast} = useToast();
    const watchIdRef = useRef<number | null>(null);

    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: null,
        error: null,
        isLoading: false,
    });

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            error: null,
            isLoading: false,
        });
    }, []);

    const handleError = useCallback((error: GeolocationPositionError) => {
        setState((prev) => ({
            ...prev,
            error,
            isLoading: false,
        }));

        let message = 'Could not get your location.';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location permission denied. Please enable in settings.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location unavailable. Please try again.';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out. Please try again.';
                break;
        }

        toast({
            title: 'Location Error',
            description: message,
            variant: 'destructive',
        });
    }, [toast]);

    const getCurrentPosition = useCallback(() => {
        if (!navigator.geolocation) {
            toast({
                title: 'Geolocation Not Supported',
                description: 'Your browser does not support geolocation.',
                variant: 'destructive',
            });
            return;
        }

        setState((prev) => ({...prev, isLoading: true}));

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            enableHighAccuracy,
            timeout,
            maximumAge,
        });
    }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, toast]);

    // Watch position if enabled
    useEffect(() => {
        if (!watchPosition || !navigator.geolocation) return;

        setState((prev) => ({...prev, isLoading: true}));

        watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy,
                timeout,
                maximumAge,
            }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [watchPosition, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    return {
        ...state,
        getCurrentPosition,
        stopWatching,
        isSupported: typeof navigator !== 'undefined' && !!navigator.geolocation,
    };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    unit: 'km' | 'mi' = 'mi'
): number {
    const R = unit === 'km' ? 6371 : 3959; // Earth's radius
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
