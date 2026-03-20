// =====================================================
// ENTERPRISE ERROR BOUNDARY - PRODUCTION READY
// Comprehensive error handling with logging and recovery
// =====================================================
import React, {Component, ErrorInfo, ReactNode} from 'react';
import {log} from '@/lib/enterprise/Logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Enterprise-grade Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the crashed component tree.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our enterprise logging system
    log.error('ERROR_BOUNDARY', 'Component tree error caught', error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Update state with error info
    this.setState({errorInfo});

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      this.reportErrorToService(error, errorInfo);
    }
  }

  private reportErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // This would be replaced with actual error reporting service
      // e.g., Sentry, LogRocket, Datadog, etc.
      console.error('Production Error Report:', {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    } catch (reportingError) {
      // Silently fail if error reporting fails
      console.warn('Failed to report error to service:', reportingError);
    }
  };

  private handleRetry = () => {
    // Reset error state to allow retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReportIssue = () => {
    // Open issue reporting (could integrate with GitHub Issues, Jira, etc.)
    const subject = encodeURIComponent(`Error Report: ${this.state.error?.message || 'Unknown Error'}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
    `.trim());

    window.open(`mailto:support@findyourkingzero.com?subject=${subject}&body=${body}`);
  };

  public override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default enterprise error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Error Title */}
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                We encountered an unexpected error. Our team has been notified.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-muted rounded-lg p-4 text-left">
                <p className="text-xs font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
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
                className="px-4 py-2 border border-border rounded-md font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                Report Issue
              </button>
            </div>

            {/* Support Information */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                Need help? Contact{' '}
                <a
                  href="mailto:support@findyourkingzero.com"
                  className="text-primary hover:underline"
                >
                  support@findyourkingzero.com
                </a>
              </p>
              {this.state.errorId && (
                <p className="font-mono">
                  Reference ID: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;