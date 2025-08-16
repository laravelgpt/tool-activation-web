import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sessionManager } from '@/lib/session-manager';
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'sessions-settings-get', 10, 60);
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

    const settings = sessionManager.getSecuritySettings();
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get session settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'sessions-settings-update', 5, 60);
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

    const settings = await request.json();
    
    // Validate settings
    const validSettings = {
      maxConcurrentSessions: Math.max(1, Math.min(20, settings.maxConcurrentSessions || 5)),
      sessionTimeoutHours: Math.max(1, Math.min(168, settings.sessionTimeoutHours || 24)),
      rememberMeDays: Math.max(1, Math.min(365, settings.rememberMeDays || 30)),
      requireReauthAfterHours: Math.max(1, Math.min(168, settings.requireReauthAfterHours || 8)),
      suspiciousActivityThreshold: Math.max(1, Math.min(10, settings.suspiciousActivityThreshold || 5)),
      enableSessionMonitoring: Boolean(settings.enableSessionMonitoring),
      enableAutomaticLogout: Boolean(settings.enableAutomaticLogout)
    };

    await sessionManager.updateSecuritySettings(validSettings);
    
    return NextResponse.json({ 
      message: 'Session security settings updated successfully',
      settings: validSettings
    });
  } catch (error) {
    console.error('Update session settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}