/**
 * Application Configuration
 * Central configuration management for the dating platform
 */

export interface AppConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
  }
  features: {
    realTimeChat: boolean
    videoCalls: boolean
    locationSharing: boolean
    aiMatching: boolean
  }
  limits: {
    maxPhotos: number
    maxMessageLength: number
    maxDailyMatches: number
  }
  security: {
    enableContentModeration: boolean
    requireVerification: boolean
    dataRetentionDays: number
  }
}

const config: AppConfig = {
  app: {
    name: 'FindYourKing',
    version: '3.0.0',
    environment: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development'
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
    retryAttempts: 3
  },
  features: {
    realTimeChat: true,
    videoCalls: true,
    locationSharing: true,
    aiMatching: true
  },
  limits: {
    maxPhotos: 6,
    maxMessageLength: 1000,
    maxDailyMatches: 50
  },
  security: {
    enableContentModeration: true,
    requireVerification: false,
    dataRetentionDays: 365
  }
}

export function getConfig(): AppConfig {
  return config
}

export function isDevelopment(): boolean {
  return config.app.environment === 'development'
}

export function isProduction(): boolean {
  return config.app.environment === 'production'
}

export function getApiUrl(): string {
  return config.api.baseUrl
}

export function getFeatureFlags() {
  return config.features
}

export function getLimits() {
  return config.limits
}

export function getSecurityConfig() {
  return config.security
}