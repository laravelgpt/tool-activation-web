import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getDownloads, createDownload } from '@/lib/download';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const toolId = searchParams.get('toolId');

    const downloads = await getDownloads(toolId || undefined);
    return NextResponse.json({ downloads });
  } catch (error) {
    console.error('Downloads fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const { toolId, version, fileName, fileSize, downloadUrl } = await req.json();

    if (!toolId || !version || !fileName || !downloadUrl) {
      return NextResponse.json(
        { error: 'toolId, version, fileName, and downloadUrl are required' },
        { status: 400 }
      );
    }

    const download = await createDownload({
      toolId,
      version,
      fileName,
      fileSize,
      downloadUrl,
    });

    return NextResponse.json({
      success: true,
      download,
      message: 'Download created successfully',
    });
  } catch (error) {
    console.error('Download creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create download' },
      { status: 500 }
    );
  }
});