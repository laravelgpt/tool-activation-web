import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/audit-logger';
import { withAdminAuth } from '@/lib/middleware';
import { logAdminAction } from '@/lib/audit-logger';

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get('format') as 'json' | 'csv') || 'json';
    
    // Get current user ID for audit logging
    const userId = req.headers.get('x-user-id') || 'unknown';
    
    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      severity: searchParams.get('severity') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: 10000, // Higher limit for exports
      offset: 0,
    };

    const exportData = await auditLogger.exportLogs(filters, format);
    
    // Log the export action
    await logAdminAction(
      userId,
      'EXPORT_AUDIT_LOGS',
      'AUDIT_LOG',
      undefined,
      `Exported audit logs in ${format.toUpperCase()} format`,
      { format, filters },
      req
    );
    
    return new NextResponse(exportData, {
      headers: {
        'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs.${format}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to export audit logs' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);