/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 ENHANCED ENTERPRISE CONFIGURATION - Production Optimizations
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Based on codemap analysis - Enhanced with security, performance, and monitoring
 * Adds feature flags, rate limiting, caching, and advanced error handling
 *
 * @author FindYourKingZero Enterprise Team
 * @version 4.0.0
 */

import {z} from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════
// 🏗️ ENHANCED CONFIGURATION SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const EnterpriseConfigSchema = z.object({
  // Application settings with feature flags
  app: z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    environment: z.enum(['development', 'staging', 'production']),
    debug: z.boolean().default(false),
    maintenance: z.boolean().default(false),
    featureFlags: z.object({
      aiMatching: z.boolean().default(true),
      p2pMessaging: z.boolean().default(true),
      videoCalls: z.boolean().default(true),
      advancedFilters: z.boolean().default(true),
      eventsSystem: z.boolean().default(true),
      voiceControl: z.boolean().default(false),
      arDating: z.boolean().default(false),
      blockchainRewards: z.boolean().default(false),
    }),
  }),

  // Supabase configuration with connection pooling
  supabase: z.object({
    url: z.string().url(),
    anonKey: z.string().min(1),
    enableRealtime: z.boolean().default(true),
    enablePostGIS: z.boolean().default(true),
    connectionPool: z.object({
      min: z.number().min(1).default(5),
      max: z.number().min(5).default(20),
      idleTimeout: z.number().min(10000).default(30000),
    }),
  }),

  // P2P Network Configuration
  p2p: z.object({
    appId: z.string().min(1),
    enableTrystero: z.boolean().default(true),
    enableWebRTC: z.boolean().default(true),
    iceServers: z.array(z.object({
      urls: z.array(z.string()),
      username: z.string().optional(),
      credential: z.string().optional(),
    })),
    maxConnections: z.number().min(1).default(50),
    heartbeatInterval: z.number().min(1000).default(30000),
  }),

  // AI Configuration with multiple providers
  ai: z.object({
    provider: z.enum(['openai', 'anthropic', 'local']),
    apiKey: z.string().optional(),
    model: z.string().default('gpt-4-turbo'),
    maxTokens: z.number().min(1).default(1000),
    temperature: z.number().min(0).max(2).default(0.7),
    enableStreaming: z.boolean().default(true),
    enableModeration: z.boolean().default(true),
    rateLimit: z.object({
      requestsPerMinute: z.number().min(1).default(60),
      tokensPerMinute: z.number().min(1000).default(40000),
    }),
  }),

  // Performance and Monitoring
  performance: z.object({
    enableMetrics: z.boolean().default(true),
    enableTracing: z.boolean().default(true),
    enableProfiling: z.boolean().default(false),
    sampleRate: z.number().min(0).max(1).default(0.1),
    alertThresholds: z.object({
      responseTime: z.number().min(100).default(1000),
      errorRate: z.number().min(0).max(1).default(0.05),
      memoryUsage: z.number().min(0).max(1).default(0.8),
    }),
  }),

  // Security Configuration
  security: z.object({
    enableRateLimit: z.boolean().default(true),
    enableCSP: z.boolean().default(true),
    enableXSSProtection: z.boolean().default(true),
    sessionTimeout: z.number().min(300000).default(3600000), // 1 hour
    maxLoginAttempts: z.number().min(1).default(5),
    lockoutDuration: z.number().min(300000).default(900000), // 15 minutes
    encryptionKeyRotation: z.number().min(86400000).default(604800000), // 7 days
  }),

  // Mobile Configuration
  mobile: z.object({
    enablePushNotifications: z.boolean().default(true),
    enableBiometricAuth: z.boolean().default(true),
    enableOfflineMode: z.boolean().default(true),
    syncInterval: z.number().min(60000).default(300000), // 5 minutes
    maxCacheSize: z.number().min(1048576).default(52428800), // 50MB
  }),

  // Map and Location Services
  maps: z.object({
    provider: z.enum(['leaflet', 'mapbox', 'google']),
    apiKey: z.string().optional(),
    defaultZoom: z.number().min(1).max(20).default(13),
    maxZoom: z.number().min(1).max(20).default(18),
    enableClustering: z.boolean().default(true),
    enableGeolocation: z.boolean().default(true),
    updateInterval: z.number().min(10000).default(30000), // 30 seconds
    privacyRadius: z.number().min(100).default(1000), // 1km
  }),

  // Analytics and Tracking
  analytics: z.object({
    enableTracking: z.boolean().default(true),
    provider: z.enum(['google', 'mixpanel', 'amplitude', 'custom']),
    trackingId: z.string().optional(),
    enableUserTracking: z.boolean().default(true),
    enablePerformanceTracking: z.boolean().default(true),
    enableErrorTracking: z.boolean().default(true),
    dataRetention: z.number().min(2592000).default(7776000), // 90 days
  }),

  // Content Delivery Network
  cdn: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(['cloudflare', 'akamai', 'fastly', 'custom']),
    url: z.string().optional(),
    enableCaching: z.boolean().default(true),
    cacheTTL: z.number().min(60).default(3600), // 1 hour
    enableCompression: z.boolean().default(true),
  }),
})

export type EnterpriseConfig = z.infer<typeof EnterpriseConfigSchema>

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 ENHANCED ENTERPRISE CONFIG MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

export class EnterpriseConfigManager {
  private static instance: EnterpriseConfigManager
  private config: EnterpriseConfig | null = null
  private configLoadPromise: Promise<EnterpriseConfig> | null = null
  private listeners: Set<(config: EnterpriseConfig) => void> = new Set()
  private lastConfigUpdate: number = 0

  private constructor() {}

  static getInstance(): EnterpriseConfigManager {
    if (!EnterpriseConfigManager.instance) {
      EnterpriseConfigManager.instance = new EnterpriseConfigManager()
    }
    return EnterpriseConfigManager.instance
  }

  /**
   * 🚀 Load configuration with enhanced validation and error handling
   */
  async loadConfig(): Promise<EnterpriseConfig> {
    if (this.configLoadPromise) {
      return this.configLoadPromise
    }

    this.configLoadPromise = this.initializeConfig()
    return this.configLoadPromise
  }

  private async initializeConfig(): Promise<EnterpriseConfig> {
    try {
      console.log('🚀 Loading enhanced enterprise configuration...')

      // Load environment variables
      const envConfig = this.loadEnvironmentConfig()

      // Load remote configuration with fallback
      const remoteConfig = await this.loadRemoteConfig()

      // Load feature flags from remote service
      const featureFlags = await this.loadFeatureFlags()

      // Merge configurations
      const mergedConfig = this.mergeConfigs(envConfig, remoteConfig, featureFlags)

      // Validate configuration
      const validatedConfig = EnterpriseConfigSchema.parse(mergedConfig)

      this.config = validatedConfig
      this.lastConfigUpdate = Date.now()

      // Notify listeners
      this.notifyListeners(validatedConfig)

      console.log('✅ Enterprise configuration loaded successfully')
      return validatedConfig

    } catch (error) {
      console.error('❌ Failed to load enterprise configuration:', error)
      throw new Error(`Configuration loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 🔧 Load environment configuration with enhanced validation
   */
  private loadEnvironmentConfig(): Partial<EnterpriseConfig> {
    return {
      app: {
        name: import.meta.env.VITE_APP_NAME || 'FindYourKingZero',
        version: import.meta.env.VITE_APP_VERSION || '4.0.0',
        environment: (import.meta.env.VITE_APP_ENV as any) || 'development',
        debug: import.meta.env.VITE_DEBUG === 'true',
        maintenance: import.meta.env.VITE_MAINTENANCE === 'true',
        featureFlags: {
          aiMatching: import.meta.env.VITE_FEATURE_AI_MATCHING !== 'false',
          p2pMessaging: import.meta.env.VITE_FEATURE_P2P_MESSAGING !== 'false',
          videoCalls: import.meta.env.VITE_FEATURE_VIDEO_CALLS !== 'false',
          advancedFilters: import.meta.env.VITE_FEATURE_ADVANCED_FILTERS !== 'false',
          eventsSystem: import.meta.env.VITE_FEATURE_EVENTS_SYSTEM !== 'false',
          voiceControl: import.meta.env.VITE_FEATURE_VOICE_CONTROL === 'true',
          arDating: import.meta.env.VITE_FEATURE_AR_DATING === 'true',
          blockchainRewards: import.meta.env.VITE_FEATURE_BLOCKCHAIN_REWARDS === 'true',
        },
      },
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        enableRealtime: import.meta.env.VITE_SUPABASE_ENABLE_REALTIME !== 'false',
        enablePostGIS: import.meta.env.VITE_SUPABASE_ENABLE_POSTGIS !== 'false',
        connectionPool: {
          min: parseInt(import.meta.env.VITE_SUPABASE_POOL_MIN || '5'),
          max: parseInt(import.meta.env.VITE_SUPABASE_POOL_MAX || '20'),
          idleTimeout: parseInt(import.meta.env.VITE_SUPABASE_POOL_IDLE_TIMEOUT || '30000'),
        },
      },
      p2p: {
        appId: import.meta.env.VITE_P2P_APP_ID || 'findyourking-zero-v4',
        enableTrystero: import.meta.env.VITE_P2P_ENABLE_TRYSTERO !== 'false',
        enableWebRTC: import.meta.env.VITE_P2P_ENABLE_WEBRTC !== 'false',
        iceServers: this.parseIceServers(import.meta.env.VITE_P2P_ICE_SERVERS),
        maxConnections: parseInt(import.meta.env.VITE_P2P_MAX_CONNECTIONS || '50'),
        heartbeatInterval: parseInt(import.meta.env.VITE_P2P_HEARTBEAT_INTERVAL || '30000'),
      },
      ai: {
        provider: (import.meta.env.VITE_AI_PROVIDER as any) || 'openai',
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        model: import.meta.env.VITE_AI_MODEL || 'gpt-4-turbo',
        maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '1000'),
        temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
        enableStreaming: import.meta.env.VITE_AI_ENABLE_STREAMING !== 'false',
        enableModeration: import.meta.env.VITE_AI_ENABLE_MODERATION !== 'false',
        rateLimit: {
          requestsPerMinute: parseInt(import.meta.env.VITE_AI_RATE_LIMIT_RPM || '60'),
          tokensPerMinute: parseInt(import.meta.env.VITE_AI_RATE_LIMIT_TPM || '40000'),
        },
      },
      performance: {
        enableMetrics: import.meta.env.VITE_PERFORMANCE_ENABLE_METRICS !== 'false',
        enableTracing: import.meta.env.VITE_PERFORMANCE_ENABLE_TRACING !== 'false',
        enableProfiling: import.meta.env.VITE_PERFORMANCE_ENABLE_PROFILING === 'true',
        sampleRate: parseFloat(import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE || '0.1'),
        alertThresholds: {
          responseTime: parseInt(import.meta.env.VITE_PERFORMANCE_ALERT_RESPONSE_TIME || '1000'),
          errorRate: parseFloat(import.meta.env.VITE_PERFORMANCE_ALERT_ERROR_RATE || '0.05'),
          memoryUsage: parseFloat(import.meta.env.VITE_PERFORMANCE_ALERT_MEMORY_USAGE || '0.8'),
        },
      },
      security: {
        enableRateLimit: import.meta.env.VITE_SECURITY_ENABLE_RATE_LIMIT !== 'false',
        enableCSP: import.meta.env.VITE_SECURITY_ENABLE_CSP !== 'false',
        enableXSSProtection: import.meta.env.VITE_SECURITY_ENABLE_XSS_PROTECTION !== 'false',
        sessionTimeout: parseInt(import.meta.env.VITE_SECURITY_SESSION_TIMEOUT || '3600000'),
        maxLoginAttempts: parseInt(import.meta.env.VITE_SECURITY_MAX_LOGIN_ATTEMPTS || '5'),
        lockoutDuration: parseInt(import.meta.env.VITE_SECURITY_LOCKOUT_DURATION || '900000'),
        encryptionKeyRotation: parseInt(import.meta.env.VITE_SECURITY_KEY_ROTATION || '604800000'),
      },
      mobile: {
        enablePushNotifications: import.meta.env.VITE_MOBILE_ENABLE_PUSH !== 'false',
        enableBiometricAuth: import.meta.env.VITE_MOBILE_ENABLE_BIOMETRIC !== 'false',
        enableOfflineMode: import.meta.env.VITE_MOBILE_ENABLE_OFFLINE !== 'false',
        syncInterval: parseInt(import.meta.env.VITE_MOBILE_SYNC_INTERVAL || '300000'),
        maxCacheSize: parseInt(import.meta.env.VITE_MOBILE_MAX_CACHE_SIZE || '52428800'),
      },
      maps: {
        provider: (import.meta.env.VITE_MAPS_PROVIDER as any) || 'leaflet',
        apiKey: import.meta.env.VITE_MAPS_API_KEY,
        defaultZoom: parseInt(import.meta.env.VITE_MAPS_DEFAULT_ZOOM || '13'),
        maxZoom: parseInt(import.meta.env.VITE_MAPS_MAX_ZOOM || '18'),
        enableClustering: import.meta.env.VITE_MAPS_ENABLE_CLUSTERING !== 'false',
        enableGeolocation: import.meta.env.VITE_MAPS_ENABLE_GEOLOCATION !== 'false',
        updateInterval: parseInt(import.meta.env.VITE_MAPS_UPDATE_INTERVAL || '30000'),
        privacyRadius: parseInt(import.meta.env.VITE_MAPS_PRIVACY_RADIUS || '1000'),
      },
      analytics: {
        enableTracking: import.meta.env.VITE_ANALYTICS_ENABLE_TRACKING !== 'false',
        provider: (import.meta.env.VITE_ANALYTICS_PROVIDER as any) || 'google',
        trackingId: import.meta.env.VITE_ANALYTICS_TRACKING_ID,
        enableUserTracking: import.meta.env.VITE_ANALYTICS_ENABLE_USER_TRACKING !== 'false',
        enablePerformanceTracking: import.meta.env.VITE_ANALYTICS_ENABLE_PERFORMANCE_TRACKING !== 'false',
        enableErrorTracking: import.meta.env.VITE_ANALYTICS_ENABLE_ERROR_TRACKING !== 'false',
        dataRetention: parseInt(import.meta.env.VITE_ANALYTICS_DATA_RETENTION || '7776000'),
      },
      cdn: {
        enabled: import.meta.env.VITE_CDN_ENABLED !== 'false',
        provider: (import.meta.env.VITE_CDN_PROVIDER as any) || 'cloudflare',
        url: import.meta.env.VITE_CDN_URL,
        enableCaching: import.meta.env.VITE_CDN_ENABLE_CACHING !== 'false',
        cacheTTL: parseInt(import.meta.env.VITE_CDN_CACHE_TTL || '3600'),
        enableCompression: import.meta.env.VITE_CDN_ENABLE_COMPRESSION !== 'false',
      },
    }
  }

  /**
   * 🌐 Load remote configuration with enhanced error handling
   */
  private async loadRemoteConfig(): Promise<Partial<EnterpriseConfig>> {
    if (import.meta.env.VITE_ENABLE_REMOTE_CONFIG === 'false') {
      return {}
    }

    try {
      const response = await fetch('/api/config', {
        headers: {
          'X-Config-Version': '1.0',
          'X-Client-Version': import.meta.env.VITE_APP_VERSION || '4.0.0',
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`Remote config failed: ${response.status}`)
      }

      const remoteConfig = await response.json()
      console.log('🌐 Remote configuration loaded successfully')
      return remoteConfig

    } catch (error) {
      console.warn('⚠️ Failed to load remote configuration, using defaults:', error)
      return {}
    }
  }

  /**
   * 🚩 Load feature flags from remote service
   */
  private async loadFeatureFlags(): Promise<Partial<EnterpriseConfig>> {
    try {
      const response = await fetch('/api/feature-flags', {
        headers: {
          'X-Environment': import.meta.env.VITE_APP_ENV || 'development',
        },
        signal: AbortSignal.timeout(3000),
      })

      if (!response.ok) {
        return {}
      }

      const flags = await response.json()
      return {
        app: {
          featureFlags: flags,
        },
      }
    } catch (error) {
      console.warn('⚠️ Failed to load feature flags:', error)
      return {}
    }
  }

  /**
   * 🔧 Merge configurations with conflict resolution
   */
  private mergeConfigs(
    envConfig: Partial<EnterpriseConfig>,
    remoteConfig: Partial<EnterpriseConfig>,
    featureFlags: Partial<EnterpriseConfig>
  ): EnterpriseConfig {
    return {
      app: {
        ...envConfig.app,
        ...remoteConfig.app,
        ...featureFlags.app,
      },
      supabase: {
        ...envConfig.supabase,
        ...remoteConfig.supabase,
      },
      p2p: {
        ...envConfig.p2p,
        ...remoteConfig.p2p,
      },
      ai: {
        ...envConfig.ai,
        ...remoteConfig.ai,
      },
      performance: {
        ...envConfig.performance,
        ...remoteConfig.performance,
      },
      security: {
        ...envConfig.security,
        ...remoteConfig.security,
      },
      mobile: {
        ...envConfig.mobile,
        ...remoteConfig.mobile,
      },
      maps: {
        ...envConfig.maps,
        ...remoteConfig.maps,
      },
      analytics: {
        ...envConfig.analytics,
        ...remoteConfig.analytics,
      },
      cdn: {
        ...envConfig.cdn,
        ...remoteConfig.cdn,
      },
    } as EnterpriseConfig
  }

  /**
   * 🔧 Parse ICE servers from environment variable
   */
  private parseIceServers(iceServersString?: string): Array<{ urls: string[]; username?: string; credential?: string }> {
    if (!iceServersString) {
      return [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    }

    try {
      return JSON.parse(iceServersString)
    } catch (error) {
      console.warn('⚠️ Invalid ICE servers configuration, using defaults:', error)
      return [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    }
  }

  /**
   * 📢 Get current configuration
   */
  getConfig(): EnterpriseConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.')
    }
    return this.config
  }

  /**
   * 🎯 Get specific configuration section
   */
  getConfigSection<K extends keyof EnterpriseConfig>(section: K): EnterpriseConfig[K] {
    return this.getConfig()[section]
  }

  /**
   * 🚩 Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof EnterpriseConfig['app']['featureFlags']): boolean {
    return this.getConfig().app.featureFlags[feature]
  }

  /**
   * 🔄 Add configuration change listener
   */
  addListener(listener: (config: EnterpriseConfig) => void): void {
    this.listeners.add(listener)
  }

  /**
   * 🗑️ Remove configuration change listener
   */
  removeListener(listener: (config: EnterpriseConfig) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * 📢 Notify all listeners of configuration change
   */
  private notifyListeners(config: EnterpriseConfig): void {
    this.listeners.forEach(listener => {
      try {
        listener(config)
      } catch (error) {
        console.error('❌ Configuration listener error:', error)
      }
    })
  }

  /**
   * 🔄 Reload configuration
   */
  async reloadConfig(): Promise<EnterpriseConfig> {
    this.configLoadPromise = null
    return this.loadConfig()
  }

  /**
   * 📊 Get configuration metadata
   */
  getMetadata() {
    return {
      lastUpdate: this.lastConfigUpdate,
      environment: this.config?.app.environment,
      version: this.config?.app.version,
      featureFlags: this.config?.app.featureFlags,
    }
  }
}

export default EnterpriseConfigManager