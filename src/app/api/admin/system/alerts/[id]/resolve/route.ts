import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { systemMonitor } from '@/lib/system-monitor';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handler(req: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const { resolvedBy } = await req.json();
    
    if (!resolvedBy) {
      return NextResponse.json(
        { error: 'resolvedBy is required' },
        { status: 400 }
      );
    }
    
    systemMonitor.resolveAlert(id, resolvedBy);
    
    return NextResponse.json({
      success: true,
      message: 'Alert resolved successfully',
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(handler);