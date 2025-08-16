import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { consumeUserCredits } from '@/lib/credits';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { amount, description, metadata } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const result = await consumeUserCredits(
      req.user!.userId,
      amount,
      description,
      metadata
    );

    return NextResponse.json({
      success: true,
      credits: result.user.credits,
      transaction: result.transaction,
      message: `Successfully used ${amount} credits`,
    });
  } catch (error) {
    console.error('Credit usage error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to use credits',
        success: false 
      },
      { status: 400 }
    );
  }
});