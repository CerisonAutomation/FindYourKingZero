export const FEATURES = {
    AI: import.meta.env.VITE_FEATURE_AI === '1',
    STRIPE: import.meta.env.VITE_FEATURE_STRIPE === '1',
    CALLS: import.meta.env.VITE_FEATURE_CALLS === '1',
    PWA: import.meta.env.VITE_FEATURE_PWA !== '0',
    REALTIME: import.meta.env.VITE_FEATURE_REALTIME !== '0',
    METRICS: import.meta.env.VITE_FEATURE_METRICS !== '0',
} as const;

export type FeatureKey = keyof typeof FEATURES;

export const isEnabled = (feature: FeatureKey): boolean => FEATURES[feature];
