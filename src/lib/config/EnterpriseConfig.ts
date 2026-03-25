import {z} from 'zod';
import {useEffect, useState} from 'react';

// Configuration schema with validation
const EnterpriseConfigSchema = z.object({
  // Application settings
  app: z.object({
    name: z.string().default('FindYourKingZero'),
    version: z.string().default('2.0.0'),
    environment: z.enum(['development', 'staging', 'production']).default('development'),
    debug: z.boolean().default(false),
  }),

  // API endpoints
  api: z.object({
    baseUrl: z.string().url(),
    timeout: z.number().positive().default(30000),
    retryAttempts: z.number().min(0).max(5).default(3),
    retryDelay: z.number().positive().default(1000),
  }),

  // Supabase configuration
  supabase: z.object({
    url: z.string().url(),
    anonKey: z.string().min(1),
    serviceRoleKey: z.string().min(1).optional(),
    realtime: z.object({
      enabled: z.boolean().default(true),
      reconnectInterval: z.number().positive().default(5000),
      maxReconnectAttempts: z.number().min(0).default(10),
    }),
  }),

  // AI configuration
  ai: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(['openai', 'anthropic', 'local']).default('openai'),
    model: z.string().default('gpt-4-turbo-preview'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().positive().default(1000),
    timeout: z.number().positive().default(30000),
    features: z.object({
      chat: z.boolean().default(true),
      streaming: z.boolean().default(true),
      quickReplies: z.boolean().default(true),
      moderation: z.boolean().default(true),
      analysis: z.boolean().default(true),
      matching: z.boolean().default(true),
    }),
  }),

  // P2P configuration
  p2p: z.object({
    enabled: z.boolean().default(true),
    strategies: z.array(z.enum(['webrtc', 'bittorrent', 'nostr', 'mqtt', 'ipfs'])).default(['webrtc']),
    signaling: z.object({
      servers: z.array(z.string().url()).default([]),
      timeout: z.number().positive().default(10000),
    }),
    location: z.object({
      enableGeohash: z.boolean().default(true),
      precision: z.number().min(1).max(12).default(7),
      privacyRadius: z.number().positive().default(1000), // meters
    }),
  }),

  // Security configuration
  security: z.object({
    encryption: z.object({
      algorithm: z.string().default('AES-256-GCM'),
      keyRotationInterval: z.number().positive().default(86400000), // 24 hours
      enablePerfectForwardSecrecy: z.boolean().default(true),
    }),
    authentication: z.object({
      sessionTimeout: z.number().positive().default(3600000), // 1 hour
      maxLoginAttempts: z.number().min(1).default(5),
      lockoutDuration: z.number().positive().default(900000), // 15 minutes
      enableMFA: z.boolean().default(true),
    }),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      windowMs: z.number().positive().default(900000), // 15 minutes
      maxRequests: z.number().positive().default(100),
      enableBurstProtection: z.boolean().default(true),
      burstLimit: z.number().positive().default(20),
    }),
  }),

  // Performance configuration
  performance: z.object({
    caching: z.object({
      enabled: z.boolean().default(true),
      ttl: z.number().positive().default(300000), // 5 minutes
      maxSize: z.number().positive().default(100), // items
    }),
    pagination: z.object({
      defaultPageSize: z.number().min(1).max(1000).default(20),
      maxPageSize: z.number().min(10).max(10000).default(100),
      pageSizeOptions: z.array(z.number()).default([10, 20, 50, 100]),
      enableVirtualScrolling: z.boolean().default(false),
      virtualThreshold: z.number().min(100).default(1000),
      enablePrefetching: z.boolean().default(true),
      prefetchThreshold: z.number().min(0.1).max(1).default(0.8),
    }),
    imageOptimization: z.object({
      enabled: z.boolean().default(true),
      quality: z.number().min(1).max(100).default(80),
      enableWebP: z.boolean().default(true),
      enableLazyLoading: z.boolean().default(true),
    }),
  }),

  // UI configuration
  ui: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    animations: z.object({
      enabled: z.boolean().default(true),
      duration: z.number().positive().default(300),
      easing: z.string().default('ease-in-out'),
    }),
    accessibility: z.object({
      enableScreenReader: z.boolean().default(true),
      enableKeyboardNavigation: z.boolean().default(true),
      enableHighContrast: z.boolean().default(false),
      fontSize: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
    }),
    components: z.object({
      chat: z.object({
        enableAIReactions: z.boolean().default(true),
        enableQuickReplies: z.boolean().default(true),
        enableEmojiPicker: z.boolean().default(true),
        enableFileUpload: z.boolean().default(true),
        enableVoiceMessages: z.boolean().default(true),
        enableVideoCall: z.boolean().default(true),
        enableEncryptionNotice: z.boolean().default(true),
        maxMessageLength: z.number().positive().default(1000),
        typingTimeout: z.number().positive().default(2000),
      }),
      pagination: z.object({
        showPageInfo: z.boolean().default(true),
        showPageSizeSelector: z.boolean().default(true),
        showRefreshButton: z.boolean().default(false),
        showJumpButtons: z.boolean().default(true),
        maxVisiblePages: z.number().min(3).max(15).default(7),
      }),
    }),
  }),

  // Monitoring configuration
  monitoring: z.object({
    enabled: z.boolean().default(true),
    analytics: z.object({
      enabled: z.boolean().default(true),
      provider: z.enum(['google', 'mixpanel', 'amplitude', 'custom']).default('google'),
      trackingId: z.string().optional(),
    }),
    errorTracking: z.object({
      enabled: z.boolean().default(true),
      provider: z.enum(['sentry', 'bugsnag', 'rollbar', 'custom']).default('sentry'),
      dsn: z.string().optional(),
    }),
    performance: z.object({
      enabled: z.boolean().default(true),
      webVitals: z.boolean().default(true),
      enableRUM: z.boolean().default(true),
    }),
  }),

  // Feature flags
  features: z.object({
    enableAI: z.boolean().default(true),
    enableP2P: z.boolean().default(true),
    enableRealtime: z.boolean().default(true),
    enableAnalytics: z.boolean().default(true),
    enablePushNotifications: z.boolean().default(true),
    enableOfflineMode: z.boolean().default(true),
    enableDarkMode: z.boolean().default(true),
    enableMultiLanguage: z.boolean().default(false),
    enableBetaFeatures: z.boolean().default(false),
  }),
});

export type EnterpriseConfig = z.infer<typeof EnterpriseConfigSchema>;

// Configuration loader class
class EnterpriseConfigManager {
  private static instance: EnterpriseConfigManager;
  private config: EnterpriseConfig | null = null;
  private configLoadPromise: Promise<EnterpriseConfig> | null = null;

  static getInstance(): EnterpriseConfigManager {
    if (!EnterpriseConfigManager.instance) {
      EnterpriseConfigManager.instance = new EnterpriseConfigManager();
    }
    return EnterpriseConfigManager.instance;
  }

  async loadConfig(): Promise<EnterpriseConfig> {
    if (this.config) return this.config;

    if (this.configLoadPromise) {
      return this.configLoadPromise;
    }

    this.configLoadPromise = this.initializeConfig();
    return this.configLoadPromise;
  }

  private async initializeConfig(): Promise<EnterpriseConfig> {
    try {
      // Load environment variables
      const envConfig = this.loadEnvironmentConfig();

      // Load remote configuration if available
      const remoteConfig = await this.loadRemoteConfig();

      // Merge configurations
      const mergedConfig = this.mergeConfigs(envConfig, remoteConfig);

      // Validate configuration
      const validatedConfig = EnterpriseConfigSchema.parse(mergedConfig);

      this.config = validatedConfig;
      return validatedConfig;
    } catch (error) {
      console.error('Failed to load configuration:', error);

      // Fallback to default configuration
      const fallbackConfig = EnterpriseConfigSchema.parse({});
      this.config = fallbackConfig;
      return fallbackConfig;
    }
  }

  private loadEnvironmentConfig(): Partial<EnterpriseConfig> {
    return {
      app: {
        name: import.meta.env.VITE_APP_NAME || 'FindYourKingZero',
        version: import.meta.env.VITE_APP_VERSION || '2.0.0',
        environment: (import.meta.env.VITE_APP_ENV as any) || 'development',
        debug: import.meta.env.VITE_DEBUG === 'true',
      },
      api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
        retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
      },
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        // NOTE: serviceRoleKey must NEVER be set in client-side code.
        // Server-side functions use Deno.env.get('SUPABASE_SERVICE_ROLE_KEY').
        serviceRoleKey: undefined,
        realtime: {
          enabled: import.meta.env.VITE_ENABLE_REALTIME !== 'false',
          reconnectInterval: parseInt(import.meta.env.VITE_REALTIME_RECONNECT_INTERVAL || '5000'),
          maxReconnectAttempts: parseInt(import.meta.env.VITE_REALTIME_MAX_RECONNECTS || '10'),
        },
      },
      ai: {
        enabled: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
        provider: (import.meta.env.VITE_AI_PROVIDER as any) || 'openai',
        model: import.meta.env.VITE_AI_MODEL || 'gpt-4-turbo-preview',
        temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '1000'),
        timeout: parseInt(import.meta.env.VITE_AI_TIMEOUT || '30000'),
        features: {
          chat: import.meta.env.VITE_ENABLE_AI_CHAT !== 'false',
          streaming: import.meta.env.VITE_ENABLE_AI_STREAMING !== 'false',
          quickReplies: import.meta.env.VITE_ENABLE_AI_QUICK_REPLIES !== 'false',
          moderation: import.meta.env.VITE_ENABLE_AI_MODERATION !== 'false',
          analysis: import.meta.env.VITE_ENABLE_AI_ANALYSIS !== 'false',
          matching: import.meta.env.VITE_ENABLE_AI_MATCHING !== 'false',
        },
      },
      p2p: {
        enabled: import.meta.env.VITE_ENABLE_P2P_FEATURES !== 'false',
        strategies: import.meta.env.VITE_P2P_STRATEGIES?.split(',') || ['webrtc'],
        signaling: {
          servers: import.meta.env.VITE_P2P_SIGNALING_SERVERS?.split(',') || [],
          timeout: parseInt(import.meta.env.VITE_P2P_SIGNALING_TIMEOUT || '10000'),
        },
        location: {
          enableGeohash: import.meta.env.VITE_ENABLE_GEOHASH !== 'false',
          precision: parseInt(import.meta.env.VITE_GEOHASH_PRECISION || '7'),
          privacyRadius: parseInt(import.meta.env.VITE_LOCATION_PRIVACY_RADIUS || '1000'),
        },
      },
      monitoring: {
        enabled: import.meta.env.VITE_ENABLE_MONITORING !== 'false',
        analytics: {
          enabled: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
          provider: (import.meta.env.VITE_ANALYTICS_PROVIDER as any) || 'google',
          trackingId: import.meta.env.VITE_ANALYTICS_TRACKING_ID,
        },
        errorTracking: {
          enabled: import.meta.env.VITE_ENABLE_ERROR_TRACKING !== 'false',
          provider: (import.meta.env.VITE_ERROR_TRACKING_PROVIDER as any) || 'sentry',
          dsn: import.meta.env.VITE_ERROR_TRACKING_DSN,
        },
        performance: {
          enabled: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
          webVitals: import.meta.env.VITE_ENABLE_WEB_VITALS !== 'false',
          enableRUM: import.meta.env.VITE_ENABLE_RUM !== 'false',
        },
      },
      features: {
        enableAI: import.meta.env.VITE_ENABLE_AI !== 'false',
        enableP2P: import.meta.env.VITE_ENABLE_P2P !== 'false',
        enableRealtime: import.meta.env.VITE_ENABLE_REALTIME !== 'false',
        enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
        enablePushNotifications: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS !== 'false',
        enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE !== 'false',
        enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
        enableMultiLanguage: import.meta.env.VITE_ENABLE_MULTI_LANGUAGE === 'true',
        enableBetaFeatures: import.meta.env.VITE_ENABLE_BETA_FEATURES === 'true',
      },
    };
  }

  private async loadRemoteConfig(): Promise<Partial<EnterpriseConfig>> {
    try {
      // In production, you might load configuration from a remote service
      if (import.meta.env.VITE_ENABLE_REMOTE_CONFIG === 'true') {
        const response = await fetch('/api/config');
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.warn('Failed to load remote configuration:', error);
    }

    return {};
  }

  private mergeConfigs(...configs: Partial<EnterpriseConfig>[]): Partial<EnterpriseConfig> {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {});
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  getConfig(): EnterpriseConfig | null {
    return this.config;
  }

  updateConfig(updates: Partial<EnterpriseConfig>): void {
    if (this.config) {
      this.config = EnterpriseConfigSchema.parse(this.deepMerge(this.config, updates));
    }
  }

  resetConfig(): void {
    this.config = null;
    this.configLoadPromise = null;
  }
}

// Configuration hook for React components
export function useEnterpriseConfig() {
  const [config, setConfig] = useState<EnterpriseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const configManager = EnterpriseConfigManager.getInstance();
        const loadedConfig = await configManager.loadConfig();
        setConfig(loadedConfig);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
}

// Configuration utilities
export const configUtils = {
  getApiUrl: (path: string = ''): string => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    if (!config) return '';
    return `${config.api.baseUrl}${path}`;
  },

  isFeatureEnabled: (feature: keyof EnterpriseConfig['features']): boolean => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    return config?.features[feature] ?? false;
  },

  getAIConfig: () => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    return config?.ai;
  },

  getUIConfig: () => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    return config?.ui;
  },

  getPerformanceConfig: () => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    return config?.performance;
  },

  getSecurityConfig: () => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    return config?.security;
  },

  isDevelopment: (): boolean => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    return config?.app.environment === 'development';
  },

  isProduction: (): boolean => {
    const config = EnterpriseConfigManager.getInstance().getConfig();
    return config?.app.environment === 'production';
  },
};

// Export singleton instance
export const configManager = EnterpriseConfigManager.getInstance();

export default EnterpriseConfigManager;
