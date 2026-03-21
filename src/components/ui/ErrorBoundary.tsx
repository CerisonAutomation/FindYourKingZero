// =====================================================
// ENTERPRISE ERROR BOUNDARY - PRODUCTION READY
// Comprehensive error handling with Sentry + Logger
// =====================================================
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { log } from '@/lib/enterprise/Logger';

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
}

/**
 * Enterprise-grade React Error Boundary.
 * - Catches synchronous render errors in the child component tree.
 * - Reports to Sentry in production via captureException.
 * - Logs via the enterprise Logger singleton.
 * - Renders a recovery UI with retry / reload / report actions.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
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

    // 2. Sentry — always capture, tag with boundary errorId
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      },
    });

    // 3. Store errorInfo for dev display
    this.setState({ errorInfo });

    // 4. Propagate to parent if needed
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReportIssue = (): void => {
    const subject = encodeURIComponent(
      `Error Report: ${this.state.error?.message ?? 'Unknown Error'}`
    );
    const body = encodeURIComponent(
      [
        `Error ID: ${this.state.errorId ?? 'n/a'}`,
        `Error: ${this.state.error?.message ?? ''}`,
        `URL: ${window.location.href}`,
        `Time: ${new Date().toISOString()}`,
        `Stack: ${this.state.error?.stack ?? ''}`,
        `Component Stack: ${this.state.errorInfo?.componentStack ?? ''}`,
      ].join('\n')
    );
    window.open(`mailto:support@fyking.men?subject=${subject}&body=${body}`);
  };

  public override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-destructive"
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
              We encountered an unexpected error. Our team has been notified.
            </p>
          </div>

          {/* Dev-only details */}
          {import.meta.env.DEV && this.state.error && (
            <div className="text-left bg-muted rounded-md p-3 space-y-1">
              <p className="text-xs font-mono text-destructive break-all">
                {this.state.error.message}
              </p>
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {this.state.errorId}
                </p>
              )}
              {this.state.errorInfo?.componentStack && (
                <pre className="text-xs text-muted-foreground overflow-auto max-h-32 mt-2">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleReportIssue}
              className="px-4 py-2 bg-outline text-foreground border border-border rounded-md font-medium hover:bg-muted transition-colors"
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
              <span className="block mt-1 font-mono">Ref: {this.state.errorId}</span>
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
  onError?: (error: Error, errorInfo: ErrorInfo) => void
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
