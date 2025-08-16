import { db } from './db';

export interface AuditLogData {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: Date;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logQueue: AuditLogData[] = [];
  private isProcessing = false;

  private constructor() {
    // Start processing queue
    this.processQueue();
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(data: AuditLogData): Promise<void> {
    const logEntry: AuditLogData = {
      ...data,
      severity: data.severity || 'INFO',
      timestamp: new Date(),
    };

    // Add to queue
    this.logQueue.push(logEntry);

    // If queue is getting large, process immediately
    if (this.logQueue.length > 100) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.logQueue.splice(0, 50); // Process in batches of 50
      
      for (const logData of batch) {
        await this.writeToDatabase(logData);
      }
    } catch (error) {
      console.error('Error processing audit log queue:', error);
      // Re-add failed logs to queue
      this.logQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }

    // Continue processing if there are more logs
    if (this.logQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  private async writeToDatabase(data: AuditLogData): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          description: data.description,
          metadata: data.metadata || {},
          ip: data.ip,
          userAgent: data.userAgent,
          severity: data.severity,
        },
      });
    } catch (error) {
      console.error('Error writing audit log to database:', error);
      throw error;
    }
  }

  async getLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
  }> {
    const {
      userId,
      action,
      entityType,
      entityId,
      severity,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    const whereClause: any = {};
    
    if (userId) whereClause.userId = userId;
    if (action) whereClause.action = { contains: action, mode: 'insensitive' };
    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (severity) whereClause.severity = severity;
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = startDate;
      if (endDate) whereClause.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
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
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      db.auditLog.count({ where: whereClause }),
    ]);

    return {
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        metadata: log.metadata as Record<string, any>,
        ip: log.ip,
        userAgent: log.userAgent,
        severity: log.severity,
        timestamp: log.timestamp,
        user: log.user,
      })),
      total,
    };
  }

  async getLogStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<{
    totalLogs: number;
    logsBySeverity: Record<string, number>;
    logsByAction: Record<string, number>;
    logsByUser: Array<{ userId: string; email: string; count: number }>;
    topEntities: Array<{ entityType: string; entityId: string; count: number }>;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const [totalLogs, logsBySeverity, logsByAction, logsByUser, topEntities] = await Promise.all([
      db.auditLog.count({
        where: {
          timestamp: {
            gte: startDate,
          },
        },
      }),
      db.auditLog.groupBy({
        by: ['severity'],
        where: {
          timestamp: {
            gte: startDate,
          },
        },
        _count: {
          severity: true,
        },
      }),
      db.auditLog.groupBy({
        by: ['action'],
        where: {
          timestamp: {
            gte: startDate,
          },
        },
        _count: {
          action: true,
        },
      }),
      db.auditLog.groupBy({
        by: ['userId'],
        where: {
          timestamp: {
            gte: startDate,
          },
        },
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),
      db.auditLog.groupBy({
        by: ['entityType', 'entityId'],
        where: {
          timestamp: {
            gte: startDate,
          },
          entityId: {
            not: null,
          },
        },
        _count: {
          entityType: true,
        },
        orderBy: {
          _count: {
            entityType: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    const severityStats = logsBySeverity.reduce((acc, item) => {
      acc[item.severity] = item._count.severity;
      return acc;
    }, {} as Record<string, number>);

    const actionStats = logsBySeverity.reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>);

    const userStats = await Promise.all(
      logsByUser.map(async (item) => {
        const user = await db.user.findUnique({
          where: { id: item.userId },
          select: { email: true, name: true },
        });
        return {
          userId: item.userId,
          email: user?.email || 'Unknown',
          count: item._count.userId,
        };
      })
    );

    return {
      totalLogs,
      logsBySeverity: severityStats,
      logsByAction: actionStats,
      logsByUser: userStats,
      topEntities: topEntities.map(item => ({
        entityType: item.entityType,
        entityId: item.entityId || '',
        count: item._count.entityType,
      })),
    };
  }

  async exportLogs(filters: AuditLogFilters = {}, format: 'json' | 'csv' = 'json'): Promise<string> {
    const { logs } = await this.getLogs({ ...filters, limit: 10000 });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    if (format === 'csv') {
      const headers = [
        'ID',
        'User ID',
        'User Email',
        'Action',
        'Entity Type',
        'Entity ID',
        'Description',
        'Severity',
        'IP Address',
        'Timestamp',
      ];

      const rows = logs.map(log => [
        log.id,
        log.userId,
        log.user?.email || '',
        log.action,
        log.entityType,
        log.entityId || '',
        log.description || '',
        log.severity,
        log.ip || '',
        log.timestamp.toISOString(),
      ]);

      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    throw new Error('Unsupported export format');
  }

  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await db.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience functions for common audit actions
export async function logUserAction(
  userId: string,
  action: string,
  description?: string,
  metadata?: Record<string, any>,
  request?: Request
): Promise<void> {
  await auditLogger.log({
    userId,
    action,
    entityType: 'USER',
    description,
    metadata,
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
  });
}

export async function logAdminAction(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  description?: string,
  metadata?: Record<string, any>,
  request?: Request
): Promise<void> {
  await auditLogger.log({
    userId,
    action,
    entityType,
    entityId,
    description,
    metadata,
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
    severity: 'WARNING',
  });
}

export async function logSecurityEvent(
  userId: string,
  action: string,
  description?: string,
  metadata?: Record<string, any>,
  request?: Request
): Promise<void> {
  await auditLogger.log({
    userId,
    action,
    entityType: 'SECURITY',
    description,
    metadata,
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
    severity: 'CRITICAL',
  });
}

// Middleware for automatic audit logging
export function withAuditLogging(
  entityType: string,
  actionExtractor: (req: Request) => string
) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = (async function(this: any, request: Request, ...args: any[]) {
      const userId = request.headers.get('x-user-id') || 'anonymous';
      const action = actionExtractor(request);
      
      try {
        const result = await method.apply(this, [request, ...args]);
        
        await auditLogger.log({
          userId,
          action,
          entityType,
          description: `${action} successful`,
          metadata: { result: 'success' },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
        });

        return result;
      } catch (error) {
        await auditLogger.log({
          userId,
          action,
          entityType,
          description: `${action} failed`,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
          severity: 'ERROR',
        });

        throw error;
      }
    }) as any;

    return descriptor;
  };
}