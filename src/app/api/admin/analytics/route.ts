import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId || payload.role !== 'ADMIN') {
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

    // Get system-wide statistics
    const [
      totalUsers,
      activeUsers,
      totalLicenses,
      activeLicenses,
      totalDevices,
      activeDevices,
      totalTransactions,
      totalPayments,
      completedPayments,
      totalTickets,
      openTickets,
      totalNews,
      publishedNews
    ] = await Promise.all([
      // User statistics
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      
      // License statistics
      db.license.count(),
      db.license.count({ where: { active: true } }),
      
      // Device statistics
      db.device.count(),
      db.device.count({ where: { isActive: true } }),
      
      // Transaction statistics
      db.creditTransaction.count(),
      
      // Payment statistics
      db.payment.count(),
      db.payment.count({ where: { status: 'COMPLETED' } }),
      
      // Ticket statistics
      db.ticket.count(),
      db.ticket.count({ where: { status: 'OPEN' } }),
      
      // News statistics
      db.news.count(),
      db.news.count({ where: { isPublished: true } })
    ]);

    // Get period-specific statistics
    const [
      newUsers,
      newLicenses,
      periodTransactions,
      periodPayments,
      periodCompletedPayments,
      periodTickets,
      periodNews
    ] = await Promise.all([
      // New users in period
      db.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // New licenses in period
      db.license.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Transactions in period
      db.creditTransaction.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Payments in period
      db.payment.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Completed payments in period
      db.payment.count({
        where: {
          createdAt: {
            gte: startDate
          },
          status: 'COMPLETED'
        }
      }),
      
      // Tickets created in period
      db.ticket.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // News created in period
      db.news.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ]);

    // Get financial statistics
    const financialStats = await db.payment.aggregate({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      },
      _avg: {
        amount: true
      },
      _count: {
        _all: true
      }
    });

    const completedFinancialStats = await db.payment.aggregate({
      where: {
        createdAt: {
          gte: startDate
        },
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    });

    // Get user activity by day
    const userActivityByDay = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        _all: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get license usage statistics
    const licenseUsageStats = await db.license.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        _all: true
      }
    });

    // Get payment method statistics
    const paymentMethodStats = await db.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        _all: true
      }
    });

    // Get top users by credits
    const topUsersByCredits = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        createdAt: true
      },
      orderBy: {
        credits: 'desc'
      },
      take: 10
    });

    // Get top users by referrals
    const topUsersByReferrals = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        referrals: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        referrals: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalLicenses,
        activeLicenses,
        totalDevices,
        activeDevices,
        totalTransactions,
        totalPayments,
        completedPayments,
        totalTickets,
        openTickets,
        totalNews,
        publishedNews
      },
      periodStats: {
        newUsers,
        newLicenses,
        periodTransactions,
        periodPayments,
        periodCompletedPayments,
        periodTickets,
        periodNews
      },
      financial: {
        totalRevenue: financialStats._sum.amount || 0,
        averagePayment: financialStats._avg.amount || 0,
        totalPayments: financialStats._count._all || 0,
        completedRevenue: completedFinancialStats._sum.amount || 0,
        completedPayments: completedFinancialStats._count._all || 0,
        conversionRate: financialStats._count._all > 0 
          ? (completedFinancialStats._count._all || 0) / financialStats._count._all 
          : 0
      },
      userActivity: userActivityByDay,
      licenseUsage: licenseUsageStats,
      paymentMethods: paymentMethodStats,
      topUsers: {
        byCredits: topUsersByCredits.map(u => ({
          ...u,
          referralsCount: u.referrals.length
        })),
        byReferrals: topUsersByReferrals.map(u => ({
          ...u,
          referralsCount: u.referrals.length,
          credits: u.credits
        }))
      },
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin analytics data' },
      { status: 500 }
    );
  }
}