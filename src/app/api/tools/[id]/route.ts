import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getToolById, updateTool, deleteTool } from '@/lib/tool';

export const GET = withAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const { id } = params;
    const tool = await getToolById(id);

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tool });
  } catch (error) {
    console.error('Tool fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
});

export const PUT = withAdminAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const { id } = params;
    const { name, description, category, version, downloadUrl, price, features, requirements, isActive } = await req.json();

    const tool = await updateTool(id, {
      name,
      description,
      category,
      version,
      downloadUrl,
      price,
      features,
      requirements,
    });

    return NextResponse.json({
      success: true,
      tool,
      message: 'Tool updated successfully',
    });
  } catch (error) {
    console.error('Tool update error:', error);
    return NextResponse.json(
      { error: 'Failed to update tool' },
      { status: 500 }
    );
  }
});

export const DELETE = withAdminAuth(async (req: AuthenticatedRequest, { params }) => {
  try {
    const { id } = params;
    await deleteTool(id);

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully',
    });
  } catch (error) {
    console.error('Tool deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    );
  }
});