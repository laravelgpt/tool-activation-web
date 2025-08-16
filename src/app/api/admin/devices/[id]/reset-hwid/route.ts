import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// Reset device HWID (Admin only)
export const POST = withAdminAuth(async (req: AuthenticatedRequest, context: RouteParams) => {
  try {
    const { id } = context.params;

    // Get the current device
    const device = await db.device.findUnique({
      where: { id },
      include: {
        licenses: true,
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Generate a new HWID
    const newHwid = `RESET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update the device with new HWID
    const updatedDevice = await db.device.update({
      where: { id },
      data: {
        hwid: newHwid,
        isActive: false, // Deactivate the device after HWID reset
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Deactivate all licenses associated with this device
    if (device.licenses.length > 0) {
      await db.license.updateMany({
        where: {
          deviceId: id,
          active: true,
        },
        data: {
          active: false,
        },
      });
    }

    return NextResponse.json({ 
      message: 'HWID reset successfully',
      device: updatedDevice 
    });
  } catch (error) {
    console.error('HWID reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset HWID' },
      { status: 500 }
    );
  }
});