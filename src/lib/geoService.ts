/**
 * Singleton GeoService for location utilities.
 * Wraps browser Geolocation API with distance calculations.
 */
export class GeoService {
    private static instance: GeoService;
    private watchId: number | null = null;
    private currentPosition: GeolocationPosition | null = null;

    get isSupported(): boolean {
        return typeof navigator !== 'undefined' && !!navigator.geolocation;
    }

    static getInstance(): GeoService {
        if (!GeoService.instance) {
            GeoService.instance = new GeoService();
        }
        return GeoService.instance;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula.
     * Returns distance in the specified unit.
     */
    static calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
        unit: 'km' | 'mi' = 'mi'
    ): number {
        const R = unit === 'km' ? 6371 : 3959;
        const dLat = GeoService.toRad(lat2 - lat1);
        const dLon = GeoService.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(GeoService.toRad(lat1)) *
            Math.cos(GeoService.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    }

    /**
     * Format a distance value for display.
     */
    static formatDistance(distance: number, unit: 'km' | 'mi' = 'mi'): string {
        if (distance < 0.1) return 'Nearby';
        if (distance < 1) return `< 1 ${unit}`;
        return `${distance.toFixed(1)} ${unit}`;
    }

    private static toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /** Start continuous location tracking */
    startTracking(callback: (position: GeolocationPosition) => void): void {
        if (!this.isSupported) throw new Error('Geolocation not supported');

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentPosition = position;
                callback(position);
            },
            (error) => console.error('Location error:', error),
            {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
        );
    }

    /** Stop tracking */
    stopTracking(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    /** One-shot position request */
    async getCurrentPosition(): Promise<GeolocationPosition> {
        if (!this.isSupported) throw new Error('Geolocation not supported');
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            });
        });
    }

    /** Get last known position (may be null) */
    getLastPosition(): GeolocationPosition | null {
        return this.currentPosition;
    }
}
