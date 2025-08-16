import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { automatedBackupSystem } from '@/lib/automated-backup';

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const configId = searchParams.get('configId');
    
    const jobs = automatedBackupSystem.getJobs(configId || undefined);
    
    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching backup jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup jobs' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);