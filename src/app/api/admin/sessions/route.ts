import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sessionManager } from '@/lib/session-manager';
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'admin-sessions-get', 10, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cleanup = searchParams.get('cleanup') === 'true';

    if (cleanup) {
      const cleanedCount = await sessionManager.cleanupExpiredSessions();
      return NextResponse.json({ 
        message: 'Expired sessions cleaned up',
        cleanedCount 
      });
    }

    let sessions;
    if (userId) {
      sessions = await sessionManager.getUserActiveSessions(userId);
    } else {
      sessions = await sessionManager.getAllActiveSessions();
    }
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Admin get sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'admin-sessions-terminate', 5, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { sessionId, userId, terminateAll } = await request.json();

    if (terminateAll && userId) {
      const success = await sessionManager.terminateAllUserSessions(userId);
      if (success) {
        return NextResponse.json({ message: 'All user sessions terminated successfully' });
      }
    } else if (sessionId) {
      const success = await sessionManager.terminateSession(sessionId);
      if (success) {
        return NextResponse.json({ message: 'Session terminated successfully' });
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to terminate session(s)' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Admin terminate sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}