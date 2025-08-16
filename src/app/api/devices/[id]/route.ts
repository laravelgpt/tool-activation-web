import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { deactivateDevice, activateDevice, deleteDevice, isDeviceOwnedByUser } from '@/lib/device';

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const { id } = params;
    const { action } = await req.json();

    if (!action || !['activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required (activate/deactivate)' },
        { status: 400 }
      );
    }

    // Check if device belongs to user
    const isOwner = await isDeviceOwnedByUser(id, req.user!.userId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    let device;
    if (action === 'activate') {
      device = await activateDevice(id);
    } else {
      device = await deactivateDevice(id);
    }

    return NextResponse.json({
      success: true,
      device,
      message: `Device ${action}d successfully`,
    });
  } catch (error) {
    console.error('Device update error:', error);
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const { id } = params;

    // Check if device belongs to user
    const isOwner = await isDeviceOwnedByUser(id, req.user!.userId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await deleteDevice(id);

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully',
    });
  } catch (error) {
    console.error('Device deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete device' },
      { status: 500 }
    );
  }
});