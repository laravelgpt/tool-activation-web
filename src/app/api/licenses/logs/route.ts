import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getActivationLogs } from '@/lib/license';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get('licenseId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let userId = undefined;
    if (req.user!.role !== 'ADMIN') {
      userId = req.user!.userId;
    }

    const logs = await getActivationLogs(userId, licenseId, limit);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Activation logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activation logs' },
      { status: 500 }
    );
  }
});