import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';

const updateNewsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long').optional(),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  imageUrl: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateNewsSchema.parse(body);

    // Check if news exists
    const existingNews = await db.news.findUnique({
      where: { id: params.id },
    });

    if (!existingNews) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Update news
    const updatedNews = await db.news.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({
      news: {
        id: updatedNews.id,
        title: updatedNews.title,
        excerpt: updatedNews.excerpt,
        imageUrl: updatedNews.imageUrl,
        isPublished: updatedNews.isPublished,
        updatedAt: updatedNews.updatedAt,
      },
    });
  } catch (error) {
    console.error('News update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if news exists
    const existingNews = await db.news.findUnique({
      where: { id: params.id },
    });

    if (!existingNews) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Delete news
    await db.news.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'News deleted successfully',
    });
  } catch (error) {
    console.error('News deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}