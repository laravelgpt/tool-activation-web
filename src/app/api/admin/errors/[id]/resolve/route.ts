import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorTracker } from '@/lib/error-tracker';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { resolution } = body;

    if (!resolution) {
      return NextResponse.json({ error: 'Resolution is required' }, { status: 400 });
    }

    await errorTracker.resolveError(params.id, session.user.id, resolution);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve error' },
      { status: 500 }
    );
  }
}