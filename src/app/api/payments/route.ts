import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { emailService } from '@/lib/email-service';
import { z } from 'zod';

const createPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['STRIPE', 'PAYPAL', 'CRYPTOCURRENCY', 'BANK_TRANSFER', 'MANUAL']),
  currency: z.string().default('USD'),
  metadata: z.object({}).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
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
    const validatedData = createPaymentSchema.parse(body);

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: payload.userId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        method: validatedData.method,
        status: 'PENDING',
        metadata: validatedData.metadata || {},
      },
    });

    // For now, we'll simulate payment processing
    // In a real implementation, you would integrate with payment providers
    let paymentStatus: 'COMPLETED' | 'FAILED' = 'COMPLETED';
    let transactionId: string | undefined = `sim_${Date.now()}`;

    // Simulate some payment methods failing for demo purposes
    if (validatedData.method === 'CRYPTOCURRENCY' && Math.random() < 0.3) {
      paymentStatus = 'FAILED';
      transactionId = undefined;
    }

    // Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        transactionId,
      },
    });

    // If payment is successful, add credits to user
    if (paymentStatus === 'COMPLETED') {
      const creditsToAdd = validatedData.amount; // 1 unit = 1 credit for now
      
      const updatedUser = await db.user.update({
        where: { id: payload.userId },
        data: {
          credits: {
            increment: creditsToAdd,
          },
        },
      });

      // Create credit transaction
      await db.creditTransaction.create({
        data: {
          userId: payload.userId,
          amount: creditsToAdd,
          type: 'PURCHASE',
          description: `Payment via ${validatedData.method}`,
          metadata: {
            paymentId: payment.id,
            method: validatedData.method,
          },
        },
      });

      // Send payment success email
      await emailService.sendPaymentSuccessEmail(
        payload.userId,
        validatedData.amount,
        creditsToAdd,
        updatedUser.credits
      );
    } else {
      // Send payment failed email
      await emailService.sendPaymentFailedEmail(
        payload.userId,
        validatedData.amount,
        'Payment processing failed'
      );
    }

    return NextResponse.json({
      payment: updatedPayment,
      creditsAdded: paymentStatus === 'COMPLETED' ? validatedData.amount : 0,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const payments = await db.payment.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.payment.count({
      where: { userId: payload.userId },
    });

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}