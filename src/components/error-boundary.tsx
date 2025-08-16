'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorTracker } from '@/lib/error-tracker';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log the error to console for debugging
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Try to track the error, but don't let error tracking cause more errors
    try {
      // Check if errorTracker is available and has the trackError method
      if (typeof errorTracker !== 'undefined' && typeof errorTracker.trackError === 'function') {
        errorTracker.trackError({
          level: 'error',
          type: 'application',
          message: `React Error Boundary: ${error.message}`,
          stackTrace: error.stack,
          context: {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'ErrorBoundary',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined
          },
          route: typeof window !== 'undefined' ? window.location.pathname : undefined,
          tags: ['client', 'react', 'error-boundary'],
          severity: 'high'
        });
      } else {
        console.warn('Error tracker not available or trackError method missing');
      }
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Error details:</p>
                  <p className="text-sm font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Component Stack (Dev Mode)
                      </summary>
                      <pre className="mt-2 p-2 bg-background rounded text-xs font-mono overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  If this problem persists, please contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorBoundary() {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Hook Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    try {
      // Check if errorTracker is available and has the trackError method
      if (typeof errorTracker !== 'undefined' && typeof errorTracker.trackError === 'function') {
        errorTracker.trackError({
          level: 'error',
          type: 'application',
          message: `Hook Error Boundary: ${error.message}`,
          stackTrace: error.stack,
          context: {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'useErrorBoundary',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined
          },
          route: typeof window !== 'undefined' ? window.location.pathname : undefined,
          tags: ['client', 'react', 'hook-error-boundary'],
          severity: 'high'
        });
      } else {
        console.warn('Error tracker not available or trackError method missing');
      }
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  };

  return { handleError };
}

// Higher-order component for error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}