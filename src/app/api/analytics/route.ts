import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get user's license usage statistics
    const licenses = await db.license.findMany({
      where: {
        userId: payload.userId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        tool: true,
        device: true
      }
    });

    // Get credit transactions for the period
    const transactions = await db.creditTransaction.findMany({
      where: {
        userId: payload.userId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const stats = {
      totalLicenses: licenses.length,
      activeLicenses: licenses.filter(l => l.active).length,
      totalCreditsUsed: transactions
        .filter(t => t.type === 'USAGE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalCreditsPurchased: transactions
        .filter(t => t.type === 'PURCHASE')
        .reduce((sum, t) => sum + t.amount, 0),
      totalReferralBonus: transactions
        .filter(t => t.type === 'REFERRAL')
        .reduce((sum, t) => sum + t.amount, 0),
      mostUsedTool: licenses.reduce((acc, license) => {
        if (!license.tool) return acc;
        acc[license.tool.name] = (acc[license.tool.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      dailyUsage: {} as Record<string, number>
    };

    // Calculate daily usage
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt).toISOString().split('T')[0];
      if (!stats.dailyUsage[date]) {
        stats.dailyUsage[date] = 0;
      }
      if (transaction.type === 'USAGE') {
        stats.dailyUsage[date] += Math.abs(transaction.amount);
      }
    });

    return NextResponse.json({
      stats,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}