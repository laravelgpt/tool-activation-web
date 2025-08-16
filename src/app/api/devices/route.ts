import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getUserDevices, registerDevice } from '@/lib/device';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const devices = await getUserDevices(req.user!.userId);
    return NextResponse.json({ devices });
  } catch (error) {
    console.error('Devices fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { hwid, name, ip, mac, deviceInfo } = await req.json();

    if (!hwid) {
      return NextResponse.json(
        { error: 'HWID is required' },
        { status: 400 }
      );
    }

    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const device = await registerDevice(req.user!.userId, {
      hwid,
      name,
      ip: ip || clientIP,
      mac,
      deviceInfo,
    });

    return NextResponse.json({
      success: true,
      device,
      message: 'Device registered successfully',
    });
  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
});