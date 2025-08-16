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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const status = await TwoFactorAuthService.getStatus(userId);

    return NextResponse.json({
      status
    });
  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get 2FA status' },
      { status: 500 }
    );
  }
}