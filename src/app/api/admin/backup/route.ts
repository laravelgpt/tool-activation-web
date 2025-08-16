import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup';
import { authRateLimit } from '@/lib/rate-limit-middleware';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get the authorization header to verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Get user ID from header (set by middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create backup
    const backup = await BackupService.createBackup(userId);

    return NextResponse.json({
      message: 'Backup created successfully',
      backup: {
        id: backup.id,
        timestamp: backup.timestamp,
        size: backup.size,
        formattedSize: BackupService.formatFileSize(backup.size),
        checksum: backup.checksum,
        formattedDate: BackupService.formatDate(backup.timestamp)
      }
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create backup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get the authorization header to verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Get user ID from header (set by middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get list of backups
    const backups = await BackupService.getBackupList();

    return NextResponse.json({
      backups: backups.map(backup => ({
        ...backup,
        formattedSize: BackupService.formatFileSize(backup.size),
        formattedDate: BackupService.formatDate(backup.timestamp)
      }))
    });
  } catch (error) {
    console.error('Backup list error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}