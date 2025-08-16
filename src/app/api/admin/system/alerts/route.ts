import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { systemMonitor } from '@/lib/system-monitor';

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unresolvedOnly = searchParams.get('unresolvedOnly') === 'true';
    
    const alerts = systemMonitor.getAlerts(limit, unresolvedOnly);
    
    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system alerts' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);