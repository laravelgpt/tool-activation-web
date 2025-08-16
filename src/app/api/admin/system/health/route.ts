import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { systemMonitor } from '@/lib/system-monitor';

async function handler(req: NextRequest) {
  try {
    const healthStatus = systemMonitor.getHealthStatus();
    
    return NextResponse.json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);