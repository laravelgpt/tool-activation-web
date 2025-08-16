import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';
import { AuditLogger } from '@/lib/audit-logger';

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

    await AuditLogger.logAdminAction(
      payload.userId,
      'VIEW_TICKETS',
      'TICKET',
      undefined,
      'Admin viewed support tickets',
      undefined,
      request
    );

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const whereClause: any = {};
    if (status && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      whereClause.status = status;
    }
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      whereClause.priority = priority;
    }

    const tickets = await db.ticket.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    const total = await db.ticket.count({
      where: whereClause,
    });

    // Get statistics
    const stats = await db.ticket.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const priorityStats = await db.ticket.groupBy({
      by: ['priority'],
      _count: {
        priority: true,
      },
    });

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>),
        byPriority: priorityStats.reduce((acc, stat) => {
          acc[stat.priority] = stat._count.priority;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Admin tickets fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}