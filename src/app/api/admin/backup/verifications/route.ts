import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { automatedBackupSystem } from '@/lib/automated-backup';

async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    
    const verifications = automatedBackupSystem.getVerifications(jobId || undefined);
    
    return NextResponse.json({
      success: true,
      data: verifications,
    });
  } catch (error) {
    console.error('Error fetching backup verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup verifications' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);