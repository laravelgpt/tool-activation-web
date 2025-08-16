import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailService } from '@/lib/email-service';
import { authRateLimit } from '@/lib/rate-limit-middleware';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { email, password, name, referralCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    let referrerId = null;
    let referralBonus = 0;

    // Validate referral code if provided
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode },
        select: { id: true, isActive: true },
      });

      if (referrer && referrer.isActive) {
        referrerId = referrer.id;
        referralBonus = 5; // 5 credits bonus
      }
    }

    const user = await createUser(email, password, name);

    // Update user with referral information
    if (referrerId) {
      await db.user.update({
        where: { id: user.id },
        data: {
          referredBy: referrerId,
          credits: {
            increment: referralBonus,
          },
        },
      });

      // Create credit transaction for referred user
      await db.creditTransaction.create({
        data: {
          userId: user.id,
          amount: referralBonus,
          type: 'REFERRAL',
          description: 'Referral bonus for signing up',
          metadata: {
            referrerId,
            referralCode,
          },
        },
      });

      // Add bonus to referrer
      await db.user.update({
        where: { id: referrerId },
        data: {
          credits: {
            increment: referralBonus,
          },
        },
      });

      // Create credit transaction for referrer
      await db.creditTransaction.create({
        data: {
          userId: referrerId,
          amount: referralBonus,
          type: 'REFERRAL',
          description: 'Referral bonus for user signup',
          metadata: {
            referredUserId: user.id,
            referredUserEmail: email,
          },
        },
      });

      // Send referral bonus email to referrer
      const referrerUser = await db.user.findUnique({
        where: { id: referrerId },
        select: { credits: true },
      });
      
      if (referrerUser) {
        await emailService.sendReferralBonusEmail(
          referrerId,
          referralBonus,
          email,
          referrerUser.credits + referralBonus
        );
      }
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(user.id);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits + (referrerId ? referralBonus : 0),
      },
      accessToken,
      referralBonus: referrerId ? referralBonus : 0,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}