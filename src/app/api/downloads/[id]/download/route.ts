import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getDownloadById, incrementDownloadCount } from '@/lib/download';
import { useCredits } from '@/lib/credits';

export const POST = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const { id } = params;
    
    const download = await getDownloadById(id);
    if (!download) {
      return NextResponse.json(
        { error: 'Download not found' },
        { status: 404 }
      );
    }

    if (!download.isActive) {
      return NextResponse.json(
        { error: 'Download is not active' },
        { status: 400 }
      );
    }

    // Check if tool has a price and deduct credits
    if (download.tool.price > 0) {
      try {
        await useCredits(
          req.user!.userId,
          download.tool.price,
          `Download: ${download.fileName}`,
          { downloadId: id, toolId: download.tool.id }
        );
      } catch (creditError) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            required: download.tool.price,
            message: `You need ${download.tool.price} credits to download this tool`
          },
          { status: 400 }
        );
      }
    }

    // Increment download count
    await incrementDownloadCount(id);

    return NextResponse.json({
      success: true,
      downloadUrl: download.downloadUrl,
      fileName: download.fileName,
      fileSize: download.fileSize,
      creditsUsed: download.tool.price || 0,
      message: 'Download started successfully',
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
});