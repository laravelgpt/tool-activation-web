import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/lib/db';
import { AuditLogger } from '@/lib/audit-logger';

// Get all devices (Admin only)
export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    await AuditLogger.logAdminAction(
      req.user.id,
      'VIEW_DEVICES',
      'DEVICE',
      undefined,
      'Admin viewed all devices',
      undefined,
      req
    );

    const devices = await db.device.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Devices fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
});