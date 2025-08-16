import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ToolStatusRequest {
  licenseKey: string;
  hwid: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ToolStatusRequest = await request.json();
    const { licenseKey, hwid } = body;

    if (!licenseKey || !hwid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'License key and HWID are required' 
        },
        { status: 400 }
      );
    }

    // Get license details
    const license = await db.license.findUnique({
      where: { key: licenseKey },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            credits: true,
          },
        },
      },
    });

    if (!license) {
      return NextResponse.json({
        success: false,
        error: 'License not found',
        message: 'Status check failed: License not found',
      }, { status: 404 });
    }

    // Check if license is active and valid
    const isActive = license.active && 
                    (!license.expiresAt || new Date() < license.expiresAt) &&
                    (license.usageLimit === 0 || license.usageCount < license.usageLimit);

    // Check device binding
    let deviceBound = false;
    if (license.deviceInfo && typeof license.deviceInfo === 'object') {
      const deviceInfo = license.deviceInfo as any;
      deviceBound = deviceInfo.hwid === hwid;
    }

    // Get recent activation logs for this license and device
    const recentActivations = await db.activationLog.findMany({
      where: {
        licenseId: license.id,
        hwid,
        result: 'SUCCESS',
      },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      license: {
        key: license.key,
        type: license.type,
        active: license.active,
        isActive,
        deviceBound,
        usageCount: license.usageCount,
        usageLimit: license.usageLimit,
        expiresAt: license.expiresAt,
        lastUsedAt: license.lastUsedAt,
      },
      user: {
        id: license.user.id,
        email: license.user.email,
        credits: license.user.credits,
      },
      recentActivations: recentActivations.map(log => ({
        timestamp: log.timestamp,
        action: log.action,
        result: log.result,
        creditUsed: log.creditUsed,
      })),
    });

  } catch (error) {
    console.error('Tool status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Status check failed due to server error',
    }, { status: 500 });
  }
}