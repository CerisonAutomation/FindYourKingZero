import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format utilities
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    });
}

export function formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(dateObj);
}

export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

export function formatAge(birthDate: Date | string): number {
    const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
        age--;
    }

    return age;
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export function shuffle<T>(array: readonly T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j] as T;
        shuffled[j] = temp;
    }
    return shuffled;
}

export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {} as Record<string, T[]>);
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Local storage utilities
export function getLocalStorageItem<T>(key: string, defaultValue?: T): T | null {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
    } catch {
        return defaultValue || null;
    }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Failed to set localStorage item:', error);
    }
}

export function removeLocalStorageItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove localStorage item:', error);
    }
}

// Image utilities
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return '';

    // If it's already a Supabase URL, add optimization parameters
    if (url.includes('supabase.co')) {
        const params = new URLSearchParams();
        if (width) params.set('width', width.toString());
        if (height) params.set('height', height.toString());
        params.set('quality', '80');
        params.set('format', 'webp');

        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${params.toString()}`;
    }

    return url;
}

export function generateBlurHash(width: number, height: number): string {
    // Simple blur hash generation for placeholder
    return `${width}x${height}:placeholder`;
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
    } : null;
}

export function getContrastColor(hex: string): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Error handling utilities
export function createSafeAsync<T>(
    asyncFn: () => Promise<T>
): () => Promise<[T | null, Error | null]> {
    return async () => {
        try {
            const result = await asyncFn();
            return [result, null];
        } catch (error) {
            return [null, error as Error];
        }
    };
}

// Performance utilities
export function measurePerformance<T>(
    fn: () => T,
    label?: string
): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (label) {
        console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
}

// Accessibility utilities
export function generateAriaLabel(action: string, object: string): string {
    return `${action} ${object}`;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
        container.querySelectorAll(focusableSelectors.join(', '))
    ) as HTMLElement[];
}

// Type guards
export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

export function isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
}

export function isFunction(value: unknown): value is (...args: any[]) => any {
    return typeof value === 'function';
}
