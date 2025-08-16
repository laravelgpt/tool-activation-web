import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { automatedBackupSystem } from '@/lib/automated-backup';

async function handler(req: NextRequest) {
  try {
    const stats = automatedBackupSystem.getBackupStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching backup stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup stats' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);