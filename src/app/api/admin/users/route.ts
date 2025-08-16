import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/lib/db';
import { AuditLogger } from '@/lib/audit-logger';

// Get all users (Admin only)
export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    await AuditLogger.logAdminAction(
      req.user.id,
      'VIEW_USERS',
      'USER',
      undefined,
      'Admin viewed all users',
      undefined,
      req
    );

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// Update user (Admin only)
export const PUT = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const { userId, name, role, isActive, credits } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get original user data for audit log
    const originalUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        isActive: true,
      },
    });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (credits !== undefined) updateData.credits = credits;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    // Log the admin action
    await AuditLogger.logAdminAction(
      req.user.id,
      'UPDATE_USER',
      'USER',
      userId,
      `Admin updated user ${originalUser?.email || userId}`,
      {
        originalData: originalUser,
        updatedData: updatedUser,
        changes: updateData,
      },
      req
    );

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
});