import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sessionManager } from '@/lib/session-manager';
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'sessions-get', 10, 60);
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

    const userSessions = await sessionManager.getUserActiveSessions(session.user.id);
    
    return NextResponse.json({
      sessions: userSessions,
      securitySettings: sessionManager.getSecuritySettings()
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'sessions-terminate', 5, 60);
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

    const { sessionId, terminateAll } = await request.json();

    if (terminateAll) {
      const success = await sessionManager.terminateAllUserSessions(session.user.id);
      if (success) {
        return NextResponse.json({ message: 'All sessions terminated successfully' });
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
    console.error('Terminate sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}