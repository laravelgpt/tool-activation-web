import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { systemMonitor } from '@/lib/system-monitor';

async function handler(req: NextRequest) {
  try {
    const summary = systemMonitor.getSystemSummary();
    
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching system summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system summary' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);