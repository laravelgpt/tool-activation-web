import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { 
  getUserCredits, 
  getUserCreditTransactions, 
  purchaseCredits,
  addBonusCredits,
  adjustCredits,
  getCreditStats
} from '@/lib/credits';

// Get user credits and transactions
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const includeTransactions = searchParams.get('transactions') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const credits = await getUserCredits(req.user!.userId);
    
    let transactions = [];
    let stats = [];
    
    if (includeTransactions) {
      transactions = await getUserCreditTransactions(req.user!.userId, limit);
    }

    if (req.user!.role === 'ADMIN') {
      stats = await getCreditStats();
    }

    return NextResponse.json({
      credits,
      transactions,
      stats: req.user!.role === 'ADMIN' ? stats : undefined,
    });
  } catch (error) {
    console.error('Credits fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
});

// Add credits (Admin only)
export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const { userId, amount, type, description, metadata } = await req.json();

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { error: 'userId, amount, and type are required' },
        { status: 400 }
      );
    }

    let result;
    switch (type) {
      case 'PURCHASE':
        result = await purchaseCredits(userId, amount, metadata?.paymentMethod);
        break;
      case 'BONUS':
        result = await addBonusCredits(userId, amount, description);
        break;
      case 'ADJUSTMENT':
        result = await adjustCredits(userId, amount, description);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid transaction type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      credits: result.user.credits,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Credit addition error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add credits' },
      { status: 500 }
    );
  }
});