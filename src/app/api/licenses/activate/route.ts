import { NextRequest, NextResponse } from 'next/server';
import { activateLicense } from '@/lib/license';

export async function POST(request: NextRequest) {
  try {
    const { key, deviceInfo, ip } = await request.json();

    if (!key || !deviceInfo) {
      return NextResponse.json(
        { error: 'License key and device info are required' },
        { status: 400 }
      );
    }

    if (!deviceInfo.hwid) {
      return NextResponse.json(
        { error: 'HWID is required in device info' },
        { status: 400 }
      );
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const result = await activateLicense(
      key, 
      deviceInfo, 
      ip || clientIP
    );

    if (!result.valid) {
      return NextResponse.json(
        { 
          success: false, 
          reason: result.reason,
          message: `Activation failed: ${result.reason}`
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      license: {
        id: result.license.id,
        key: result.license.key,
        type: result.license.type,
        usageCount: result.license.usageCount,
        usageLimit: result.license.usageLimit,
        expiresAt: result.license.expiresAt,
      },
      message: 'License activated successfully'
    });
  } catch (error) {
    console.error('License activation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        reason: 'Internal server error',
        message: 'Activation failed due to server error'
      },
      { status: 500 }
    );
  }
}