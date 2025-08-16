import { db } from '@/lib/db';
import { headers } from 'next/headers';

export interface ActivityLogData {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export async function logUserActivity(data: ActivityLogData) {
  try {
    // Get request headers for IP and User-Agent
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await db.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        description: data.description,
        metadata: data.metadata,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log user activity:', error);
    // Don't throw error to avoid disrupting the main operation
  }
}

export async function getUserActivityLogs(userId: string, limit = 50, offset = 0) {
  try {
    const logs = await db.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.activityLog.count({
      where: { userId },
    });

    return {
      logs,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Failed to fetch user activity logs:', error);
    return {
      logs: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }
}

export async function getSystemActivityLogs(limit = 50, offset = 0, filters?: {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const whereClause: any = {};
    
    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }
    
    if (filters?.action) {
      whereClause.action = filters.action;
    }
    
    if (filters?.entityType) {
      whereClause.entityType = filters.entityType;
    }
    
    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = filters.endDate;
      }
    }

    const logs = await db.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.activityLog.count({
      where: whereClause,
    });

    return {
      logs,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Failed to fetch system activity logs:', error);
    return {
      logs: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }
}

// Predefined action types for consistent logging
export const ActivityActions = {
  // User actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  USER_UPDATE_PROFILE: 'USER_UPDATE_PROFILE',
  USER_CHANGE_PASSWORD: 'USER_CHANGE_PASSWORD',
  
  // License actions
  LICENSE_CREATE: 'LICENSE_CREATE',
  LICENSE_ACTIVATE: 'LICENSE_ACTIVATE',
  LICENSE_DEACTIVATE: 'LICENSE_DEACTIVATE',
  LICENSE_USE: 'LICENSE_USE',
  LICENSE_VERIFY: 'LICENSE_VERIFY',
  
  // Credit actions
  CREDIT_PURCHASE: 'CREDIT_PURCHASE',
  CREDIT_USE: 'CREDIT_USE',
  CREDIT_REFUND: 'CREDIT_REFUND',
  CREDIT_BONUS: 'CREDIT_BONUS',
  CREDIT_ADJUSTMENT: 'CREDIT_ADJUSTMENT',
  
  // Payment actions
  PAYMENT_CREATE: 'PAYMENT_CREATE',
  PAYMENT_COMPLETE: 'PAYMENT_COMPLETE',
  PAYMENT_FAIL: 'PAYMENT_FAIL',
  PAYMENT_REFUND: 'PAYMENT_REFUND',
  
  // Ticket actions
  TICKET_CREATE: 'TICKET_CREATE',
  TICKET_UPDATE: 'TICKET_UPDATE',
  TICKET_REPLY: 'TICKET_REPLY',
  TICKET_RESOLVE: 'TICKET_RESOLVE',
  TICKET_CLOSE: 'TICKET_CLOSE',
  
  // Device actions
  DEVICE_REGISTER: 'DEVICE_REGISTER',
  DEVICE_UPDATE: 'DEVICE_UPDATE',
  DEVICE_RESET_HWID: 'DEVICE_RESET_HWID',
  
  // Referral actions
  REFERRAL_GENERATE: 'REFERRAL_GENERATE',
  REFERRAL_USE: 'REFERRAL_USE',
  REFERRAL_BONUS: 'REFERRAL_BONUS',
  
  // News actions
  NEWS_CREATE: 'NEWS_CREATE',
  NEWS_UPDATE: 'NEWS_UPDATE',
  NEWS_PUBLISH: 'NEWS_PUBLISH',
  NEWS_UNPUBLISH: 'NEWS_UNPUBLISH',
  
  // System actions
  ADMIN_ACTION: 'ADMIN_ACTION',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SECURITY_ALERT: 'SECURITY_ALERT',
} as const;

// Predefined entity types for consistent logging
export const EntityTypes = {
  USER: 'USER',
  LICENSE: 'LICENSE',
  CREDIT_TRANSACTION: 'CREDIT_TRANSACTION',
  PAYMENT: 'PAYMENT',
  TICKET: 'TICKET',
  DEVICE: 'DEVICE',
  TOOL: 'TOOL',
  NEWS: 'NEWS',
  REFERRAL: 'REFERRAL',
  DOWNLOAD: 'DOWNLOAD',
  SYSTEM: 'SYSTEM',
} as const;