import { NextRequest, NextResponse } from 'next/server';
import { validateLicense } from '@/lib/license';

interface ToolVerificationRequest {
  licenseKey: string;
  hwid: string;
  activationToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ToolVerificationRequest = await request.json();
    const { licenseKey, hwid, activationToken } = body;

    if (!licenseKey || !hwid) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'License key and HWID are required' 
        },
        { status: 400 }
      );
    }

    const deviceInfo = { hwid };

    // Validate the license
    const validation = await validateLicense(licenseKey, deviceInfo);

    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        error: validation.reason,
        message: `Verification failed: ${validation.reason}`,
      });
    }

    // Verify activation token if provided
    if (activationToken) {
      const tokenValid = verifyActivationToken(activationToken, licenseKey, hwid);
      if (!tokenValid) {
        return NextResponse.json({
          valid: false,
          error: 'Invalid activation token',
          message: 'Verification failed: Invalid activation token',
        });
      }
    }

    const license = validation.license!;

    return NextResponse.json({
      valid: true,
      message: 'License verified successfully',
      license: {
        key: license.key,
        type: license.type,
        usageCount: license.usageCount,
        usageLimit: license.usageLimit,
        expiresAt: license.expiresAt,
        active: license.active,
      },
    });

  } catch (error) {
    console.error('Tool verification error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Internal server error',
      message: 'Verification failed due to server error',
    }, { status: 500 });
  }
}

function verifyActivationToken(token: string, licenseKey: string, hwid: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [tokenLicenseKey, tokenHwid, timestamp] = decoded.split(':');
    
    // Check if token components match
    if (tokenLicenseKey !== licenseKey || tokenHwid !== hwid) {
      return false;
    }

    // Check if token is not too old (24 hours)
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return (now - tokenTime) <= maxAge;
  } catch (error) {
    return false;
  }
}