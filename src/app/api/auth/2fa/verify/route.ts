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

    const { userId, secret, token } = await request.json();

    if (!userId || !secret || !token) {
      return NextResponse.json(
        { error: 'User ID, secret, and token are required' },
        { status: 400 }
      );
    }

    const backupCodes = await TwoFactorAuthService.verifyAndEnable(userId, token);

    return NextResponse.json({
      message: 'Two-factor authentication enabled successfully',
      backupCodes
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}