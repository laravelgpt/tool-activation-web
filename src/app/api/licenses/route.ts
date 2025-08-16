import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { createLicense, getUserLicenses, getLicenseByKey, deactivateLicense } from '@/lib/license';

// Create a new license (Admin only)
export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const { userId, type, deviceInfo, expiresAt, usageLimit } = await req.json();

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      );
    }

    const license = await createLicense({
      userId,
      type,
      deviceInfo,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      usageLimit,
    });

    return NextResponse.json({ license });
  } catch (error) {
    console.error('License creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create license' },
      { status: 500 }
    );
  }
});

// Get licenses (Admin can see all, users can see their own)
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      // Get specific license by key
      const license = await getLicenseByKey(key);
      if (!license) {
        return NextResponse.json(
          { error: 'License not found' },
          { status: 404 }
        );
      }

      // Users can only see their own licenses
      if (req.user!.role !== 'ADMIN' && license.userId !== req.user!.userId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({ license });
    } else {
      // Get user's licenses
      const licenses = await getUserLicenses(req.user!.userId);
      return NextResponse.json({ licenses });
    }
  } catch (error) {
    console.error('License fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
});

// Deactivate license (Admin only)
export const DELETE = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'License key is required' },
        { status: 400 }
      );
    }

    const result = await deactivateLicense(key);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.reason },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'License deactivated successfully' });
  } catch (error) {
    console.error('License deactivation error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate license' },
      { status: 500 }
    );
  }
});