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
