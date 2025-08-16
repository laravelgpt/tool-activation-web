import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { errorTracker } from '@/lib/error-tracker';

export function withErrorTracking(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      // Track the error
      errorTracker.trackError({
        level: 'error',
        type: 'application',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stackTrace: error instanceof Error ? error.stack : undefined,
        context: {
          url: req.url,
          method: req.method,
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
        },
        route: req.nextUrl.pathname,
        tags: ['api', 'middleware'],
        severity: 'high'
      });

      // Re-throw the error to maintain existing error handling
      throw error;
    }
  };
}

// Global error tracking utility
export function trackClientError(error: Error, context?: Record<string, any>) {
  errorTracker.trackError({
    level: 'error',
    type: 'application',
    message: error.message,
    stackTrace: error.stack,
    context: {
      ...context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    },
    tags: ['client', 'javascript'],
    severity: 'medium'
  });
}

// Security error tracking
export function trackSecurityError(message: string, context?: Record<string, any>) {
  errorTracker.trackError({
    level: 'error',
    type: 'security',
    message,
    context,
    tags: ['security'],
    severity: 'critical'
  });
}

// Performance error tracking
export function trackPerformanceError(message: string, context?: Record<string, any>) {
  errorTracker.trackError({
    level: 'warning',
    type: 'performance',
    message,
    context,
    tags: ['performance'],
    severity: 'medium'
  });
}