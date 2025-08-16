import { NextRequest, NextResponse } from 'next/server';
import { refreshUserToken, generateRefreshToken } from '@/lib/auth';
import { withRateLimit } from '@/lib/api-rate-limiter';

export async function POST(request: NextRequest) {
  // Apply rate limiting for refresh token (10 requests per minute)
  const rateLimitMiddleware = withRateLimit('auth', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  });
  
  const response = new NextResponse();
  const rateLimitResult = await rateLimitMiddleware(request, response);
  
  if (rateLimitResult.status === 429) {
    return rateLimitResult;
  }

  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    const { accessToken, user } = await refreshUserToken(refreshToken);

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      tokenVersion: user.tokenVersion,
    });

    const authResponse = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
      },
      accessToken,
    });

    // Set cookie with proper attributes for cross-origin compatibility
    authResponse.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Add rate limit headers
    authResponse.headers.set('X-RateLimit-Limit', '10');
    authResponse.headers.set('X-RateLimit-Remaining', rateLimitResult.headers.get('X-RateLimit-Remaining') || '9');
    authResponse.headers.set('X-RateLimit-Reset', rateLimitResult.headers.get('X-RateLimit-Reset') || new Date(Date.now() + 60 * 1000).toISOString());

    return authResponse;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}