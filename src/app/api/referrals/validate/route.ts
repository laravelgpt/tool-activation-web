import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const validateReferralSchema = z.object({
  referralCode: z.string().min(1, 'Referral code is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateReferralSchema.parse(body);

    // Find user with this referral code
    const referrer = await db.user.findUnique({
      where: { referralCode: validatedData.referralCode },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!referrer) {
      return NextResponse.json({ 
        valid: false,
        error: 'Invalid referral code' 
      }, { status: 404 });
    }

    if (!referrer.isActive) {
      return NextResponse.json({ 
        valid: false,
        error: 'Referral code is inactive' 
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        id: referrer.id,
        name: referrer.name || referrer.email,
      },
      bonus: 5, // 5 credits bonus for both referrer and referred user
    });
  } catch (error) {
    console.error('Referral validation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}