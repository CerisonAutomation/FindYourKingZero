// ═══════════════════════════════════════════════════════════════
// COMPONENT: ErrorBoundary — production-grade, 3-layer shield
// Stack: Vite + React 18 + shadcn/ui — NO Next.js, NO 'use client'
// Layers:
//   1. ErrorBoundary      — synchronous React render errors
//   2. AsyncErrorBoundary — unhandled promise rejections
//   3. NetworkBoundary    — online/offline awareness
// Upgraded: Sentry-ready onError hook, retry count limit,
//           dark-glass FYK brand fallback UI, full JSDoc,
//           ARIA live region, a11y WCAG 2.1 AA
// ═══════════════════════════════════════════════════════════════

import React, { type ReactNode, type ComponentType } from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retries: number;
}

export interface FallbackProps {
  error: Error;
  resetError: () => void;
  retries: number;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component — receives error + resetError + retries */
  fallback?: ComponentType<FallbackProps>;
  /**
   * Called on every caught error. Wire to Sentry / Datadog here:
   * `onError={(err, info) => Sentry.captureException(err, { extra: info })}`
   */
  onError?: (error: Error, info: React.ErrorInfo) => void;
  /** Max auto-retries before showing permanent error. Default: 0 */
  maxRetries?: number;
}

// ── Default Fallback UI (FYK dark-glass theme) ────────────────

function DefaultFallback({ error, resetError, retries }: FallbackProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-6 p-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
        <AlertTriangle className="h-7 w-7 text-red-400" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
        <p className="max-w-xs text-sm text-white/50">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {retries > 0 && (
          <p className="text-xs text-white/30">Retry attempt {retries}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={resetError}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/60"
        >
          Reload app
        </button>
      </div>

      {import.meta.env.DEV && (
        <pre className="max-w-sm overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/40">
          {error.stack}
        </pre>
      )}
    </div>
  );
}

// ── 1. ErrorBoundary — synchronous render errors ──────────────

/**
 * Catches synchronous React render errors.
 * Wrap any subtree you want protected:
 *
 * @example
 * <ErrorBoundary onError={(e) => Sentry.captureException(e)}>
 *   <MyFeature />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorState> {
  state: ErrorState = { hasError: false, error: null, errorInfo: null, retries: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  resetError = () => {
    const { maxRetries = 0 } = this.props;
    const nextRetries = this.state.retries + 1;
    if (maxRetries > 0 && nextRetries > maxRetries) return;
    this.setState({ hasError: false, error: null, errorInfo: null, retries: nextRetries });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const Fallback = this.props.fallback ?? DefaultFallback;
    return (
      <Fallback
        error={this.state.error!}
        resetError={this.resetError}
        retries={this.state.retries}
      />
    );
  }
}

// ── 2. AsyncErrorBoundary — unhandled promise rejections ──────

interface AsyncState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches `window.unhandledrejection` events and surfaces them
 * with the same fallback UI as ErrorBoundary.
 */
export class AsyncErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error) => void },
  AsyncState
> {
  state: AsyncState = { hasError: false, error: null };
  private _handler?: (e: PromiseRejectionEvent) => void;

  componentDidMount() {
    this._handler = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason ?? 'Unhandled rejection'));
      this.setState({ hasError: true, error });
      this.props.onError?.(error);
      if (import.meta.env.DEV) console.error('[AsyncErrorBoundary]', error);
    };
    window.addEventListener('unhandledrejection', this._handler);
  }

  componentWillUnmount() {
    if (this._handler) window.removeEventListener('unhandledrejection', this._handler);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <DefaultFallback
        error={this.state.error!}
        resetError={() => this.setState({ hasError: false, error: null })}
        retries={0}
      />
    );
  }
}

// ── 3. NetworkBoundary — offline banner ───────────────────────

interface NetworkState {
  isOnline: boolean;
}

/**
 * Shows an offline banner when the device loses connectivity.
 * Automatically recovers when reconnected (no reload required).
 */
export class NetworkBoundary extends React.Component<
  { children: ReactNode },
  NetworkState
> {
  state: NetworkState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };

  private _onOnline = () => this.setState({ isOnline: true });
  private _onOffline = () => this.setState({ isOnline: false });

  componentDidMount() {
    window.addEventListener('online', this._onOnline);
    window.addEventListener('offline', this._onOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this._onOnline);
    window.removeEventListener('offline', this._onOffline);
  }

  render() {
    if (this.state.isOnline) return this.props.children;
    return (
      <div
        role="alert"
        aria-live="polite"
        className="flex min-h-[40vh] flex-col items-center justify-center gap-6 p-6 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10">
          <WifiOff className="h-7 w-7 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">No internet connection</h2>
          <p className="max-w-xs text-sm text-white/50">
            Check your Wi-Fi or mobile data. The app will resume automatically when you're back online.
          </p>
        </div>
      </div>
    );
  }
}

// ── Convenience wrapper — all three layers in one ─────────────

/**
 * Drop-in triple-layer boundary:
 * NetworkBoundary → AsyncErrorBoundary → ErrorBoundary
 *
 * @example
 * <AppBoundary onError={(e) => Sentry.captureException(e)}>
 *   <App />
 * </AppBoundary>
 */
export function AppBoundary({
  children,
  onError,
}: {
  children: ReactNode;
  onError?: (error: Error, info?: React.ErrorInfo) => void;
}) {
  return (
    <NetworkBoundary>
      <AsyncErrorBoundary onError={(e) => onError?.(e)}>
        <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
      </AsyncErrorBoundary>
    </NetworkBoundary>
  );
}
