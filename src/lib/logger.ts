/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Structured Logging System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Production-grade logging with Sentry integration.
 * Replaces: lib/enterprise/Logger.ts
 *
 * @version 4.0.0
 */
import * as Sentry from '@sentry/react';

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  userId?: string;
  error?: Error;
  stack?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
  maxBatchSize: number;
  flushIntervalMs: number;
}

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: import.meta.env.DEV,
      enableSentry: !import.meta.env.DEV,
      maxBatchSize: 100,
      flushIntervalMs: 5000,
      ...config,
    };
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.startFlushTimer();
  }

  private createEntry(
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
      ...options,
    };
  }

  private log(entry: LogEntry): void {
    if (entry.level < this.config.level) return;
    this.buffer.push(entry);

    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    if (this.config.enableSentry && entry.level >= LogLevel.ERROR && entry.error) {
      Sentry.captureException(entry.error, {
        tags: { category: entry.category },
        extra: { data: entry.data, metadata: entry.metadata },
        user: entry.userId ? { id: entry.userId } : undefined,
      });
    }

    if (entry.level >= LogLevel.ERROR || this.buffer.length >= this.config.maxBatchSize) {
      void this.flush();
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const styles: Record<number, string> = {
      [LogLevel.TRACE]: 'color: #888',
      [LogLevel.DEBUG]: 'color: #68B',
      [LogLevel.INFO]: 'color: #090',
      [LogLevel.WARN]: 'color: #E80',
      [LogLevel.ERROR]: 'color: #D00',
      [LogLevel.FATAL]: 'color: #F00; font-weight: bold',
    };
    const label = LogLevel[entry.level];
    console.log(`%c[${label}] [${entry.category}] ${entry.message}`, styles[entry.level] ?? '');
    if (entry.data) console.log('Data:', entry.data);
    if (entry.error) console.error('Error:', entry.error);
  }

  private startFlushTimer(): void {
    if (this.config.flushIntervalMs > 0) {
      this.flushTimer = setInterval(() => void this.flush(), this.config.flushIntervalMs);
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = [...this.buffer];
    this.buffer = [];
    // Batch can be sent to remote endpoint here if needed
    void batch;
  }

  // Public API
  trace(category: string, message: string, data?: unknown): void {
    this.log(this.createEntry(LogLevel.TRACE, category, message, data));
  }

  debug(category: string, message: string, data?: unknown): void {
    this.log(this.createEntry(LogLevel.DEBUG, category, message, data));
  }

  info(category: string, message: string, data?: unknown): void {
    this.log(this.createEntry(LogLevel.INFO, category, message, data));
  }

  warn(category: string, message: string, data?: unknown): void {
    this.log(this.createEntry(LogLevel.WARN, category, message, data));
  }

  error(category: string, message: string, error?: Error, data?: unknown): void {
    this.log(this.createEntry(LogLevel.ERROR, category, message, data, { error, stack: error?.stack }));
  }

  fatal(category: string, message: string, error?: Error, data?: unknown): void {
    this.log(this.createEntry(LogLevel.FATAL, category, message, data, { error, stack: error?.stack }));
  }

  // Specialized helpers
  userAction(action: string, userId: string, data?: unknown): void {
    this.info('USER', `Action: ${action}`, data, { userId, action });
  }

  apiCall(method: string, endpoint: string, userId?: string, data?: unknown): void {
    this.info('API', `${method} ${endpoint}`, data, { userId, metadata: { method, endpoint } });
  }

  perf(metric: string, valueMs: number, data?: unknown): void {
    this.info('PERF', `${metric}: ${valueMs}ms`, data, { metadata: { metric, valueMs } });
  }

  security(event: string, userId?: string, data?: unknown): void {
    this.warn('SECURITY', event, data, { userId, metadata: { securityEvent: true } });
  }

  setUserId(userId: string): void {
    Sentry.setUser({ id: userId });
    this.info('SESSION', 'User identified', undefined, { userId });
  }

  clearUserId(): void {
    Sentry.setUser(null);
    this.info('SESSION', 'User cleared');
  }

  destroy(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    void this.flush();
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  trace: (c: string, m: string, d?: unknown) => logger.trace(c, m, d),
  debug: (c: string, m: string, d?: unknown) => logger.debug(c, m, d),
  info: (c: string, m: string, d?: unknown) => logger.info(c, m, d),
  warn: (c: string, m: string, d?: unknown) => logger.warn(c, m, d),
  error: (c: string, m: string, e?: Error, d?: unknown) => logger.error(c, m, e, d),
  fatal: (c: string, m: string, e?: Error, d?: unknown) => logger.fatal(c, m, e, d),
  userAction: (a: string, u: string, d?: unknown) => logger.userAction(a, u, d),
  apiCall: (m: string, e: string, u?: string, d?: unknown) => logger.apiCall(m, e, u, d),
  perf: (m: string, v: number, d?: unknown) => logger.perf(m, v, d),
  security: (e: string, u?: string, d?: unknown) => logger.security(e, u, d),
} as const;

export default logger;
