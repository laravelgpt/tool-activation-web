import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';

const createReplySchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
});

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assignedTo: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const validatedData = createReplySchema.parse(body);

    // Check if ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create reply as staff
    const reply = await db.ticketReply.create({
      data: {
        ticketId: params.id,
        userId: payload.userId,
        message: validatedData.message,
        isStaff: true,
      },
    });

    return NextResponse.json({
      reply: {
        id: reply.id,
        message: reply.message,
        isStaff: reply.isStaff,
        createdAt: reply.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin reply creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const validatedData = updateTicketSchema.parse(body);

    // Check if ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Update ticket
    const updatedTicket = await db.ticket.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({
      ticket: {
        id: updatedTicket.id,
        status: updatedTicket.status,
        assignedTo: updatedTicket.assignedTo,
        updatedAt: updatedTicket.updatedAt,
      },
    });
  } catch (error) {
    console.error('Ticket update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}