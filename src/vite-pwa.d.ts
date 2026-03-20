// PWA virtual module types
declare module 'virtual:pwa-register' {
    export type RegisterSWOptions = {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
        onRegisterError?: (error: any) => void;
    };

    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'virtual:pwa-register/react' {
    export type UseRegisterSWOptions = {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
        onRegisterError?: (error: any) => void;
    };

    export function useRegisterSW(options?: UseRegisterSWOptions): {
        needRefresh: [boolean, (v: boolean) => void];
        offlineReady: [boolean, (v: boolean) => void];
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
    };
}
