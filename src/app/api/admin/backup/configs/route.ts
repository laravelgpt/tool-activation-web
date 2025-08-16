import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { automatedBackupSystem } from '@/lib/automated-backup';

async function handler(req: NextRequest) {
  try {
    if (req.method === 'GET') {
      const configs = automatedBackupSystem.getConfigs();
      return NextResponse.json({
        success: true,
        data: configs,
      });
    } else if (req.method === 'POST') {
      const configData = await req.json();
      const newConfig = automatedBackupSystem.addConfig(configData);
      
      return NextResponse.json({
        success: true,
        data: newConfig,
      });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Error managing backup configs:', error);
    return NextResponse.json(
      { error: 'Failed to manage backup configs' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
export const POST = withAdminAuth(handler);