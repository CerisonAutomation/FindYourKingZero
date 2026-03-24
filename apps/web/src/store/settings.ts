// ═══════════════════════════════════════════════════════════════
// STORE: Settings — Language, privacy, travel, notifications
// Extends the base store with user preference management
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n';

interface NotificationPrefs {
  push: boolean;
  email: boolean;
  inApp: boolean;
  matches: boolean;
  messages: boolean;
  events: boolean;
  marketing: boolean;
}

interface TravelMode {
  enabled: boolean;
  city: string;
  lat: number;
  lng: number;
  until: string;
}

interface PrivacySettings {
  incognito: boolean;
  hideDistance: boolean;
  hideAge: boolean;
  hideOnlineStatus: boolean;
  readReceipts: boolean;
  blockScreenshots: boolean;
}

interface CookiePrefs {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface SettingsState {
  // Language
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Notifications
  notifications: NotificationPrefs;
  setNotifications: (prefs: Partial<NotificationPrefs>) => void;

  // Privacy
  privacy: PrivacySettings;
  setPrivacy: (settings: Partial<PrivacySettings>) => void;

  // Travel
  travel: TravelMode;
  setTravel: (mode: Partial<TravelMode>) => void;
  enableTravel: (city: string, lat: number, lng: number, until: string) => void;
  disableTravel: () => void;

  // Cookies
  cookies: CookiePrefs;
  setCookies: (prefs: Partial<CookiePrefs>) => void;
  acceptAllCookies: () => void;
  rejectAllCookies: () => void;

  // Theme
  theme: 'dark' | 'light' | 'auto';
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Language
      locale: 'en' as Locale,
      setLocale: (locale) => set({ locale }),

      // Notifications
      notifications: {
        push: true,
        email: true,
        inApp: true,
        matches: true,
        messages: true,
        events: true,
        marketing: false,
      },
      setNotifications: (prefs) =>
        set((s) => ({ notifications: { ...s.notifications, ...prefs } })),

      // Privacy
      privacy: {
        incognito: false,
        hideDistance: false,
        hideAge: false,
        hideOnlineStatus: false,
        readReceipts: true,
        blockScreenshots: false,
      },
      setPrivacy: (settings) =>
        set((s) => ({ privacy: { ...s.privacy, ...settings } })),

      // Travel
      travel: {
        enabled: false,
        city: '',
        lat: 0,
        lng: 0,
        until: '',
      },
      setTravel: (mode) => set((s) => ({ travel: { ...s.travel, ...mode } })),
      enableTravel: (city, lat, lng, until) =>
        set({ travel: { enabled: true, city, lat, lng, until } }),
      disableTravel: () =>
        set((s) => ({ travel: { ...s.travel, enabled: false } })),

      // Cookies
      cookies: {
        essential: true,
        analytics: false,
        marketing: false,
        functional: true,
      },
      setCookies: (prefs) =>
        set((s) => ({ cookies: { ...s.cookies, ...prefs } })),
      acceptAllCookies: () =>
        set({ cookies: { essential: true, analytics: true, marketing: true, functional: true } }),
      rejectAllCookies: () =>
        set({ cookies: { essential: true, analytics: false, marketing: false, functional: false } }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'king-settings' },
  ),
);