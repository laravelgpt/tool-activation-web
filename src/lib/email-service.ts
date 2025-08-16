import { db } from '@/lib/db';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationData {
  userId: string;
  type: 'WELCOME' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'TICKET_CREATED' | 'TICKET_UPDATED' | 'LICENSE_EXPIRING' | 'CREDIT_LOW' | 'REFERRAL_BONUS' | 'SECURITY_ALERT';
  data: Record<string, any>;
}

export class EmailService {
  private static instance: EmailService;
  private enabled: boolean;

  constructor() {
    // Check if email service is enabled via environment variables
    this.enabled = process.env.EMAIL_SERVICE_ENABLED === 'true';
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    if (!this.enabled) {
      console.log('Email service disabled. Would send:', template);
      return true;
    }

    try {
      // In a real implementation, you would integrate with email services like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Nodemailer with SMTP
      
      console.log('Sending email:', {
        to: template.to,
        subject: template.subject,
        htmlLength: template.html.length,
      });

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const user = await db.user.findUnique({
        where: { id: data.userId },
        select: { email: true, name: true },
      });

      if (!user) {
        console.error('User not found for notification:', data.userId);
        return false;
      }

      const template = this.generateEmailTemplate(data.type, user, data.data);
      return await this.sendEmail(template);
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  private generateEmailTemplate(type: string, user: { email: string; name?: string }, data: Record<string, any>): EmailTemplate {
    const userName = user.name || user.email.split('@')[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    switch (type) {
      case 'WELCOME':
        return {
          to: user.email,
          subject: 'Welcome to Unlocking Tool System!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Unlocking Tool System!</h2>
              <p>Hi ${userName},</p>
              <p>Thank you for joining our platform. We're excited to have you on board!</p>
              <p>Get started by:</p>
              <ul>
                <li>Exploring our <a href="${appUrl}/dashboard" style="color: #007bff;">dashboard</a></li>
                <li>Purchasing credits to unlock tools</li>
                <li>Checking out our available tools</li>
              </ul>
              <p>If you have any questions, don't hesitate to contact our support team.</p>
              <p>Best regards,<br>The Unlocking Tool Team</p>
            </div>
          `,
        };

      case 'PAYMENT_SUCCESS':
        return {
          to: user.email,
          subject: 'Payment Successful - Credits Added!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">Payment Successful!</h2>
              <p>Hi ${userName},</p>
              <p>Your payment of <strong>$${data.amount}</strong> has been processed successfully.</p>
              <p><strong>${data.creditsAdded} credits</strong> have been added to your account.</p>
              <p>Your current balance: <strong>${data.currentBalance} credits</strong></p>
              <p>You can now use these credits to unlock our tools and services.</p>
              <a href="${appUrl}/dashboard" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
              <p>Thank you for your business!</p>
            </div>
          `,
        };

      case 'PAYMENT_FAILED':
        return {
          to: user.email,
          subject: 'Payment Failed - Please Try Again',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">Payment Failed</h2>
              <p>Hi ${userName},</p>
              <p>We encountered an issue processing your payment of <strong>$${data.amount}</strong>.</p>
              <p><strong>Reason:</strong> ${data.reason || 'Unknown error'}</p>
              <p>Please try again or contact our support team if the problem persists.</p>
              <a href="${appUrl}/dashboard?tab=credits" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Try Again</a>
              <p>We apologize for the inconvenience.</p>
            </div>
          `,
        };

      case 'TICKET_CREATED':
        return {
          to: user.email,
          subject: `Support Ticket Created - #${data.ticketId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #007bff;">Support Ticket Created</h2>
              <p>Hi ${userName},</p>
              <p>Your support ticket has been created successfully.</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Ticket ID:</strong> #${data.ticketId}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Priority:</strong> ${data.priority}</p>
                <p><strong>Status:</strong> ${data.status}</p>
              </div>
              <p>Our support team will review your ticket and respond as soon as possible.</p>
              <a href="${appUrl}/dashboard?tab=support" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Ticket</a>
            </div>
          `,
        };

      case 'TICKET_UPDATED':
        return {
          to: user.email,
          subject: `Support Ticket Updated - #${data.ticketId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #007bff;">Support Ticket Updated</h2>
              <p>Hi ${userName},</p>
              <p>Your support ticket <strong>#${data.ticketId}</strong> has been updated.</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Updated by:</strong> ${data.updatedBy}</p>
                ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
              </div>
              <a href="${appUrl}/dashboard?tab=support" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Ticket</a>
            </div>
          `,
        };

      case 'LICENSE_EXPIRING':
        return {
          to: user.email,
          subject: 'License Expiring Soon',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ffc107;">License Expiring Soon</h2>
              <p>Hi ${userName},</p>
              <p>Your license is expiring soon. Here are the details:</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>License Key:</strong> ${data.licenseKey}</p>
                <p><strong>Type:</strong> ${data.licenseType}</p>
                <p><strong>Expires:</strong> ${data.expiresAt}</p>
                <p><strong>Days Remaining:</strong> ${data.daysRemaining}</p>
              </div>
              <p>Renew your license to continue using our services without interruption.</p>
              <a href="${appUrl}/dashboard?tab=licenses" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Renew License</a>
            </div>
          `,
        };

      case 'CREDIT_LOW':
        return {
          to: user.email,
          subject: 'Low Credits Warning',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ffc107;">Low Credits Warning</h2>
              <p>Hi ${userName},</p>
              <p>Your credit balance is running low. Here's your current status:</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Current Balance:</strong> ${data.currentBalance} credits</p>
                <p><strong>Threshold:</strong> ${data.threshold} credits</p>
              </div>
              <p>Top up your credits to continue using our services without interruption.</p>
              <a href="${appUrl}/dashboard?tab=credits" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Buy Credits</a>
            </div>
          `,
        };

      case 'REFERRAL_BONUS':
        return {
          to: user.email,
          subject: 'Referral Bonus Received!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">Referral Bonus Received!</h2>
              <p>Hi ${userName},</p>
              <p>Congratulations! You've earned a referral bonus.</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Bonus Credits:</strong> ${data.bonusCredits}</p>
                <p><strong>Referred User:</strong> ${data.referredUser}</p>
                <p><strong>Your New Balance:</strong> ${data.newBalance} credits</p>
              </div>
              <p>Thank you for referring new users to our platform!</p>
              <a href="${appUrl}/dashboard?tab=credits" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Balance</a>
            </div>
          `,
        };

      case 'SECURITY_ALERT':
        return {
          to: user.email,
          subject: 'Security Alert - Account Activity',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">Security Alert</h2>
              <p>Hi ${userName},</p>
              <p>We detected unusual activity on your account:</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Activity:</strong> ${data.activity}</p>
                <p><strong>IP Address:</strong> ${data.ip}</p>
                <p><strong>Time:</strong> ${data.timestamp}</p>
                <p><strong>Location:</strong> ${data.location || 'Unknown'}</p>
              </div>
              <p>If this wasn't you, please secure your account immediately:</p>
              <ul>
                <li>Change your password</li>
                <li>Enable two-factor authentication if available</li>
                <li>Contact our support team</li>
              </ul>
              <a href="${appUrl}/dashboard?tab=profile" style="display: inline-block; background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Secure Account</a>
            </div>
          `,
        };

      default:
        return {
          to: user.email,
          subject: 'Notification from Unlocking Tool System',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Notification</h2>
              <p>Hi ${userName},</p>
              <p>You have a new notification from our system.</p>
              <a href="${appUrl}/dashboard" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
            </div>
          `,
        };
    }
  }

  async sendWelcomeEmail(userId: string): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'WELCOME',
      data: {},
    });
  }

  async sendPaymentSuccessEmail(userId: string, amount: number, creditsAdded: number, currentBalance: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'PAYMENT_SUCCESS',
      data: { amount, creditsAdded, currentBalance },
    });
  }

  async sendPaymentFailedEmail(userId: string, amount: number, reason: string): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'PAYMENT_FAILED',
      data: { amount, reason },
    });
  }

  async sendTicketCreatedEmail(userId: string, ticketId: string, subject: string, priority: string, status: string): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'TICKET_CREATED',
      data: { ticketId, subject, priority, status },
    });
  }

  async sendTicketUpdatedEmail(userId: string, ticketId: string, status: string, updatedBy: string, message?: string): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'TICKET_UPDATED',
      data: { ticketId, status, updatedBy, message },
    });
  }

  async sendLicenseExpiringEmail(userId: string, licenseKey: string, licenseType: string, expiresAt: string, daysRemaining: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'LICENSE_EXPIRING',
      data: { licenseKey, licenseType, expiresAt, daysRemaining },
    });
  }

  async sendLowCreditsEmail(userId: string, currentBalance: number, threshold: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'CREDIT_LOW',
      data: { currentBalance, threshold },
    });
  }

  async sendReferralBonusEmail(userId: string, bonusCredits: number, referredUser: string, newBalance: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'REFERRAL_BONUS',
      data: { bonusCredits, referredUser, newBalance },
    });
  }

  async sendSecurityAlertEmail(userId: string, activity: string, ip: string, timestamp: string, location?: string): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: 'SECURITY_ALERT',
      data: { activity, ip, timestamp, location },
    });
  }
}

export const emailService = EmailService.getInstance();