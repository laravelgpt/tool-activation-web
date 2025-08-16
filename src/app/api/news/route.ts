import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';

const createNewsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  imageUrl: z.string().url().optional(),
  isPublished: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
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
    const validatedData = createNewsSchema.parse(body);

    // Create news article
    const news = await db.news.create({
      data: validatedData,
    });

    return NextResponse.json({
      news: {
        id: news.id,
        title: news.title,
        excerpt: news.excerpt,
        imageUrl: news.imageUrl,
        isPublished: news.isPublished,
        createdAt: news.createdAt,
      },
    });
  } catch (error) {
    console.error('News creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const publishedOnly = searchParams.get('published') !== 'false';

    const whereClause: any = {};
    if (publishedOnly) {
      whereClause.isPublished = true;
    }

    const news = await db.news.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.news.count({
      where: whereClause,
    });

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}