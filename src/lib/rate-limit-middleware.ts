import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, apiRateLimiters } from './api-rate-limiter';

export interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Apply rate limiting to a request
export async function applyRateLimit(req: NextRequest, config: RateLimitConfig = {}): Promise<NextResponse | null> {
  const {
    windowMs = 60 * 1000,
    maxRequests = 100,
    keyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  // Choose the appropriate limiter based on the path
  const path = req.nextUrl.pathname;
  let limiterType: keyof typeof apiRateLimiters = 'general';

  if (path.startsWith('/api/auth/')) {
    limiterType = 'auth';
  } else if (path.startsWith('/api/admin/') || path.includes('/reset-password') || path.includes('/forgot-password')) {
    limiterType = 'sensitive';
  } else if (path.includes('/upload')) {
    limiterType = 'upload';
  } else if (path.startsWith('/api/admin/')) {
    limiterType = 'admin';
  } else if (path.startsWith('/api/public/')) {
    limiterType = 'public';
  }

  const middleware = withRateLimit(limiterType, {
    windowMs,
    maxRequests,
    keyGenerator,
    skipSuccessfulRequests,
    skipFailedRequests,
  });

  const response = new NextResponse();
  return await middleware(req, response);
}

// Pre-configured rate limiters for common use cases
export async function authRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return await applyRateLimit(req, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests
  });
}

export async function apiRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return await applyRateLimit(req, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests
  });
}

export async function strictRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return await applyRateLimit(req, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests
  });
}

// Specialized rate limiters for specific use cases
export async function uploadRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return await applyRateLimit(req, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests
  });
}

export async function adminRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return await applyRateLimit(req, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests
  });
}

export async function publicApiRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return await applyRateLimit(req, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000, // 1000 requests
  });
}

// Higher-order function for creating rate-limited API routes
export function withRateLimitHandler<T extends (...args: any[]) => any>(
  handler: T,
  limiterType: keyof typeof apiRateLimiters = 'general',
  config?: Partial<RateLimitConfig>
): T {
  return (async function(this: any, req: NextRequest, ...args: any[]) {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // If not rate limited, proceed with the handler
    return handler.apply(this, [req, ...args]);
  }) as T;
}