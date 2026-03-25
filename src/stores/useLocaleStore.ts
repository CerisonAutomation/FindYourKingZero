import {create} from 'zustand';
import {initLocale, type Locale, setLocale, t as translate} from '@/lib/i18n';

interface LocaleStore {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, fallback?: string) => string;
}

export const useLocaleStore = create<LocaleStore>((set) => ({
    locale: initLocale(),
    setLocale: (locale: Locale) => {
        setLocale(locale);
        set({locale});
    },
    t: translate,
}));
