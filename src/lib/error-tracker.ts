import { db } from '@/lib/db';
import { auditLogger } from '@/lib/audit-logger';
import { performanceMonitor } from '@/lib/performance-monitor';

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'debug';
  type: 'system' | 'application' | 'security' | 'performance' | 'network' | 'database';
  message: string;
  stackTrace?: string;
  context: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  route?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  tags: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ErrorAlert {
  id: string;
  errorId: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'dashboard';
  recipient: string;
  message: string;
  sent: boolean;
  sentAt?: Date;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
}

export interface ErrorRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    level?: ErrorEvent['level'][];
    type?: ErrorEvent['type'][];
    severity?: ErrorEvent['severity'][];
    tags?: string[];
    countThreshold?: number;
    timeWindow?: number; // in minutes
  };
  actions: {
    alert?: boolean;
    alertType?: ErrorAlert['type'][];
    recipients?: string[];
    autoResolve?: boolean;
    escalateAfter?: number; // in minutes
  };
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorBuffer: ErrorEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private rules: Map<string, ErrorRule> = new Map();
  private alerts: ErrorAlert[] = [];

  private constructor() {
    this.initializeErrorBuffer();
    this.loadRules();
    this.startFlushInterval();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private initializeErrorBuffer() {
    // Initialize error buffer from database if needed
  }

  private async loadRules() {
    try {
      // Load rules from database
      const rules = await db.errorRule.findMany({
        where: { enabled: true }
      });

      rules.forEach(rule => {
        this.rules.set(rule.id, {
          id: rule.id,
          name: rule.name,
          description: rule.description,
          conditions: JSON.parse(rule.conditions as string),
          actions: JSON.parse(rule.actions as string),
          enabled: rule.enabled,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt
        });
      });
    } catch (error) {
      console.error('Failed to load error rules:', error);
    }
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flushErrorBuffer();
    }, 30000); // Flush every 30 seconds
  }

  private async flushErrorBuffer() {
    if (this.errorBuffer.length === 0) return;

    try {
      const errorsToSave = [...this.errorBuffer];
      this.errorBuffer = [];

      // Group similar errors
      const groupedErrors = this.groupSimilarErrors(errorsToSave);

      // Save to database
      for (const [key, errors] of groupedErrors) {
        const baseError = errors[0];
        const errorData = {
          level: baseError.level,
          type: baseError.type,
          message: baseError.message,
          stackTrace: baseError.stackTrace,
          context: JSON.stringify(baseError.context),
          userId: baseError.userId,
          sessionId: baseError.sessionId,
          ipAddress: baseError.ipAddress,
          userAgent: baseError.userAgent,
          route: baseError.route,
          resolved: false,
          tags: JSON.stringify(baseError.tags),
          severity: baseError.severity,
          count: errors.length,
          firstSeen: baseError.timestamp,
          lastSeen: errors[errors.length - 1].timestamp
        };

        // Check if error already exists
        const existingError = await db.errorEvent.findFirst({
          where: {
            message: baseError.message,
            type: baseError.type,
            route: baseError.route
          }
        });

        if (existingError) {
          // Update existing error
          await db.errorEvent.update({
            where: { id: existingError.id },
            data: {
              count: existingError.count + errors.length,
              lastSeen: errors[errors.length - 1].timestamp,
              context: JSON.stringify(baseError.context)
            }
          });
        } else {
          // Create new error
          await db.errorEvent.create({
            data: errorData
          });
        }

        // Process rules for this error
        await this.processRules(baseError);
      }
    } catch (error) {
      console.error('Failed to flush error buffer:', error);
      // Re-add errors to buffer for retry
      this.errorBuffer.unshift(...errorsToSave);
    }
  }

  private groupSimilarErrors(errors: ErrorEvent[]): Map<string, ErrorEvent[]> {
    const grouped = new Map<string, ErrorEvent[]>();

    errors.forEach(error => {
      // Create a key based on error type, message, and route
      const key = `${error.type}:${error.message}:${error.route || 'no-route'}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(error);
    });

    return grouped;
  }

  private async processRules(error: ErrorEvent) {
    for (const rule of this.rules.values()) {
      if (this.matchesRule(error, rule)) {
        await this.executeRuleActions(error, rule);
      }
    }
  }

  private matchesRule(error: ErrorEvent, rule: ErrorRule): boolean {
    const conditions = rule.conditions;

    // Check level
    if (conditions.level && !conditions.level.includes(error.level)) {
      return false;
    }

    // Check type
    if (conditions.type && !conditions.type.includes(error.type)) {
      return false;
    }

    // Check severity
    if (conditions.severity && !conditions.severity.includes(error.severity)) {
      return false;
    }

    // Check tags
    if (conditions.tags && !conditions.tags.some(tag => error.tags.includes(tag))) {
      return false;
    }

    // Check count threshold (would need to query database for this)
    if (conditions.countThreshold) {
      // This would require a database query to check error counts
      // For now, we'll skip this check
    }

    return true;
  }

  private async executeRuleActions(error: ErrorEvent, rule: ErrorRule) {
    const actions = rule.actions;

    if (actions.alert && actions.alertType && actions.recipients) {
      for (const alertType of actions.alertType) {
        for (const recipient of actions.recipients) {
          await this.createAlert(error, alertType, recipient);
        }
      }
    }

    if (actions.autoResolve) {
      // Auto-resolve logic would go here
      // This might involve checking if the error has been resolved automatically
    }
  }

  private async createAlert(error: ErrorEvent, type: ErrorAlert['type'], recipient: string) {
    const alert: ErrorAlert = {
      id: this.generateId(),
      errorId: error.id,
      type,
      recipient,
      message: this.generateAlertMessage(error),
      sent: false,
      retryCount: 0,
      maxRetries: 3
    };

    this.alerts.push(alert);
    await this.sendAlert(alert);
  }

  private generateAlertMessage(error: ErrorEvent): string {
    return `[${error.severity.toUpperCase()}] ${error.type}: ${error.message}\\n\\n` +
           `Route: ${error.route || 'Unknown'}\\n` +
           `User: ${error.userId || 'Anonymous'}\\n` +
           `Time: ${error.timestamp.toISOString()}\\n` +
           `Count: ${error.count}`;
  }

  private async sendAlert(alert: ErrorAlert) {
    try {
      switch (alert.type) {
        case 'email':
          await this.sendEmailAlert(alert);
          break;
        case 'slack':
          await this.sendSlackAlert(alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert);
          break;
        case 'dashboard':
          // Dashboard alerts are handled differently
          break;
      }

      alert.sent = true;
      alert.sentAt = new Date();
    } catch (error) {
      console.error(`Failed to send alert ${alert.id}:`, error);
      alert.retryCount++;
      
      if (alert.retryCount < alert.maxRetries) {
        alert.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // Retry in 5 minutes
      }
    }

    // Save alert to database
    await db.errorAlert.create({
      data: {
        errorId: alert.errorId,
        type: alert.type,
        recipient: alert.recipient,
        message: alert.message,
        sent: alert.sent,
        sentAt: alert.sentAt,
        retryCount: alert.retryCount,
        maxRetries: alert.maxRetries,
        nextRetryAt: alert.nextRetryAt
      }
    });
  }

  private async sendEmailAlert(alert: ErrorAlert) {
    // Implement email alert sending
    // This would integrate with your email service
    console.log(`Sending email alert to ${alert.recipient}: ${alert.message}`);
  }

  private async sendSlackAlert(alert: ErrorAlert) {
    // Implement Slack alert sending
    // This would integrate with Slack webhook
    console.log(`Sending Slack alert to ${alert.recipient}: ${alert.message}`);
  }

  private async sendWebhookAlert(alert: ErrorAlert) {
    // Implement webhook alert sending
    // This would send HTTP POST to configured webhook URL
    console.log(`Sending webhook alert to ${alert.recipient}: ${alert.message}`);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Public methods
  public trackError(error: Omit<ErrorEvent, 'id' | 'resolved' | 'count' | 'firstSeen' | 'lastSeen'>) {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      resolved: false,
      count: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
      ...error
    };

    this.errorBuffer.push(errorEvent);

    // Log to audit logger for security errors
    if (errorEvent.type === 'security') {
      auditLogger.logSecurityEvent('error_tracking', {
        errorId: errorEvent.id,
        message: errorEvent.message,
        severity: errorEvent.severity,
        userId: errorEvent.userId
      });
    }
  }

  public async getErrors(filters?: {
    level?: ErrorEvent['level'];
    type?: ErrorEvent['type'];
    severity?: ErrorEvent['severity'];
    resolved?: boolean;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<ErrorEvent[]> {
    const where: any = {};

    if (filters?.level) where.level = filters.level;
    if (filters?.type) where.type = filters.type;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.resolved !== undefined) where.resolved = filters.resolved;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const errors = await db.errorEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0
    });

    return errors.map(error => ({
      ...error,
      context: JSON.parse(error.context as string),
      tags: JSON.parse(error.tags as string)
    }));
  }

  public async resolveError(errorId: string, resolvedBy: string, resolution: string) {
    await db.errorEvent.update({
      where: { id: errorId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        resolution
      }
    });

    // Log resolution to audit logger
    auditLogger.logSecurityEvent('error_resolved', {
      errorId,
      resolvedBy,
      resolution
    });
  }

  public async getErrorStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    totalErrors: number;
    errorsByLevel: Record<ErrorEvent['level'], number>;
    errorsByType: Record<ErrorEvent['type'], number>;
    errorsBySeverity: Record<ErrorEvent['severity'], number>;
    topErrors: Array<{ message: string; count: number }>;
  }> {
    const now = new Date();
    const timeRanges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };

    const startDate = timeRanges[timeRange];

    const [errors, errorGroups] = await Promise.all([
      db.errorEvent.findMany({
        where: {
          timestamp: { gte: startDate }
        }
      }),
      db.errorEvent.groupBy({
        by: ['message'],
        where: {
          timestamp: { gte: startDate }
        },
        _count: {
          message: true
        },
        orderBy: {
          _count: {
            message: 'desc'
          }
        },
        take: 10
      })
    ]);

    const stats = {
      totalErrors: errors.length,
      errorsByLevel: {} as Record<ErrorEvent['level'], number>,
      errorsByType: {} as Record<ErrorEvent['type'], number>,
      errorsBySeverity: {} as Record<ErrorEvent['severity'], number>,
      topErrors: errorGroups.map(group => ({
        message: group.message,
        count: group._count.message
      }))
    };

    // Calculate counts by level, type, and severity
    errors.forEach(error => {
      stats.errorsByLevel[error.level as ErrorEvent['level']] = 
        (stats.errorsByLevel[error.level as ErrorEvent['level']] || 0) + 1;
      stats.errorsByType[error.type as ErrorEvent['type']] = 
        (stats.errorsByType[error.type as ErrorEvent['type']] || 0) + 1;
      stats.errorsBySeverity[error.severity as ErrorEvent['severity']] = 
        (stats.errorsBySeverity[error.severity as ErrorEvent['severity']] || 0) + 1;
    });

    return stats;
  }

  public async createRule(rule: Omit<ErrorRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ErrorRule> {
    const newRule = await db.errorRule.create({
      data: {
        name: rule.name,
        description: rule.description,
        conditions: JSON.stringify(rule.conditions),
        actions: JSON.stringify(rule.actions),
        enabled: rule.enabled
      }
    });

    const ruleObj: ErrorRule = {
      id: newRule.id,
      name: newRule.name,
      description: newRule.description,
      conditions: JSON.parse(newRule.conditions as string),
      actions: JSON.parse(newRule.actions as string),
      enabled: newRule.enabled,
      createdAt: newRule.createdAt,
      updatedAt: newRule.updatedAt
    };

    this.rules.set(newRule.id, ruleObj);
    return ruleObj;
  }

  public async updateRule(ruleId: string, updates: Partial<ErrorRule>): Promise<ErrorRule | null> {
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) return null;

    const updatedRule = await db.errorRule.update({
      where: { id: ruleId },
      data: {
        name: updates.name,
        description: updates.description,
        conditions: updates.conditions ? JSON.stringify(updates.conditions) : undefined,
        actions: updates.actions ? JSON.stringify(updates.actions) : undefined,
        enabled: updates.enabled
      }
    });

    const ruleObj: ErrorRule = {
      id: updatedRule.id,
      name: updatedRule.name,
      description: updatedRule.description,
      conditions: JSON.parse(updatedRule.conditions as string),
      actions: JSON.parse(updatedRule.actions as string),
      enabled: updatedRule.enabled,
      createdAt: updatedRule.createdAt,
      updatedAt: updatedRule.updatedAt
    };

    this.rules.set(ruleId, ruleObj);
    return ruleObj;
  }

  public async deleteRule(ruleId: string): Promise<boolean> {
    try {
      await db.errorRule.delete({
        where: { id: ruleId }
      });
      this.rules.delete(ruleId);
      return true;
    } catch (error) {
      console.error('Failed to delete rule:', error);
      return false;
    }
  }

  public getRules(): ErrorRule[] {
    return Array.from(this.rules.values());
  }

  public async getAlerts(filters?: {
    sent?: boolean;
    type?: ErrorAlert['type'];
    limit?: number;
    offset?: number;
  }): Promise<ErrorAlert[]> {
    const where: any = {};
    
    if (filters?.sent !== undefined) where.sent = filters.sent;
    if (filters?.type) where.type = filters.type;

    return await db.errorAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0
    });
  }

  public async retryFailedAlerts(): Promise<number> {
    const failedAlerts = await db.errorAlert.findMany({
      where: {
        sent: false,
        retryCount: { lt: 3 },
        OR: [
          { nextRetryAt: { lte: new Date() } },
          { nextRetryAt: null }
        ]
      }
    });

    let retriedCount = 0;
    for (const alert of failedAlerts) {
      try {
        await this.sendAlert(alert);
        retriedCount++;
      } catch (error) {
        console.error(`Failed to retry alert ${alert.id}:`, error);
      }
    }

    return retriedCount;
  }

  public destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

export const errorTracker = ErrorTracker.getInstance();