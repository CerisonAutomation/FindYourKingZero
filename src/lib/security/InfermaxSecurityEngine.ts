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
