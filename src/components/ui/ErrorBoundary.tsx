import {Component, ErrorInfo, ReactNode} from 'react';
import {AlertTriangle, Home, RefreshCw} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div
                            className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-destructive"/>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                            <p className="text-muted-foreground">
                                We're sorry, but something unexpected happened. Please try again or return to the home
                                page.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="p-4 rounded-lg bg-card border border-border text-left">
                                <p className="text-sm font-mono text-destructive break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={this.handleRetry} variant="outline" className="gap-2">
                                <RefreshCw className="w-4 h-4"/>
                                Try Again
                            </Button>
                            <Button onClick={this.handleGoHome} className="gap-2 gradient-primary">
                                <Home className="w-4 h-4"/>
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }

    private handleRetry = () => {
        this.setState({hasError: false, error: null});
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };
}
