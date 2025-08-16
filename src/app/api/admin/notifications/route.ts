import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';

const sendNotificationSchema = z.object({
  type: z.enum(['WELCOME', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'TICKET_CREATED', 'TICKET_UPDATED', 'LICENSE_EXPIRING', 'CREDIT_LOW', 'REFERRAL_BONUS', 'SECURITY_ALERT']),
  data: z.record(z.any()),
  userId: z.string().optional(),
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
    const validatedData = sendNotificationSchema.parse(body);

    // If no userId provided, use the admin's userId for testing
    const userId = validatedData.userId || payload.userId;

    let success = false;
    
    switch (validatedData.type) {
      case 'WELCOME':
        success = await emailService.sendWelcomeEmail(userId);
        break;
      case 'PAYMENT_SUCCESS':
        success = await emailService.sendPaymentSuccessEmail(
          userId,
          validatedData.data.amount || 10,
          validatedData.data.creditsAdded || 10,
          validatedData.data.currentBalance || 10
        );
        break;
      case 'PAYMENT_FAILED':
        success = await emailService.sendPaymentFailedEmail(
          userId,
          validatedData.data.amount || 10,
          validatedData.data.reason || 'Unknown error'
        );
        break;
      case 'TICKET_CREATED':
        success = await emailService.sendTicketCreatedEmail(
          userId,
          validatedData.data.ticketId || 'TICKET-001',
          validatedData.data.subject || 'Test Subject',
          validatedData.data.priority || 'MEDIUM',
          validatedData.data.status || 'OPEN'
        );
        break;
      case 'TICKET_UPDATED':
        success = await emailService.sendTicketUpdatedEmail(
          userId,
          validatedData.data.ticketId || 'TICKET-001',
          validatedData.data.status || 'IN_PROGRESS',
          validatedData.data.updatedBy || 'Support Team',
          validatedData.data.message
        );
        break;
      case 'LICENSE_EXPIRING':
        success = await emailService.sendLicenseExpiringEmail(
          userId,
          validatedData.data.licenseKey || 'LICENSE-001',
          validatedData.data.licenseType || 'STANDARD',
          validatedData.data.expiresAt || new Date().toISOString(),
          validatedData.data.daysRemaining || 7
        );
        break;
      case 'CREDIT_LOW':
        success = await emailService.sendLowCreditsEmail(
          userId,
          validatedData.data.currentBalance || 5,
          validatedData.data.threshold || 10
        );
        break;
      case 'REFERRAL_BONUS':
        success = await emailService.sendReferralBonusEmail(
          userId,
          validatedData.data.bonusCredits || 5,
          validatedData.data.referredUser || 'user@example.com',
          validatedData.data.newBalance || 15
        );
        break;
      case 'SECURITY_ALERT':
        success = await emailService.sendSecurityAlertEmail(
          userId,
          validatedData.data.activity || 'Login attempt',
          validatedData.data.ip || '192.168.1.1',
          validatedData.data.timestamp || new Date().toISOString(),
          validatedData.data.location
        );
        break;
    }

    if (success) {
      return NextResponse.json({
        message: 'Notification sent successfully',
        type: validatedData.type,
        userId,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notification send error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}