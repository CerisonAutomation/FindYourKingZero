/**
 * Enterprise Structured Logging Framework
 * Production-grade structured logging with Sentry integration
 * Uses import.meta.env (Vite) instead of process.env
 */
import * as Sentry from '@sentry/react';

// Safe Sentry wrapper — no-ops if Sentry isn't initialized
const safeSentry = {
  captureException: (err: any, ctx?: any) => {
    try { safeSentry.captureException(err, ctx); } catch {}
  },
  captureMessage: (msg: string, level?: any) => {
    try { safeSentry.captureMessage(msg, level); } catch {}
  },
  addBreadcrumb: (crumb: any) => {
    try { safeSentry.addBreadcrumb(crumb); } catch {}
  },
  setUser: (user: any) => {
    try { safeSentry.setUser(user); } catch {}
  },
};

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

export type LogEntry  = {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  error?: Error;
  stack?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export type LoggerConfig  = {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxBatchSize: number;
  flushInterval: number;
  enablePerformance: boolean;
  enableUserTracking: boolean;
  enableSentry: boolean;
}

class EnterpriseLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: ReturnType<typeof setInterval>;
  private sessionId: string;
  private readonly requestMap = new Map<string, string>();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      maxBatchSize: 100,
      flushInterval: 5000,
      enablePerformance: true,
      enableUserTracking: true,
      enableSentry: true,
      ...config,
    };
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
    this.setupPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateRequestId(): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.requestMap.set(requestId, Date.now().toString());
    return requestId;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: unknown,
    options: Partial<LogEntry> = {}
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      sessionId: this.sessionId,
      requestId: this.generateRequestId(),
      ...options,
    };
  }

  private log(entry: LogEntry): void {
    if (entry.level < this.config.level) return;

    this.logBuffer.push(entry);

    if (this.config.enableConsole && import.meta.env.DEV) {
      this.outputToConsole(entry);
    }

    // Forward WARN+ to Sentry in production
    if (this.config.enableSentry && !import.meta.env.DEV) {
      this.captureToSentry(entry);
    }

    if (entry.level >= LogLevel.ERROR) {
      void this.flush();
    }
  }

  private captureToSentry(entry: LogEntry): void {
    if (entry.level >= LogLevel.ERROR && entry.error) {
      safeSentry.captureException(entry.error, {
        tags: { category: entry.category, action: entry.action ?? '' },
        extra: { data: entry.data, metadata: entry.metadata },
        user: entry.userId ? { id: entry.userId } : undefined,
      });
    } else if (entry.level >= LogLevel.WARN) {
      safeSentry.captureMessage(entry.message, {
        level: entry.level >= LogLevel.ERROR ? 'error' : 'warning',
        tags: { category: entry.category },
        extra: { data: entry.data },
      });
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const styles: Record<number, string> = {
      [LogLevel.TRACE]: 'color: #888',
      [LogLevel.DEBUG]: 'color: #68B',
      [LogLevel.INFO]:  'color: #090',
      [LogLevel.WARN]:  'color: #E80',
      [LogLevel.ERROR]: 'color: #D00',
      [LogLevel.FATAL]: 'color: #F00; font-weight: bold',
    };
    const style = styles[entry.level] ?? '';
    const prefix = `[${entry.timestamp}] [${LogLevel[entry.level]}] [${entry.category}]`;
    console.groupCollapsed(`%c${prefix} ${entry.message}`, style);
    if (entry.data !== undefined) console.log('Data:', entry.data);
    if (entry.userId) console.log('User:', entry.userId);
    if (entry.requestId) console.log('Request:', entry.requestId);
    if (entry.error) console.error('Error:', entry.error);
    if (entry.stack) console.log('Stack:', entry.stack);
    if (entry.metadata) console.log('Metadata:', entry.metadata);
    console.groupEnd();
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  trace(category: string, message: string, data?: unknown, options?: Partial<LogEntry>): void {
    this.log(this.createLogEntry(LogLevel.TRACE, category, message, data, options));
  }

  debug(category: string, message: string, data?: unknown, options?: Partial<LogEntry>): void {
    this.log(this.createLogEntry(LogLevel.DEBUG, category, message, data, options));
  }

  info(category: string, message: string, data?: unknown, options?: Partial<LogEntry>): void {
    this.log(this.createLogEntry(LogLevel.INFO, category, message, data, options));
  }

  warn(category: string, message: string, data?: unknown, options?: Partial<LogEntry>): void {
    this.log(this.createLogEntry(LogLevel.WARN, category, message, data, options));
  }

  error(category: string, message: string, error?: Error, data?: unknown, options?: Partial<LogEntry>): void {
    this.log(this.createLogEntry(LogLevel.ERROR, category, message, data, {
      error,
      stack: error?.stack,
      ...options,
    }));
  }

  fatal(category: string, message: string, error?: Error, data?: unknown, options?: Partial<LogEntry>): void {
    this.log(this.createLogEntry(LogLevel.FATAL, category, message, data, {
      error,
      stack: error?.stack,
      ...options,
    }));
  }

  // ─── Specialised helpers ─────────────────────────────────────────────────────

  userAction(action: string, userId: string, data?: unknown): void {
    this.info('USER_ACTION', `User performed: ${action}`, data, { userId, action });
  }

  apiCall(method: string, endpoint: string, userId?: string, data?: unknown): void {
    this.info('API_CALL', `${method} ${endpoint}`, data, {
      userId,
      action: `${method}_${endpoint}`,
      metadata: { method, endpoint },
    });
  }

  performance(metric: string, value: number, unit = 'ms', data?: unknown): void {
    this.info('PERFORMANCE', `${metric}: ${value}${unit}`, data, {
      action: metric,
      metadata: { value, unit, metric },
    });
  }

  security(event: string, userId?: string, data?: unknown): void {
    this.warn('SECURITY', `Security event: ${event}`, data, {
      userId,
      action: event,
      metadata: { securityEvent: true },
    });
  }

  business(event: string, userId?: string, data?: unknown): void {
    this.info('BUSINESS', `Business event: ${event}`, data, {
      userId,
      action: event,
      metadata: { businessEvent: true },
    });
  }

  // ─── Flush / cleanup ─────────────────────────────────────────────────────────

  private startFlushTimer(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => void this.flush(), this.config.flushInterval);
    }
  }

  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;
    const batch = [...this.logBuffer];
    this.logBuffer = [];
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await this.sendToRemote(batch);
      } catch (err) {
        this.logBuffer.unshift(...batch);
        this.error('LOGGER', 'Failed to send logs to remote endpoint', err as Error);
      }
    }
  }

  private async sendToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) return;
    const response = await fetch(this.config.remoteEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logs,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send logs: ${response.status} ${response.statusText}`);
    }
  }

  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformance || typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (nav) {
        this.performance('page_load', nav.loadEventEnd - nav.fetchStart);
        this.performance('dom_content_loaded', nav.domContentLoadedEventEnd - nav.fetchStart);
        this.performance('ttfb', nav.responseStart - nav.requestStart);
      }
    });

    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              this.performance('long_task', entry.duration, 'ms', {
                name: entry.name,
                startTime: entry.startTime,
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // longtask observer not supported in all browsers; non-fatal
      }
    }
  }

  // ─── Config / session ────────────────────────────────────────────────────────

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setUserId(userId: string): void {
    safeSentry.setUser({ id: userId });
    this.info('SESSION', `User session started`, undefined, { userId });
  }

  clearUserId(): void {
    safeSentry.setUser(null);
    this.info('SESSION', 'User session ended');
  }

  destroy(): void {
    if (this.flushTimer !== undefined) clearInterval(this.flushTimer);
    void this.flush();
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const logger = new EnterpriseLogger({
  level:          import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole:  import.meta.env.DEV,
  enableRemote:   !import.meta.env.DEV,
  enableSentry:   !import.meta.env.DEV,
  remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT as string | undefined,
});

// ─── Convenience proxy ───────────────────────────────────────────────────────

export const log = {
  trace:      (category: string, message: string, data?: unknown) => logger.trace(category, message, data),
  debug:      (category: string, message: string, data?: unknown) => logger.debug(category, message, data),
  info:       (category: string, message: string, data?: unknown) => logger.info(category, message, data),
  warn:       (category: string, message: string, data?: unknown) => logger.warn(category, message, data),
  error:      (category: string, message: string, error?: Error, data?: unknown) => logger.error(category, message, error, data),
  fatal:      (category: string, message: string, error?: Error, data?: unknown) => logger.fatal(category, message, error, data),
  userAction: (action: string, userId: string, data?: unknown) => logger.userAction(action, userId, data),
  apiCall:    (method: string, endpoint: string, userId?: string, data?: unknown) => logger.apiCall(method, endpoint, userId, data),
  performance:(metric: string, value: number, unit?: string, data?: unknown) => logger.performance(metric, value, unit, data),
  security:   (event: string, userId?: string, data?: unknown) => logger.security(event, userId, data),
  business:   (event: string, userId?: string, data?: unknown) => logger.business(event, userId, data),
} as const;

export default logger;
