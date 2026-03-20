import {format, formatDistanceToNow, isThisWeek, isThisYear, isToday, isYesterday} from 'date-fns';

/**
 * Format a date for display in chat/messages
 */
export function formatMessageTime(date: string | Date): string {
    const d = new Date(date);

    if (isToday(d)) {
        return format(d, 'h:mm a');
    }

    if (isYesterday(d)) {
        return 'Yesterday';
    }

    if (isThisWeek(d)) {
        return format(d, 'EEEE'); // Day name
    }

    if (isThisYear(d)) {
        return format(d, 'MMM d');
    }

    return format(d, 'MMM d, yyyy');
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    try {
        return formatDistanceToNow(new Date(date), {addSuffix: true});
    } catch {
        return 'Unknown';
    }
}

/**
 * Format a date for event display
 */
export function formatEventDate(date: string | Date): string {
    const d = new Date(date);

    if (isToday(d)) {
        return 'Today';
    }

    if (isYesterday(d)) {
        return 'Yesterday';
    }

    return format(d, 'EEE, MMM d');
}

/**
 * Format time only (e.g., "2:30 PM")
 */
export function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes);
    return format(d, 'h:mm a');
}

/**
 * Format distance in a human-readable way
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m away`;
    }

    const km = meters / 1000;
    if (km < 10) {
        return `${km.toFixed(1)}km away`;
    }

    return `${Math.round(km)}km away`;
}

/**
 * Format distance in miles
 */
export function formatDistanceMiles(miles: number): string {
    if (miles < 0.1) {
        return 'Nearby';
    }

    if (miles < 1) {
        return `${(miles * 5280).toFixed(0)}ft away`;
    }

    if (miles < 10) {
        return `${miles.toFixed(1)} mi away`;
    }

    return `${Math.round(miles)} mi away`;
}

/**
 * Format height in feet and inches
 */
export function formatHeight(cm: number): string {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
}

/**
 * Format weight in lbs
 */
export function formatWeight(kg: number): string {
    const lbs = Math.round(kg * 2.205);
    return `${lbs} lbs`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format large numbers with abbreviations (e.g., 1.2K, 3.5M)
 */
export function formatCompactNumber(num: number): string {
    if (num < 1000) return num.toString();

    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const suffixIndex = Math.floor(Math.log10(num) / 3);
    const shortNum = num / Math.pow(1000, suffixIndex);

    return shortNum.toFixed(1).replace(/\.0$/, '') + suffixes[suffixIndex];
}

/**
 * Format a rating to one decimal place
 */
export function formatRating(rating: number): string {
    return rating.toFixed(1);
}

/**
 * Format duration in hours
 */
export function formatDuration(hours: number): string {
    if (hours < 1) {
        return `${Math.round(hours * 60)} min`;
    }

    if (hours === 1) {
        return '1 hour';
    }

    if (hours % 1 === 0) {
        return `${hours} hours`;
    }

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours % 1) * 60);

    if (wholeHours === 0) {
        return `${minutes} min`;
    }

    return `${wholeHours}h ${minutes}m`;
}

/**
 * Format last seen status
 */
export function formatLastSeen(lastSeen: string | Date | null | undefined): string {
    if (!lastSeen) return 'Unknown';

    const d = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 5) return 'A few minutes ago';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return format(d, 'MMM d');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
