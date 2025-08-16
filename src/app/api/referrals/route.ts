import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a referral code
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { referralCode: true, referredBy: true },
    });

    if (user?.referralCode) {
      return NextResponse.json({ 
        error: 'User already has a referral code',
        referralCode: user.referralCode 
      }, { status: 400 });
    }

    // Generate unique referral code
    const referralCode = `REF_${uuidv4().substring(0, 8).toUpperCase()}`;

    // Update user with referral code
    const updatedUser = await db.user.update({
      where: { id: payload.userId },
      data: { referralCode },
    });

    return NextResponse.json({
      referralCode,
      message: 'Referral code generated successfully',
    });
  } catch (error) {
    console.error('Referral code generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        referrals: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            credits: true,
          },
        },
        referrer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral statistics
    const referralStats = await db.creditTransaction.aggregate({
      where: {
        userId: payload.userId,
        type: 'REFERRAL',
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    return NextResponse.json({
      referralCode: user.referralCode,
      referredBy: user.referredBy ? user.referrer : null,
      referrals: user.referrals,
      stats: {
        totalReferrals: user.referrals.length,
        totalCreditsEarned: referralStats._sum.amount || 0,
        totalTransactions: referralStats._count._all || 0,
      },
    });
  } catch (error) {
    console.error('Referral data fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}