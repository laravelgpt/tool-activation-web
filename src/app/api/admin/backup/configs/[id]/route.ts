import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { automatedBackupSystem } from '@/lib/automated-backup';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handler(req: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    if (req.method === 'PUT') {
      const updates = await req.json();
      const updatedConfig = automatedBackupSystem.updateConfig(id, updates);
      
      if (!updatedConfig) {
        return NextResponse.json(
          { error: 'Backup config not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: updatedConfig,
      });
    } else if (req.method === 'DELETE') {
      const deleted = automatedBackupSystem.deleteConfig(id);
      
      if (!deleted) {
        return NextResponse.json(
          { error: 'Backup config not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Backup config deleted successfully',
      });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Error managing backup config:', error);
    return NextResponse.json(
      { error: 'Failed to manage backup config' },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(handler);
export const DELETE = withAdminAuth(handler);