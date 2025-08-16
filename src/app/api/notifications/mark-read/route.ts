import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth } from '@/lib/middleware';

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { notificationIds, markAll } = await req.json();

    if (markAll) {
      // Mark all notifications as read for the user
      await db.notification.updateMany({
        where: {
          userId: req.user!.userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        message: 'All notifications marked as read',
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Notification IDs are required' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    await db.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: req.user!.userId,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      message: 'Notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
});