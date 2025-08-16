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

    const setup = await TwoFactorAuthService.generateSecret(userId);

    return NextResponse.json({
      message: 'Two-factor authentication setup initiated',
      setup: {
        secret: setup.secret,
        qrCode: setup.qrCode,
        backupCodes: setup.backupCodes
      }
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}