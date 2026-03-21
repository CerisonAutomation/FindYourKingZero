// =====================================================
// Security Module — barrel export
// =====================================================
export {
  // Input sanitization
  stripHtml,
  escapeHtml,
  sanitizeMessage,
  sanitizeDisplayName,
  sanitizeBio,
  sanitizeUserInput,

  // XSS
  detectXss,
  generateNonce,

  // CSRF
  generateCsrfToken,
  getCsrfToken,
  validateCsrfToken,
  withCsrfHeaders,

  // Rate limiting
  checkRateLimit,
  canSendMessage,
  canUpdateProfile,
  canSubmitReport,

  // SQL injection detection
  detectSqlInjection,

  // Content moderation (class)
  securityManager,
  createSecurityManager,
  type SecurityConfig,
} from './SecurityManager';

export {
  infermaxSecurityEngine,
  InfermaxSecurityEngine,
  type SecurityMetrics,
  type SecurityAlert,
} from './InfermaxSecurityEngine';
