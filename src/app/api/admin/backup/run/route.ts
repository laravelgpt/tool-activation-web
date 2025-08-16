import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { automatedBackupSystem } from '@/lib/automated-backup';

async function handler(req: NextRequest) {
  try {
    const { configId } = await req.json();
    
    if (!configId) {
      return NextResponse.json(
        { error: 'configId is required' },
        { status: 400 }
      );
    }
    
    const job = await automatedBackupSystem.runBackupNow(configId);
    
    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error running backup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run backup' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(handler);