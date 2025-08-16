'use client';

import { useEffect } from 'react';
import { errorTracker } from '@/lib/error-tracker';

interface UseErrorTrackingOptions {
  enabled?: boolean;
  trackUnhandledErrors?: boolean;
  trackUnhandledRejections?: boolean;
  trackConsoleErrors?: boolean;
  context?: Record<string, any>;
}

export function useErrorTracking(options: UseErrorTrackingOptions = {}) {
  const {
    enabled = true,
    trackUnhandledErrors = true,
    trackUnhandledRejections = true,
    trackConsoleErrors = false,
    context = {}
  } = options;

  useEffect(() => {
    if (!enabled) return;

    // Track unhandled errors
    if (trackUnhandledErrors) {
      const handleError = (event: ErrorEvent) => {
        errorTracker.trackError({
          level: 'error',
          type: 'application',
          message: event.message,
          stackTrace: event.error?.stack,
          context: {
            ...context,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            userAgent: navigator.userAgent,
            url: window.location.href
          },
          route: window.location.pathname,
          tags: ['client', 'unhandled', 'javascript'],
          severity: 'high'
        });
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, [enabled, trackUnhandledErrors, context]);

  useEffect(() => {
    if (!enabled) return;

    // Track unhandled promise rejections
    if (trackUnhandledRejections) {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        errorTracker.trackError({
          level: 'error',
          type: 'application',
          message: event.reason instanceof Error ? event.reason.message : 'Unhandled promise rejection',
          stackTrace: event.reason instanceof Error ? event.reason.stack : undefined,
          context: {
            ...context,
            reason: event.reason,
            userAgent: navigator.userAgent,
            url: window.location.href
          },
          route: window.location.pathname,
          tags: ['client', 'unhandled', 'promise'],
          severity: 'high'
        });
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }
  }, [enabled, trackUnhandledRejections, context]);

  useEffect(() => {
    if (!enabled || !trackConsoleErrors) return;

    // Override console.error to track errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Call the original console.error first
      originalConsoleError.apply(console, args);

      // Track the error
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      errorTracker.trackError({
        level: 'error',
        type: 'application',
        message: `Console Error: ${message}`,
        context: {
          ...context,
          arguments: args,
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        route: window.location.pathname,
        tags: ['client', 'console'],
        severity: 'medium'
      });
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [enabled, trackConsoleErrors, context]);
}

// Hook for tracking specific errors
export function useTrackError() {
  const trackError = (error: Error | string, additionalContext?: Record<string, any>) => {
    const message = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    errorTracker.trackError({
      level: 'error',
      type: 'application',
      message,
      stackTrace,
      context: {
        ...additionalContext,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      route: window.location.pathname,
      tags: ['client', 'manual'],
      severity: 'medium'
    });
  };

  const trackWarning = (message: string, context?: Record<string, any>) => {
    errorTracker.trackError({
      level: 'warning',
      type: 'application',
      message,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      route: window.location.pathname,
      tags: ['client', 'manual'],
      severity: 'low'
    });
  };

  const trackInfo = (message: string, context?: Record<string, any>) => {
    errorTracker.trackError({
      level: 'info',
      type: 'application',
      message,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      route: window.location.pathname,
      tags: ['client', 'manual'],
      severity: 'low'
    });
  };

  return { trackError, trackWarning, trackInfo };
}

// Performance tracking hook
export function usePerformanceTracking() {
  const trackPerformance = (name: string, duration: number, context?: Record<string, any>) => {
    if (duration > 5000) { // Track if operation takes more than 5 seconds
      errorTracker.trackError({
        level: 'warning',
        type: 'performance',
        message: `Slow operation: ${name} took ${duration}ms`,
        context: {
          ...context,
          duration,
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        route: window.location.pathname,
        tags: ['client', 'performance'],
        severity: 'medium'
      });
    }
  };

  const trackApiError = (endpoint: string, error: Error, context?: Record<string, any>) => {
    errorTracker.trackError({
      level: 'error',
      type: 'network',
      message: `API Error: ${endpoint} - ${error.message}`,
      stackTrace: error.stack,
      context: {
        ...context,
        endpoint,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      route: window.location.pathname,
      tags: ['client', 'api', 'network'],
      severity: 'high'
    });
  };

  return { trackPerformance, trackApiError };
}