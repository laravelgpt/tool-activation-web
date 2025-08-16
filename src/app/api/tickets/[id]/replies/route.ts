import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { emailService } from '@/lib/email-service';
import { z } from 'zod';

const createReplySchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createReplySchema.parse(body);

    // Check if ticket exists and belongs to user
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== payload.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create reply
    const reply = await db.ticketReply.create({
      data: {
        ticketId: params.id,
        userId: payload.userId,
        message: validatedData.message,
        isStaff: false,
      },
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    let updatedStatus = ticket.status;
    if (ticket.status === 'OPEN') {
      await db.ticket.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      });
      updatedStatus = 'IN_PROGRESS';
    }

    // Send ticket update email
    await emailService.sendTicketUpdatedEmail(
      payload.userId,
      params.id,
      updatedStatus,
      'You',
      validatedData.message
    );

    return NextResponse.json({
      reply: {
        id: reply.id,
        message: reply.message,
        isStaff: reply.isStaff,
        createdAt: reply.createdAt,
      },
    });
  } catch (error) {
    console.error('Reply creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if ticket exists and belongs to user
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== payload.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const replies = await db.ticketReply.findMany({
      where: { ticketId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Replies fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}