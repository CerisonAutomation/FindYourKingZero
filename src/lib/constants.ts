/**
 * =============================================================================
 * Constants — Canonical Re-export
 * =============================================================================
 *
 * This file is a canonical re-export from the unified constants system.
 * All constants live in: src/constants/index.ts
 *
 * @deprecated Direct imports from this file. Use `@/constants` instead.
 * @see src/constants/index.ts
 */

// Re-export everything from the canonical constants module
export {
  APP,
  API_ENDPOINTS,
  STATUS_CODES,
  HTTP_METHODS,
  CONTENT_TYPES,
  STORAGE_KEYS,
  PAGINATION,
  UPLOAD_LIMITS,
  VALIDATION_LIMITS,
  TIME,
  UI,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  ENV,
  REGEX,
  DEFAULTS,
  REPORT_REASONS,
} from '@/constants';

// Legacy aliases for backward compatibility
export { APP as APP_CONFIG } from '@/constants';
export { UI as BREAKPOINTS } from '@/constants';
export { FEATURES as FEATURES_LEGACY } from '@/constants';