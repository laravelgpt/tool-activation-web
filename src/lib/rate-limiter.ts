interface RateLimitData {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitData>();

  constructor(
    private windowMs: number = 60000, // 1 minute
    private maxRequests: number = 100
  ) {}

  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      // New window or expired
      const resetTime = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (record.count >= this.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    return { allowed: true, remaining: this.maxRequests - record.count, resetTime: record.resetTime };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Create instances for different endpoints
export const authLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth
export const apiLimiter = new RateLimiter(60 * 1000, 100); // 100 requests per minute for general API
export const strictLimiter = new RateLimiter(60 * 1000, 10); // 10 requests per minute for sensitive operations

// Clean up expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    authLimiter.cleanup();
    apiLimiter.cleanup();
    strictLimiter.cleanup();
  }, 5 * 60 * 1000);
}

export function createRateLimitMiddleware(limiter: RateLimiter) {
  return (identifier: string) => {
    return limiter.isAllowed(identifier);
  };
}