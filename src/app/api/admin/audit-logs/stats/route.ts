import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/audit-logger';
import { withAdminAuth } from '@/lib/middleware';

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = (searchParams.get('timeRange') as 'day' | 'week' | 'month' | 'year') || 'week';
    
    const stats = await auditLogger.getLogStats(timeRange);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit log stats' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);