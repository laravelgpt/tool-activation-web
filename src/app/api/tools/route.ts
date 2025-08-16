import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getTools, createTool, getToolCategories } from '@/lib/tool';

// Get tools (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    if (searchParams.get('categories') === 'true') {
      const categories = await getToolCategories();
      return NextResponse.json({ categories });
    }

    const tools = await getTools(category || undefined, activeOnly);
    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Tools fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// Create tool (Admin only)
export const POST = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const { name, description, category, version, downloadUrl, price, features, requirements } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    const tool = await createTool({
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
      message: 'Tool created successfully',
    });
  } catch (error) {
    console.error('Tool creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
});