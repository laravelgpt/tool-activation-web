import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'X-XSS-Protection'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Strict-Transport-Security'?: string;
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers: SecurityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };

  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}

export function validateRequest(request: NextRequest): { isValid: boolean; error?: string } {
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-forwarded-host',
    'x-forwarded-proto',
  ];

  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10) {
    return { isValid: false, error: 'Invalid user agent' };
  }

  // Check for common attack patterns
  const url = request.nextUrl.pathname + request.nextUrl.search;
  const attackPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /eval\((.*?)\)/gi,
    /expression\((.*?)\)/gi,
    /union.*select/gi,
    /drop.*table/gi,
    /insert.*into/gi,
    /delete.*from/gi,
    /update.*set/gi,
  ];

  for (const pattern of attackPatterns) {
    if (pattern.test(url)) {
      return { isValid: false, error: 'Potential security threat detected' };
    }
  }

  // Rate limiting by IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // This is a simple implementation - in production, you'd want to use Redis
  const requestCounts = (global as any).requestCounts || new Map<string, { count: number; resetTime: number }>();
  (global as any).requestCounts = requestCounts;

  const ipData = requestCounts.get(ip) || { count: 0, resetTime: now + 60000 };
  
  if (now > ipData.resetTime) {
    ipData.count = 1;
    ipData.resetTime = now + 60000;
  } else {
    ipData.count++;
  }

  requestCounts.set(ip, ipData);

  if (ipData.count > 100) { // 100 requests per minute
    return { isValid: false, error: 'Rate limit exceeded' };
  }

  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\((.*?)\)/gi, '')
    .replace(/expression\((.*?)\)/gi, '')
    .trim();
}

export function withSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Validate request
      const validation = validateRequest(req);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid request' },
          { status: 400 }
        );
      }

      // Apply security headers to response
      const response = await handler(req);
      return applySecurityHeaders(response);
    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function logSecurityEvent(event: string, details: any, request: NextRequest) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request.ip || request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
  };

  console.log('Security Event:', JSON.stringify(logEntry, null, 2));
  
  // In production, you'd want to send this to a security monitoring service
  // or store it in a dedicated security logs table
}

export function detectSuspiciousActivity(request: NextRequest): { isSuspicious: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || '';
  
  // Check for suspicious user agents
  const suspiciousUserAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i,
    /test/i,
    /curl/i,
    /wget/i,
    /python/i,
    /perl/i,
    /java/i,
  ];

  if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
    return { isSuspicious: true, reason: 'Suspicious user agent' };
  }

  // Check for requests to sensitive endpoints
  const sensitiveEndpoints = [
    '/api/auth/',
    '/api/admin/',
    '/api/users/',
    '/api/licenses/',
  ];

  if (sensitiveEndpoints.some(endpoint => request.nextUrl.pathname.startsWith(endpoint))) {
    // Log access to sensitive endpoints
    logSecurityEvent('SENSITIVE_ENDPOINT_ACCESS', { endpoint: request.nextUrl.pathname }, request);
  }

  return { isSuspicious: false };
}