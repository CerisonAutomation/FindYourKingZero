// =====================================================
// ENTERPRISE ERROR BOUNDARY — Sentry + Supabase + Logger
// =====================================================
import React, {Component, type ErrorInfo, type ReactNode} from 'react';
import * as Sentry from '@sentry/react';
import {log} from '@/lib/enterprise/Logger';

// Lazy-import supabase to avoid circular deps and keep boundary lightweight
let supabaseClient: typeof import('@/integrations/supabase/client').supabase | null = null;
async function getSupabase() {
  if (!supabaseClient) {
    try {
      const mod = await import('@/integrations/supabase/client');
      supabaseClient = mod.supabase;
    } catch {
      // Supabase not available — degrade gracefully
    }
  }
  return supabaseClient;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  reported: boolean;
}

/**
 * Enterprise-grade React Error Boundary.
 * - Catches synchronous render errors.
 * - Reports to Sentry (production) + Supabase `error_reports` table.
 * - Logs via enterprise Logger.
 * - Renders recovery UI with retry / reload / report actions.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
    reported: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 1. Enterprise structured log
    log.error('ERROR_BOUNDARY', 'Component tree error caught', error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // 2. Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      },
    });

    // 3. Supabase error reporting (fire-and-forget)
    this.reportToSupabase(error, errorInfo);

    // 4. Store errorInfo for dev display
    this.setState({ errorInfo });

    // 5. Propagate to parent
    this.props.onError?.(error, errorInfo);
  }

  private async reportToSupabase(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      const supabase = await getSupabase();
      if (!supabase) return;

      await supabase.from('error_reports').insert({
        error_id: this.state.errorId,
        message: error.message,
        stack: error.stack ?? '',
        component_stack: errorInfo.componentStack ?? '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        environment: import.meta.env.MODE,
        created_at: new Date().toISOString(),
      });

      this.setState({ reported: true });
    } catch {
      // Swallow — don't let reporting crash the error boundary
    }
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      reported: false,
    });
  };

  private handleReportIssue = (): void => {
    const subject = encodeURIComponent(
      `Error Report: ${this.state.error?.message ?? 'Unknown Error'}`,
    );
    const body = encodeURIComponent(
      [
        `Error ID: ${this.state.errorId ?? 'n/a'}`,
        `Error: ${this.state.error?.message ?? ''}`,
        `URL: ${window.location.href}`,
        `Time: ${new Date().toISOString()}`,
        `Stack: ${this.state.error?.stack ?? ''}`,
        `Component Stack: ${this.state.errorInfo?.componentStack ?? ''}`,
      ].join('\n'),
    );
    window.open(`mailto:support@fyking.men?subject=${subject}&body=${body}`);
  };

  public override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const isDev = import.meta.env.DEV;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-xl p-8 text-center space-y-6 relative z-10">
          {/* Animated icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse" style={{ boxShadow: 'var(--shadow-glow-gold)' }}>
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We encountered an unexpected error. Our team has been notified automatically.
            </p>
          </div>

          {/* Report status */}
          {this.state.reported && (
            <div className="flex items-center gap-2 justify-center text-xs text-green-600 dark:text-green-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Error report sent to our team
            </div>
          )}

          {/* Dev-only details */}
          {isDev && this.state.error && (
            <details className="text-left bg-muted rounded-lg p-4 space-y-2">
              <summary className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                Debug Details
              </summary>
              <p className="text-xs font-mono text-destructive break-all mt-2">
                {this.state.error.message}
              </p>
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground font-mono">ID: {this.state.errorId}</p>
              )}
              {this.state.errorInfo?.componentStack && (
                <pre className="text-xs text-muted-foreground overflow-auto max-h-40 mt-2 p-2 bg-background rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleReportIssue}
              className="px-5 py-2.5 bg-background text-foreground border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Report Issue
            </button>
          </div>

          {/* Support footer */}
          <p className="text-xs text-muted-foreground">
            Need help?{' '}
            <a
              href="mailto:support@fyking.men"
              className="underline hover:text-foreground transition-colors"
            >
              support@fyking.men
            </a>
            {this.state.errorId && (
              <span className="block mt-1 font-mono text-[10px]">Ref: {this.state.errorId}</span>
            )}
          </p>
        </div>
      </div>
    );
  }
}

/**
 * Higher-order component wrapper for ErrorBoundary.
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
): React.FC<P> {
  const WithBoundary: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  WithBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName ?? WrappedComponent.name})`;
  return WithBoundary;
}

export default ErrorBoundary;
