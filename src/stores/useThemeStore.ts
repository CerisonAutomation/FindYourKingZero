import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {supabase} from '@/integrations/supabase/client';

export type ThemeId = 'zenith' | 'cobalt' | 'emerald' | 'amethyst' | 'carbon' | 'rose';

export type ThemeConfig  = {
    id: ThemeId;
    name: string;
    emoji: string;
    desc: string;
    primary: string;
    accent: string;
    preview: [string, string, string];
}

export const THEMES: ThemeConfig[] = [
    {
        id: 'zenith',
        name: 'Zenith Gold',
        emoji: '👑',
        desc: 'Regal crimson & gold',
        primary: '0 90% 62%',
        accent: '35 95% 58%',
        preview: ['#ef4444', '#f97316', '#0A0A0F'],
    },
    {
        id: 'cobalt',
        name: 'Cobalt King',
        emoji: '⚡',
        desc: 'Electric blue power',
        primary: '220 88% 60%',
        accent: '200 90% 55%',
        preview: ['#3b82f6', '#06b6d4', '#080810'],
    },
    {
        id: 'emerald',
        name: 'Emerald Hunter',
        emoji: '🌿',
        desc: 'Deep forest vitality',
        primary: '152 68% 40%',
        accent: '170 75% 45%',
        preview: ['#10b981', '#14b8a6', '#080F0C'],
    },
    {
        id: 'amethyst',
        name: 'Amethyst God',
        emoji: '💜',
        desc: 'Mystic purple dominance',
        primary: '270 78% 62%',
        accent: '290 75% 60%',
        preview: ['#a855f7', '#d946ef', '#0A080F'],
    },
    {
        id: 'carbon',
        name: 'Carbon Black',
        emoji: '🖤',
        desc: 'Minimal monochrome',
        primary: '0 0% 85%',
        accent: '0 0% 65%',
        preview: ['#d4d4d4', '#a3a3a3', '#050505'],
    },
    {
        id: 'rose',
        name: 'Rose Desire',
        emoji: '🌹',
        desc: 'Warm rose passion',
        primary: '350 82% 60%',
        accent: '15 90% 58%',
        preview: ['#f43f5e', '#fb923c', '#0F080A'],
    },
];

interface ThemeState {
    themeId: ThemeId;
    setTheme: (id: ThemeId, userId?: string) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeId: 'zenith',
            setTheme: async (id, userId) => {
                set({themeId: id});
                applyTheme(id);
                if (userId) {
                    try {
                        await supabase
                            .from('user_themes' as any)
                            .upsert({user_id: userId, theme_id: id}, {onConflict: 'user_id'});
                    } catch (_) { /* silent */
                    }
                }
            },
        }),
        {name: 'fyk-theme'}
    )
);

export function applyTheme(id: ThemeId) {
    const theme = THEMES.find(t => t.id === id);
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))`);
    root.style.setProperty('--shadow-glow', `0 0 36px hsl(${theme.primary} / 0.22)`);
    root.style.setProperty('--shadow-glow-sm', `0 0 18px hsl(${theme.primary} / 0.14)`);
    if (id === 'carbon') {
        root.style.setProperty('--background', '0 0% 4%');
        root.style.setProperty('--card', '0 0% 8%');
    } else if (id === 'cobalt') {
        root.style.setProperty('--background', '225 20% 5%');
        root.style.setProperty('--card', '225 18% 9%');
    } else if (id === 'emerald') {
        root.style.setProperty('--background', '160 15% 5%');
        root.style.setProperty('--card', '160 12% 9%');
    } else if (id === 'amethyst') {
        root.style.setProperty('--background', '270 15% 5%');
        root.style.setProperty('--card', '270 12% 9%');
    } else if (id === 'rose') {
        root.style.setProperty('--background', '350 12% 5%');
        root.style.setProperty('--card', '350 10% 9%');
    } else {
        root.style.setProperty('--background', '240 6% 5%');
        root.style.setProperty('--card', '240 5% 9%');
    }
}
