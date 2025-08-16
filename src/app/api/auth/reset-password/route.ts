import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';
import { strictRateLimit } from '@/lib/rate-limit-middleware';

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting for password reset
    const rateLimitResponse = await strictRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // Find user with valid reset token
    const users = await db.user.findMany({
      where: {
        metadata: {
          path: ['resetToken'],
          equals: token,
        },
      },
    });

    const user = users.find(u => {
      const metadata = u.metadata as any;
      return metadata?.resetTokenExpiry && new Date(metadata.resetTokenExpiry) > new Date();
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        metadata: {
          ...(user.metadata as any || {}),
          resetToken: null,
          resetTokenExpiry: null,
        },
      },
    });

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}