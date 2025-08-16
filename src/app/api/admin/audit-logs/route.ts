import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/audit-logger';
import { withAuth, withAdminAuth } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit-logger';

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      severity: searchParams.get('severity') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = await auditLogger.getLogs(filters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);