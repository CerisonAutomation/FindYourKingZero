/**
 * Enterprise Structured Logging Framework
 * Replaces all console.log statements with production-grade logging
 */

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
  data?: any;
  userId?: string | undefined;
  sessionId?: string;
  requestId?: string;
  error?: Error | undefined;
  stack?: string | undefined;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string | undefined;
  maxBatchSize: number;
  flushInterval: number;
  enablePerformance: boolean;
  enableUserTracking: boolean;
}

class EnterpriseLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;
  private requestMap = new Map<string, string>();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      maxBatchSize: 100,
      flushInterval: 5000,
      enablePerformance: true,
      enableUserTracking: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
    this.setupPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.requestMap.set(requestId, Date.now().toString());
    return requestId;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
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

    // Add to buffer
    this.logBuffer.push(entry);

    // Console output (development only)
    if (this.config.enableConsole && process.env.NODE_ENV === 'development') {
      this.outputToConsole(entry);
    }

    // Auto-flush for error levels
    if (entry.level >= LogLevel.ERROR) {
      this.flush();
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const styles = {
      [LogLevel.TRACE]: 'color: #888',
      [LogLevel.DEBUG]: 'color: #68B',
      [LogLevel.INFO]: 'color: #090',
      [LogLevel.WARN]: 'color: #E80',
      [LogLevel.ERROR]: 'color: #D00',
      [LogLevel.FATAL]: 'color: #F00; font-weight: bold',
    };

    const style = styles[entry.level];
    const prefix = `[${entry.timestamp}] [${LogLevel[entry.level]}] [${entry.category}]`;

    console.groupCollapsed(`%c${prefix} ${entry.message}`, style);

    if (entry.data) {
      console.log('Data:', entry.data);
    }
    if (entry.userId) console.log('User:', entry.userId);
    if (entry.requestId) console.log('Request:', entry.requestId);
    if (entry.error) console.error('Error:', entry.error);
    if (entry.stack) console.log('Stack:', entry.stack);
    if (entry.metadata) console.log('Metadata:', entry.metadata);

    console.groupEnd();
  }

  // Public logging methods
  trace(category: string, message: string, data?: any, options?: Partial<LogEntry>): void {
    const entry = this.createLogEntry(LogLevel.TRACE, category, message, data, options);
    this.log(entry);
  }

  debug(category: string, message: string, data?: any, options?: Partial<LogEntry>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, data, options);
    this.log(entry);
  }

  info(category: string, message: string, data?: any, options?: Partial<LogEntry>): void {
    const entry = this.createLogEntry(LogLevel.INFO, category, message, data, options);
    this.log(entry);
  }

  warn(category: string, message: string, data?: any, options?: Partial<LogEntry>): void {
    const entry = this.createLogEntry(LogLevel.WARN, category, message, data, options);
    this.log(entry);
  }

  error(category: string, message: string, error?: Error | undefined, data?: any, options?: Partial<LogEntry>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, category, message, data, {
      error,
      stack: error?.stack,
      ...options,
    });
    this.log(entry);
  }

  fatal(category: string, message: string, error?: Error | undefined, data?: any, options?: Partial<LogEntry>): void {
    const entry = this.createLogEntry(LogLevel.FATAL, category, message, data, {
      error,
      stack: error?.stack,
      ...options,
    });
    this.log(entry);
  }

  // Specialized logging methods
  userAction(action: string, userId: string, data?: any): void {
    this.info('USER_ACTION', `User performed: ${action}`, data, { userId, action });
  }

  apiCall(method: string, endpoint: string, userId?: string | undefined, data?: any): void {
    this.info('API_CALL', `${method} ${endpoint}`, data, {
      userId: userId || undefined,
      action: `${method}_${endpoint}`,
      metadata: { method, endpoint }
    });
  }

  performance(metric: string, value: number, unit: string = 'ms', data?: any): void {
    this.info('PERFORMANCE', `${metric}: ${value}${unit}`, data, {
      action: metric,
      metadata: { value, unit, metric }
    });
  }

  security(event: string, userId?: string | undefined, data?: any): void {
    this.warn('SECURITY', `Security event: ${event}`, data, {
      userId: userId || undefined,
      action: event,
      metadata: { securityEvent: true }
    });
  }

  business(event: string, userId?: string | undefined, data?: any): void {
    this.info('BUSINESS', `Business event: ${event}`, data, {
      userId: userId || undefined,
      action: event,
      metadata: { businessEvent: true }
    });
  }

  // Flush and cleanup
  private startFlushTimer(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
    }
  }

  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const batch = [...this.logBuffer];
    this.logBuffer = [];

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await this.sendToRemote(batch);
      } catch (error) {
        // Re-add failed logs to buffer for retry
        this.logBuffer.unshift(...batch);
        this.error('LOGGER', 'Failed to send logs to remote endpoint', error as Error);
      }
    }
  }

  private async sendToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    const response = await fetch(this.config.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    if (!this.config.enablePerformance) return;

    // Monitor page load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.performance('page_load', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          this.performance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
          this.performance('first_paint', navigation.responseEnd - navigation.requestStart, 'ms');
        }
      });

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
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
      }
    }
  }

  // Configuration methods
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setUserId(userId: string): void {
    // Store userId for subsequent logs
    this.info('SESSION', `User session started: ${userId}`, undefined, { userId });
  }

  clearUserId(): void {
    this.info('SESSION', 'User session ended');
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance
export const logger = new EnterpriseLogger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: process.env.NODE_ENV === 'development',
  enableRemote: process.env.NODE_ENV !== 'development',
  remoteEndpoint: process.env.NODE_ENV === 'development' ? undefined : '/api/logs',
});

// Convenience exports
export const log = {
  trace: (category: string, message: string, data?: any) => logger.trace(category, message, data),
  debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
  info: (category: string, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: string, message: string, error?: Error, data?: any) => logger.error(category, message, error, data),
  fatal: (category: string, message: string, error?: Error, data?: any) => logger.fatal(category, message, error, data),
  userAction: (action: string, userId: string, data?: any) => logger.userAction(action, userId, data),
  apiCall: (method: string, endpoint: string, userId?: string, data?: any) => logger.apiCall(method, endpoint, userId, data),
  performance: (metric: string, value: number, unit?: string, data?: any) => logger.performance(metric, value, unit, data),
  security: (event: string, userId?: string, data?: any) => logger.security(event, userId, data),
  business: (event: string, userId?: string, data?: any) => logger.business(event, userId, data),
};

export default logger;
