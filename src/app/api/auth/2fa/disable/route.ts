import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorAuthService } from '@/lib/two-factor-auth';
import { authRateLimit } from '@/lib/rate-limit-middleware';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    await TwoFactorAuthService.disable(userId, password);

    return NextResponse.json({
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}