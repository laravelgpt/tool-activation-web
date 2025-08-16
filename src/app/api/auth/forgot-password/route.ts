import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { strictRateLimit } from '@/lib/rate-limit-middleware';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting for password reset
    const rateLimitResponse = await strictRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether the email exists for security
      return NextResponse.json({
        message: 'If your email is registered, you will receive a password reset link',
      });
    }

    if (!user.isActive) {
      return NextResponse.json({
        message: 'If your email is registered, you will receive a password reset link',
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        // We'll store the reset token in a separate field or use metadata
        // For now, we'll use a simple approach with the existing schema
        metadata: {
          ...(user.metadata as any || {}),
          resetToken,
          resetTokenExpiry: resetTokenExpiry.toISOString(),
        },
      },
    });

    // In a real implementation, you would send an email here
    // For now, we'll just return the token for demonstration
    // In production, you would use a service like SendGrid, AWS SES, etc.
    
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json({
      message: 'If your email is registered, you will receive a password reset link',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}