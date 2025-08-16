import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/audit-logger';
import { withAdminAuth } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit-logger';

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const daysToKeep = parseInt(searchParams.get('daysToKeep') || '90');
    
    // Get current user ID for audit logging
    const userId = req.headers.get('x-user-id') || 'unknown';
    
    const deletedCount = await auditLogger.cleanupOldLogs(daysToKeep);
    
    // Log the cleanup action
    await logAdminAction(
      userId,
      'CLEANUP_AUDIT_LOGS',
      'AUDIT_LOG',
      undefined,
      `Cleaned up ${deletedCount} old audit logs (kept ${daysToKeep} days)`,
      { daysToKeep, deletedCount },
      req
    );
    
    return NextResponse.json({ 
      message: `Successfully cleaned up ${deletedCount} old audit logs`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup audit logs' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(handler);