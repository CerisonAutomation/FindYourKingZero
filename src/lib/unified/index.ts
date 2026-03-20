import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { z } from 'zod';

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatters
export const formatters = {
  // Date formatting
  date: (date: string | Date, formatStr = 'MMM dd, yyyy') => {
    try {
      const parsedDate = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(parsedDate)) return 'Invalid date';
      return format(parsedDate, formatStr);
    } catch {
      return 'Invalid date';
    }
  },

  // Relative time formatting
  relativeTime: (date: string | Date) => {
    try {
      const parsedDate = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(parsedDate)) return 'Invalid date';
      return formatDistanceToNow(parsedDate, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  },

  // Currency formatting
  currency: (amount: number, currency = 'USD', locale = 'en-US') => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  },

  // Number formatting
  number: (num: number, options?: Intl.NumberFormatOptions) => {
    try {
      return new Intl.NumberFormat('en-US', options).format(num);
    } catch {
      return num.toString();
    }
  },

  // Percentage formatting
  percentage: (num: number, decimals = 1) => {
    try {
      return `${(num * 100).toFixed(decimals)}%`;
    } catch {
      return '0%';
    }
  },

  // File size formatting
  fileSize: (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  },

  // Phone number formatting
  phone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  // URL formatting
  url: (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return `https://${url}`;
    }
  },
};

// Validators
export const validators = {
  // Email validation
  email: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation
  phone: (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  // URL validation
  url: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Password validation
  password: (password: string, requirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  }) => {
    const errors: string[] = [];

    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters`);
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Username validation
  username: (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  // Age validation
  age: (age: number, min = 18, max = 120) => {
    return age >= min && age <= max && Number.isInteger(age);
  },

  // Zip code validation
  zipCode: (zipCode: string, country = 'US') => {
    if (country === 'US') {
      const usZipRegex = /^\d{5}(-\d{4})?$/;
      return usZipRegex.test(zipCode);
    }
    return zipCode.length > 0;
  },
};

// String utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Title case
  titleCase: (str: string) => {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Truncate text
  truncate: (str: string, length: number, suffix = '...') => {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },

  // Slugify
  slugify: (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Generate random string
  random: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Remove HTML tags
  stripHtml: (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  },

  // Extract text from HTML
  extractText: (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  },

  // Word count
  wordCount: (str: string) => {
    return str.trim().split(/\s+/).length;
  },

  // Character count
  charCount: (str: string, includeSpaces = true) => {
    return includeSpaces ? str.length : str.replace(/\s/g, '').length;
  },
};

// Array utilities
export const arrayUtils = {
  // Remove duplicates
  unique: <T>(arr: T[]) => [...new Set(arr)],

  // Group by key
  groupBy: <T, K extends keyof T>(arr: T[], key: K) => {
    return arr.reduce((groups, item) => {
      const group = item[key];
      const groupKey = String(group);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Sort by key
  sortBy: <T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') => {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Chunk array
  chunk: <T>(arr: T[], size: number) => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  // Flatten array
  flatten: <T>(arr: (T | T[])[]) => {
    return arr.reduce((flat: T[], item) => {
      return flat.concat(Array.isArray(item) ? item : [item]);
    }, [] as T[]);
  },

  // Paginate array
  paginate: <T>(arr: T[], page: number, pageSize: number) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return arr.slice(startIndex, endIndex);
  },

  // Find index by key
  findIndex: <T>(arr: T[], key: keyof T, value: any) => {
    return arr.findIndex(item => item[key] === value);
  },

  // Shuffle array
  shuffle: <T>(arr: T[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  },
};

// Object utilities
export const objectUtils = {
  // Deep merge
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof result[key] === 'object' &&
          result[key] !== null &&
          !Array.isArray(result[key])
        ) {
          result[key] = objectUtils.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key] as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  },

  // Pick keys
  pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => {
    return keys.reduce((result, key) => {
      if (key in obj) {
        result[key] = obj[key] as T[K];
      }
      return result;
    }, {} as Pick<T, K>);
  },

  // Omit keys
  omit: <T, K extends keyof T>(obj: T, keys: K[]) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result as Omit<T, K>;
  },

  // Check if empty
  isEmpty: (obj: any) => {
    if (obj == null) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },

  // Deep clone
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  },

  // Convert to query string
  toQueryString: (obj: Record<string, any>) => {
    return Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  },

  // Parse query string
  parseQueryString: (queryString: string) => {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },
};

// Storage utilities
export const storageUtils = {
  // Local storage with error handling
  local: {
    set: (key: string, value: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to set localStorage item:', error);
      }
    },
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.warn('Failed to get localStorage item:', error);
        return defaultValue || null;
      }
    },
    remove: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove localStorage item:', error);
      }
    },
    clear: () => {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    },
  },

  // Session storage with error handling
  session: {
    set: (key: string, value: any) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to set sessionStorage item:', error);
      }
    },
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.warn('Failed to get sessionStorage item:', error);
        return defaultValue || null;
      }
    },
    remove: (key: string) => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove sessionStorage item:', error);
      }
    },
    clear: () => {
      try {
        sessionStorage.clear();
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error);
      }
    },
  },
};

// Performance utilities
export const performanceUtils = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func(...args);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ) => {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize function
  memoize: <T extends (...args: any[]) => any>(
    func: T
  ) => {
    const cache = new Map();

    return (...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = func(...args);
      cache.set(key, result);
      return result;
    };
  },

  // Async retry
  retry: async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    throw new Error('Max retries exceeded');
  },
};

// Validation schemas
export const schemas = {
  // User profile schema
  userProfile: z.object({
    display_name: z.string().min(2).max(50),
    bio: z.string().max(500).optional(),
    age: z.number().min(18).max(120),
    gender: z.enum(['male', 'female', 'other']),
    interested_in: z.enum(['male', 'female', 'everyone']),
    location: z.string().min(1),
    interests: z.array(z.string()).max(10),
    photos: z.array(z.string().url()).max(6),
  }),

  // Event schema
  event: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    location: z.string().min(1),
    event_date: z.string().datetime(),
    start_time: z.string().time(),
    end_time: z.string().time().optional(),
    max_attendees: z.number().min(2).max(1000),
    is_private: z.boolean().default(false),
    requires_approval: z.boolean().default(false),
    price: z.number().min(0).default(0),
    tags: z.array(z.string()).max(10),
    rules: z.string().max(1000).optional(),
  }),

  // Message schema
  message: z.object({
    content: z.string().min(1).max(2000),
    conversation_id: z.string().uuid(),
    type: z.enum(['text', 'image', 'location', 'voice']).default('text'),
  }),

  // Authentication schema
  auth: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    remember_me: z.boolean().default(false),
  }),
};

// Export all utilities
export default {
  cn,
  formatters,
  validators,
  stringUtils,
  arrayUtils,
  objectUtils,
  storageUtils,
  performanceUtils,
  schemas,
};
