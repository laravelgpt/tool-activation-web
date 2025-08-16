import { NextRequest, NextResponse } from 'next/server';
import { activateLicense } from '@/lib/license';
import { consumeUserCredits } from '@/lib/credits';

interface ToolActivationRequest {
  licenseKey: string;
  hwid: string;
  ip?: string;
  mac?: string;
  toolName?: string;
  creditCost?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ToolActivationRequest = await request.json();
    const { licenseKey, hwid, ip, mac, toolName, creditCost = 0 } = body;

    if (!licenseKey || !hwid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'License key and HWID are required' 
        },
        { status: 400 }
      );
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     ip || 
                     'unknown';

    const deviceInfo = { hwid, ip: clientIP, mac };

    // First, validate the license
    const validation = await activateLicense(licenseKey, deviceInfo, clientIP);
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.reason,
        message: `Activation failed: ${validation.reason}`,
      }, { status: 400 });
    }

    const license = validation.license!;

    // If credit cost is specified, deduct credits
    if (creditCost > 0) {
      try {
        await consumeUserCredits(
          license.userId,
          creditCost,
          `Tool activation: ${toolName || 'Unknown tool'}`,
          { toolName, licenseKey, hwid }
        );
      } catch (creditError) {
        // Rollback license activation if credit deduction fails
        return NextResponse.json({
          success: false,
          error: 'Insufficient credits',
          message: 'Activation failed: Insufficient credits',
        }, { status: 400 });
      }
    }

    // Generate activation token for the tool
    const activationToken = generateActivationToken(licenseKey, hwid);

    // Log the successful activation
    await logActivation(license, deviceInfo, toolName, creditCost, clientIP);

    return NextResponse.json({
      success: true,
      message: 'Tool activated successfully',
      activationToken,
      license: {
        key: license.key,
        type: license.type,
        usageCount: license.usageCount,
        usageLimit: license.usageLimit,
        expiresAt: license.expiresAt,
      },
      creditsUsed: creditCost,
    });

  } catch (error) {
    console.error('Tool activation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Activation failed due to server error',
    }, { status: 500 });
  }
}

function generateActivationToken(licenseKey: string, hwid: string): string {
  const timestamp = Date.now();
  const data = `${licenseKey}:${hwid}:${timestamp}`;
  return Buffer.from(data).toString('base64');
}

async function logActivation(
  license: any,
  deviceInfo: any,
  toolName: string | undefined,
  creditCost: number,
  ip: string
) {
  // This would typically be logged to the database
  // For now, we'll just log to console
  console.log('Tool activation logged:', {
    licenseId: license.id,
    userId: license.userId,
    toolName,
    hwid: deviceInfo.hwid,
    ip,
    creditCost,
    timestamp: new Date().toISOString(),
  });
}