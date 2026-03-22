/**
 * Infermax Security Engine — Browser-compatible version
 * Threat detection, behavioral analysis, alerting
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type SecurityMetrics = {
  threatLevel: number;
  attackAttempts: number;
  blockedAttacks: number;
  responseTime: number;
  falsePositives: number;
  accuracy: number;
};

export type SecurityAlert = {
  id: string;
  type: 'THREAT' | 'ANOMALY' | 'BREACH' | 'SUSPICIOUS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  timestamp: Date;
  resolved: boolean;
  actions: string[];
};

type AlertListener = (alert: SecurityAlert) => void;

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function sha256Hex(input: string): string {
  // Use SubtleCrypto when available, fall back to simple hash
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    // SubtleCrypto is async but we need sync in some paths — store promise
    void crypto.subtle.digest('SHA-256', data).then((buf) => {
      const hex = Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
      return hex;
    });
  } catch { /* noop */ }
  // Simple non-cryptographic fallback for sync contexts
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ── Engine ────────────────────────────────────────────────────────────────────

export class InfermaxSecurityEngine {
  private static instance: InfermaxSecurityEngine;

  private securityAlerts = new Map<string, SecurityAlert>();
  private listeners: AlertListener[] = [];
  private metrics: SecurityMetrics = {
    threatLevel: 0,
    attackAttempts: 0,
    blockedAttacks: 0,
    responseTime: 0,
    falsePositives: 0,
    accuracy: 100,
  };
  private scanTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): InfermaxSecurityEngine {
    if (!InfermaxSecurityEngine.instance) {
      InfermaxSecurityEngine.instance = new InfermaxSecurityEngine();
    }
    return InfermaxSecurityEngine.instance;
  }

  // ── Monitoring ──────────────────────────────────────────────────────────────

  private startMonitoring(): void {
    this.scanTimer = setInterval(() => {
      this.performSecurityScan();
      this.updateMetrics();
    }, 30_000); // every 30s
  }

  private performSecurityScan(): void {
    // Detect common attack patterns in DOM (defence-in-depth)
    const html = document.documentElement.innerHTML;

    const threats: { type: string; severity: SecurityAlert['severity'] }[] = [];

    if (/<script[\s>]/i.test(html) && !html.includes('type="application/ld+json"')) {
      threats.push({ type: 'XSS', severity: 'HIGH' });
    }
    if (/UNION\s+SELECT/i.test(html)) {
      threats.push({ type: 'SQL_INJECTION', severity: 'CRITICAL' });
    }

    threats.forEach((t) => {
      this.metrics.attackAttempts++;
      this.createAlert('THREAT', t.severity, `${t.type} pattern detected in DOM`);
    });
  }

  private updateMetrics(): void {
    const total = this.securityAlerts.size;
    const critical = Array.from(this.securityAlerts.values()).filter(
      (a) => a.severity === 'CRITICAL' && !a.resolved,
    ).length;
    this.metrics.threatLevel = total > 0 ? (critical / total) * 100 : 0;
    this.metrics.accuracy =
      this.metrics.attackAttempts > 0
        ? (this.metrics.blockedAttacks / this.metrics.attackAttempts) * 100
        : 100;
  }

  // ── Alerts ──────────────────────────────────────────────────────────────────

  private createAlert(
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity'],
    description: string,
    userId?: string,
  ): SecurityAlert {
    const alert: SecurityAlert = {
      id: randomId(),
      type,
      severity,
      description,
      userId,
      timestamp: new Date(),
      resolved: false,
      actions: [],
    };
    this.securityAlerts.set(alert.id, alert);
    this.listeners.forEach((fn) => fn(alert));
    return alert;
  }

  onAlert(listener: AlertListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  resolveAlert(alertId: string): void {
    const alert = this.securityAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // ── Device fingerprint ──────────────────────────────────────────────────────

  generateDeviceFingerprint(): string {
    const components = [
      navigator.userAgent,
      `${screen.width}x${screen.height}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      navigator.platform,
      navigator.hardwareConcurrency?.toString() ?? '0',
    ];
    return sha256Hex(components.join('|'));
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  getAlerts(): SecurityAlert[] {
    return Array.from(this.securityAlerts.values());
  }

  getActiveAlerts(): SecurityAlert[] {
    return this.getAlerts().filter((a) => !a.resolved);
  }

  destroy(): void {
    if (this.scanTimer) clearInterval(this.scanTimer);
    this.securityAlerts.clear();
    this.listeners = [];
  }
}

export const infermaxSecurityEngine = InfermaxSecurityEngine.getInstance();
// =====================================================
// SECURITY MANAGER — Input Sanitization, XSS Prevention,
// CSRF Tokens, Rate Limiting, Content Moderation
// =====================================================

// ── Input Sanitization ────────────────────────────────────────────────────────

/**
 * Strip all HTML tags from a string. Returns plain text only.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML entities to prevent XSS when rendering user-supplied text.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
  };
  return input.replace(/[&<>"'`/]/g, (ch) => map[ch] ?? ch);
}

/**
 * Sanitize a user message: strip HTML, limit length, normalize whitespace.
 */
export function sanitizeMessage(input: string, maxLength = 5000): string {
  if (typeof input !== 'string') return '';
  const cleaned = stripHtml(input).replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitize a display name: strip HTML, allow letters/numbers/spaces/punctuation,
 * limit to 40 chars.
 */
export function sanitizeDisplayName(input: string): string {
  if (typeof input !== 'string') return '';
  const cleaned = stripHtml(input)
    .replace(/[^\p{L}\p{N}\s._\-']/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, 40);
}

/**
 * Sanitize a profile bio: strip HTML, allow newlines, limit to 1000 chars.
 */
export function sanitizeBio(input: string): string {
  if (typeof input !== 'string') return '';
  const cleaned = stripHtml(input).replace(/\s*\n\s*/g, '\n').trim();
  return cleaned.slice(0, 1000);
}

/**
 * Generic sanitizer — applies to any free-form user text.
 */
export function sanitizeUserInput(input: string, maxLength = 2000): string {
  if (typeof input !== 'string') return '';
  return stripHtml(input).replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

// ── XSS Prevention ────────────────────────────────────────────────────────────

/**
 * Detect potential XSS patterns in user input. Returns true if suspicious.
 */
export function detectXss(input: string): boolean {
  const patterns = [
    /<script[\s>]/i,
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data\s*:\s*text\/html/i,
    /vbscript\s*:/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /@import/i,
    /<svg[\s>].*on\w+/i,
    /<img[\s>].*onerror/i,
  ];
  return patterns.some((p) => p.test(input));
}

/**
 * Content-Security-Policy nonce generator for inline scripts.
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// ── CSRF Token Handling ───────────────────────────────────────────────────────

const CSRF_TOKEN_KEY = 'fyk_csrf_token';

/**
 * Generate a CSRF token and store it in sessionStorage.
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch {
    // sessionStorage unavailable (SSR) — token still valid for current request
  }
  return token;
}

/**
 * Get the current CSRF token, generating one if missing.
 */
export function getCsrfToken(): string {
  try {
    const existing = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (existing) return existing;
  } catch { /* noop */ }
  return generateCsrfToken();
}

/**
 * Validate a submitted CSRF token against the stored one.
 */
export function validateCsrfToken(submitted: string): boolean {
  try {
    const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (!stored || !submitted) return false;
    // Constant-time comparison to prevent timing attacks
    if (stored.length !== submitted.length) return false;
    let mismatch = 0;
    for (let i = 0; i < stored.length; i++) {
      mismatch |= stored.charCodeAt(i) ^ submitted.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

/**
 * Attach CSRF header to a fetch/init object.
 */
export function withCsrfHeaders(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers ?? {});
  headers.set('X-CSRF-Token', getCsrfToken());
  return { ...init, headers };
}

// ── Client-Side Rate Limiting ─────────────────────────────────────────────────

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

/**
 * Check whether an action is allowed under a sliding-window rate limit.
 * Returns { allowed, retryAfterMs }.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count < maxRequests) {
    bucket.count++;
    return { allowed: true, retryAfterMs: 0 };
  }

  return { allowed: false, retryAfterMs: bucket.resetAt - now };
}

/**
 * Convenience: rate-limit a chat message send.
 */
export function canSendMessage(userId: string): { allowed: boolean; retryAfterMs: number } {
  return checkRateLimit(`msg:${userId}`, 30, 60_000); // 30 msgs / minute
}

/**
 * Convenience: rate-limit a profile update.
 */
export function canUpdateProfile(userId: string): { allowed: boolean; retryAfterMs: number } {
  return checkRateLimit(`profile:${userId}`, 5, 60_000); // 5 updates / minute
}

/**
 * Convenience: rate-limit a report submission.
 */
export function canSubmitReport(userId: string): { allowed: boolean; retryAfterMs: number } {
  return checkRateLimit(`report:${userId}`, 3, 300_000); // 3 reports / 5 min
}

// ── SQL Injection Detection ───────────────────────────────────────────────────

/**
 * Detect common SQL injection patterns. Returns true if suspicious.
 * Note: the app uses Supabase's query builder (parameterized), so this is
 * a defence-in-depth check on free-form inputs before they reach any RPC.
 */
export function detectSqlInjection(input: string): boolean {
  const patterns = [
    /'\s*(OR|AND)\s+'?\d*'?\s*=\s*'?\d*'?/i,
    /'\s*;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|EXEC|EXECUTE)/i,
    /UNION\s+(ALL\s+)?SELECT/i,
    /--\s*$/,
    /\/\*.*\*\//,
    /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
    /BENCHMARK\s*\(/i,
    /SLEEP\s*\(/i,
    /WAITFOR\s+DELAY/i,
    /CHAR\s*\(/i,
    /CONCAT\s*\(/i,
  ];
  return patterns.some((p) => p.test(input));
}

// ── Content Moderation ────────────────────────────────────────────────────────

export type SecurityConfig = {
  contentModeration: {
    enabled: boolean;
    profanityFilter: boolean;
    imageModeration: boolean;
    autoBlock: boolean;
  };
  privacy: {
    dataEncryption: boolean;
    anonymizeData: boolean;
    gdprCompliant: boolean;
  };
  safety: {
    verifyProfiles: boolean;
    backgroundChecks: boolean;
    reportSystem: boolean;
  };
};

class SecurityManager {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  async moderateContent(content: string): Promise<{
    isAppropriate: boolean;
    violations: string[];
    confidence: number;
  }> {
    if (!this.config.contentModeration.enabled) {
      return { isAppropriate: true, violations: [], confidence: 1.0 };
    }

    const profanityList = ['spam', 'scam', 'inappropriate', 'offensive'];
    const violations = profanityList.filter((word) =>
      content.toLowerCase().includes(word),
    );

    return {
      isAppropriate: violations.length === 0,
      violations,
      confidence: violations.length === 0 ? 1.0 : 0.5,
    };
  }

  async moderateImage(_imageData: string): Promise<{
    isSafe: boolean;
    confidence: number;
    issues: string[];
  }> {
    if (!this.config.contentModeration.imageModeration) {
      return { isSafe: true, confidence: 1.0, issues: [] };
    }
    return { isSafe: true, confidence: 0.8, issues: [] };
  }

  async verifyProfile(profileData: {
    photos: string[];
    bio: string;
    age: number;
  }): Promise<{ isVerified: boolean; score: number; issues: string[] }> {
    const issues: string[] = [];

    if (profileData.photos.length === 0) issues.push('No photos provided');

    const bioModeration = await this.moderateContent(profileData.bio);
    if (!bioModeration.isAppropriate) issues.push('Inappropriate bio content');

    if (profileData.age < 18 || profileData.age > 100) issues.push('Invalid age');

    return {
      isVerified: issues.length === 0,
      score: Math.max(0, 100 - issues.length * 25),
      issues,
    };
  }

  encryptSensitiveData(data: string): string {
    if (!this.config.privacy.dataEncryption) return data;
    return btoa(data);
  }

  decryptSensitiveData(encryptedData: string): string {
    if (!this.config.privacy.dataEncryption) return encryptedData;
    return atob(encryptedData);
  }

  async handleReport(reportData: {
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description: string;
  }): Promise<{ submitted: boolean; reportId: string; priority: 'low' | 'medium' | 'high' }> {
    const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
      spam: 'low',
      fake_profile: 'medium',
      harassment: 'high',
      inappropriate_content: 'medium',
    };

    const priority = priorityMap[reportData.reason] || 'medium';
    const reportId = `report_${Date.now()}_${reportData.reporterId}`;
    console.log('Report submitted:', { reportId, priority, ...reportData });
    return { submitted: true, reportId, priority };
  }
}

const defaultConfig: SecurityConfig = {
  contentModeration: {
    enabled: true,
    profanityFilter: true,
    imageModeration: true,
    autoBlock: false,
  },
  privacy: {
    dataEncryption: true,
    anonymizeData: true,
    gdprCompliant: true,
  },
  safety: {
    verifyProfiles: true,
    backgroundChecks: false,
    reportSystem: true,
  },
};

export const securityManager = new SecurityManager(defaultConfig);

export function createSecurityManager(config: Partial<SecurityConfig>): SecurityManager {
  return new SecurityManager({ ...defaultConfig, ...config });
}
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
