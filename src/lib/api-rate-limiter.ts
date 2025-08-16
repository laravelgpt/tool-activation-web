import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests allowed in the window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  handler?: (req: NextRequest, res: NextResponse) => NextResponse; // Custom handler for rate limited requests
  onLimitReached?: (req: NextRequest, key: string) => void; // Callback when limit is reached
}

export interface RateLimitInfo {
  remaining: number;
  reset: Date;
  total: number;
}

export class ApiRateLimiter {
  private stores = new Map<string, {
    requests: Array<{ timestamp: number; success?: boolean }>;
    config: RateLimitConfig;
  }>();

  constructor(private defaultConfig: RateLimitConfig) {}

  middleware(config: Partial<RateLimitConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    return async (req: NextRequest, res: NextResponse): Promise<NextResponse> => {
      const key = this.generateKey(req, finalConfig);
      const result = await this.checkRateLimit(key, finalConfig, req);

      if (result.isLimited) {
        if (finalConfig.onLimitReached) {
          finalConfig.onLimitReached(req, key);
        }

        if (finalConfig.handler) {
          return finalConfig.handler(req, res);
        }

        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded',
            retryAfter: Math.ceil((result.reset.getTime() - Date.now()) / 1000),
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.reset.toISOString(),
              'Retry-After': Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      res.headers.set('X-RateLimit-Limit', finalConfig.maxRequests.toString());
      res.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      res.headers.set('X-RateLimit-Reset', result.reset.toISOString());

      return res;
    };
  }

  private generateKey(req: NextRequest, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(req);
    }

    // Default key generation: IP + User-Agent + Path
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const path = req.nextUrl.pathname;

    return `${ip}:${userAgent}:${path}`;
  }

  private getClientIP(req: NextRequest): string {
    return (
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      req.ip ||
      'unknown'
    );
  }

  private async checkRateLimit(
    key: string, 
    config: RateLimitConfig, 
    req: NextRequest
  ): Promise<{
    isLimited: boolean;
    remaining: number;
    reset: Date;
  }> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create store for this key
    if (!this.stores.has(key)) {
      this.stores.set(key, {
        requests: [],
        config,
      });
    }

    const store = this.stores.get(key)!;

    // Clean old requests
    store.requests = store.requests.filter(req => req.timestamp > windowStart);

    // Count requests based on config
    let requestCount = 0;
    for (const request of store.requests) {
      if (config.skipSuccessfulRequests && request.success === true) continue;
      if (config.skipFailedRequests && request.success === false) continue;
      requestCount++;
    }

    const remaining = Math.max(0, config.maxRequests - requestCount);
    const reset = new Date(now + config.windowMs);

    if (requestCount >= config.maxRequests) {
      return {
        isLimited: true,
        remaining: 0,
        reset,
      };
    }

    // Add current request to store (will be updated after response)
    store.requests.push({
      timestamp: now,
    });

    return {
      isLimited: false,
      remaining,
      reset,
    };
  }

  // Method to record request success/failure after the fact
  recordRequestOutcome(key: string, success: boolean): void {
    const store = this.stores.get(key);
    if (store && store.requests.length > 0) {
      const lastRequest = store.requests[store.requests.length - 1];
      lastRequest.success = success;
    }
  }

  // Get current rate limit info for a key
  getRateLimitInfo(key: string): RateLimitInfo | null {
    const store = this.stores.get(key);
    if (!store) return null;

    const now = Date.now();
    const windowStart = now - store.config.windowMs;
    
    // Clean old requests
    store.requests = store.requests.filter(req => req.timestamp > windowStart);

    let requestCount = 0;
    for (const request of store.requests) {
      if (store.config.skipSuccessfulRequests && request.success === true) continue;
      if (store.config.skipFailedRequests && request.success === false) continue;
      requestCount++;
    }

    return {
      remaining: Math.max(0, store.config.maxRequests - requestCount),
      reset: new Date(now + store.config.windowMs),
      total: store.config.maxRequests,
    };
  }

  // Clean up old stores
  cleanup(): void {
    const now = Date.now();
    for (const [key, store] of this.stores.entries()) {
      const windowStart = now - store.config.windowMs;
      store.requests = store.requests.filter(req => req.timestamp > windowStart);
      
      // Remove store if no recent requests
      if (store.requests.length === 0) {
        this.stores.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const apiRateLimiters = {
  // General API rate limiter (100 requests per minute)
  general: new ApiRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // Authentication rate limiter (5 requests per minute)
  auth: new ApiRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    skipSuccessfulRequests: false,
  }),

  // Sensitive operations rate limiter (10 requests per hour)
  sensitive: new ApiRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  }),

  // File upload rate limiter (5 requests per minute)
  upload: new ApiRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  }),

  // Admin operations rate limiter (30 requests per minute)
  admin: new ApiRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  }),

  // Public API rate limiter (1000 requests per hour)
  public: new ApiRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
  }),
};

// Convenience functions for common rate limiting scenarios
export function withRateLimit(limiterType: keyof typeof apiRateLimiters, config?: Partial<RateLimitConfig>) {
  const limiter = apiRateLimiters[limiterType];
  return limiter.middleware(config);
}

// Higher-order function for route-level rate limiting
export function createRateLimitedHandler<T extends (...args: any[]) => any>(
  handler: T,
  limiterType: keyof typeof apiRateLimiters,
  config?: Partial<RateLimitConfig>
): T {
  const limiter = apiRateLimiters[limiterType];
  const middleware = limiter.middleware(config);

  return (async function(this: any, req: NextRequest, ...args: any[]) {
    const response = new NextResponse();
    const rateLimitResponse = await middleware(req, response);
    
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    return handler.apply(this, [req, ...args]);
  }) as T;
}

// IP-based rate limiting for specific scenarios
export function createIPRateLimiter(config: RateLimitConfig) {
  return new ApiRateLimiter({
    ...config,
    keyGenerator: (req: NextRequest) => {
      const ip = (
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        req.headers.get('cf-connecting-ip') ||
        req.ip ||
        'unknown'
      );
      return `ip:${ip}`;
    },
  });
}

// User-based rate limiting for authenticated users
export function createUserRateLimiter(config: RateLimitConfig) {
  return new ApiRateLimiter({
    ...config,
    keyGenerator: (req: NextRequest) => {
      // This would require authentication middleware to set user ID
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `user:${userId}`;
    },
  });
}

// Start periodic cleanup
if (typeof window === 'undefined') {
  setInterval(() => {
    Object.values(apiRateLimiters).forEach(limiter => limiter.cleanup());
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}