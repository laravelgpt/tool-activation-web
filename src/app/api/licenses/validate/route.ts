import { NextRequest, NextResponse } from 'next/server';
import { validateLicense } from '@/lib/license';

export async function POST(request: NextRequest) {
  try {
    const { key, deviceInfo } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'License key is required' },
        { status: 400 }
      );
    }

    const result = await validateLicense(key, deviceInfo);

    return NextResponse.json({
      valid: result.valid,
      reason: result.reason,
      license: result.license ? {
        id: result.license.id,
        key: result.license.key,
        type: result.license.type,
        usageCount: result.license.usageCount,
        usageLimit: result.license.usageLimit,
        expiresAt: result.license.expiresAt,
        active: result.license.active,
      } : null,
    });
  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json(
      { 
        valid: false, 
        reason: 'Internal server error'
      },
      { status: 500 }
    );
  }
}