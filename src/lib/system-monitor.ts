import { db } from './db';
import { AuditLogger } from './audit-logger';
import { apiRateLimiters } from './api-rate-limiter';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    incoming: number;
    outgoing: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  api: {
    requestsPerSecond: number;
    responseTime: number;
    errorRate: number;
  };
  users: {
    active: number;
    total: number;
    newToday: number;
  };
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  checks: {
    database: boolean;
    redis: boolean;
    storage: boolean;
    network: boolean;
    services: boolean;
  };
  lastCheck: Date;
}

class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private alerts: SystemAlert[] = [];
  private healthStatus: SystemHealth | null = null;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  async startMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Collect metrics every 30 seconds
    this.intervalId = setInterval(async () => {
      await this.collectMetrics();
      await this.checkHealth();
      await this.checkAlerts();
    }, 30000);

    // Initial collection
    await this.collectMetrics();
    await this.checkHealth();
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: await this.getCPUUsage(),
      memory: await this.getMemoryUsage(),
      disk: await this.getDiskUsage(),
      network: await this.getNetworkUsage(),
      database: await this.getDatabaseMetrics(),
      api: await this.getAPIMetrics(),
      users: await this.getUserMetrics(),
    };

    // Keep only last 1000 metrics
    this.metrics.push(metrics);
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    return metrics;
  }

  private async getCPUUsage() {
    // Simulated CPU usage - in production, use system-specific libraries
    const usage = Math.random() * 100;
    return {
      usage: Math.round(usage * 100) / 100,
      cores: 4, // Default to 4 cores
    };
  }

  private async getMemoryUsage() {
    // Simulated memory usage - in production, use system-specific libraries
    const total = 16 * 1024 * 1024 * 1024; // 16GB
    const used = total * (0.3 + Math.random() * 0.4); // 30-70% usage
    const free = total - used;
    
    return {
      total,
      used,
      free,
      percentage: Math.round((used / total) * 100 * 100) / 100,
    };
  }

  private async getDiskUsage() {
    // Simulated disk usage - in production, use system-specific libraries
    const total = 500 * 1024 * 1024 * 1024; // 500GB
    const used = total * (0.4 + Math.random() * 0.3); // 40-70% usage
    const free = total - used;
    
    return {
      total,
      used,
      free,
      percentage: Math.round((used / total) * 100 * 100) / 100,
    };
  }

  private async getNetworkUsage() {
    // Simulated network usage
    return {
      incoming: Math.floor(Math.random() * 1000000), // bytes
      outgoing: Math.floor(Math.random() * 1000000), // bytes
    };
  }

  private async getDatabaseMetrics() {
    try {
      // Get database connection count (simplified)
      const connections = 5 + Math.floor(Math.random() * 20);
      
      // Simulate query time
      const queryTime = Math.random() * 100; // ms
      
      // Count slow queries (queries taking > 100ms)
      const slowQueries = Math.floor(Math.random() * 5);
      
      return {
        connections,
        queryTime: Math.round(queryTime * 100) / 100,
        slowQueries,
      };
    } catch (error) {
      return {
        connections: 0,
        queryTime: 0,
        slowQueries: 0,
      };
    }
  }

  private async getAPIMetrics() {
    // Calculate API metrics from rate limiter data
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    let totalRequests = 0;
    let totalResponseTime = 0;
    let errorCount = 0;
    
    // This is a simplified version - in production, you'd track actual API requests
    for (const [_, limiter] of Object.entries(apiRateLimiters)) {
      // Simulate request counting
      totalRequests += Math.floor(Math.random() * 100);
      totalResponseTime += Math.random() * 200;
      errorCount += Math.floor(Math.random() * 5);
    }
    
    const requestsPerSecond = totalRequests / 60;
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    
    return {
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      responseTime: Math.round(avgResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  private async getUserMetrics() {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get user counts
      const [totalUsers, activeUsers, newUsersToday] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { isActive: true } }),
        db.user.count({ where: { createdAt: { gte: startOfDay } } }),
      ]);
      
      return {
        active: activeUsers,
        total: totalUsers,
        newToday: newUsersToday,
      };
    } catch (error) {
      return {
        active: 0,
        total: 0,
        newToday: 0,
      };
    }
  }

  private async checkHealth(): Promise<SystemHealth> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      storage: await this.checkStorage(),
      network: await this.checkNetwork(),
      services: await this.checkServices(),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (score >= 90) status = 'healthy';
    else if (score >= 70) status = 'degraded';
    else status = 'unhealthy';

    this.healthStatus = {
      status,
      score,
      checks,
      lastCheck: new Date(),
    };

    return this.healthStatus;
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await db.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    // Simulated Redis check - in production, check actual Redis connection
    return Math.random() > 0.1; // 90% success rate
  }

  private async checkStorage(): Promise<boolean> {
    // Simulated storage check - in production, check actual storage
    return Math.random() > 0.05; // 95% success rate
  }

  private async checkNetwork(): Promise<boolean> {
    // Simulated network check - in production, check actual network connectivity
    return Math.random() > 0.1; // 90% success rate
  }

  private async checkServices(): Promise<boolean> {
    // Simulated services check - in production, check actual service health
    return Math.random() > 0.05; // 95% success rate
  }

  private async checkAlerts() {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return;

    // Check CPU usage
    if (latestMetrics.cpu.usage > 90) {
      this.createAlert('critical', `CPU usage is critically high: ${latestMetrics.cpu.usage}%`);
    } else if (latestMetrics.cpu.usage > 80) {
      this.createAlert('error', `CPU usage is high: ${latestMetrics.cpu.usage}%`);
    } else if (latestMetrics.cpu.usage > 70) {
      this.createAlert('warning', `CPU usage is elevated: ${latestMetrics.cpu.usage}%`);
    }

    // Check memory usage
    if (latestMetrics.memory.percentage > 90) {
      this.createAlert('critical', `Memory usage is critically high: ${latestMetrics.memory.percentage}%`);
    } else if (latestMetrics.memory.percentage > 80) {
      this.createAlert('error', `Memory usage is high: ${latestMetrics.memory.percentage}%`);
    }

    // Check disk usage
    if (latestMetrics.disk.percentage > 90) {
      this.createAlert('critical', `Disk usage is critically high: ${latestMetrics.disk.percentage}%`);
    } else if (latestMetrics.disk.percentage > 80) {
      this.createAlert('error', `Disk usage is high: ${latestMetrics.disk.percentage}%`);
    }

    // Check database slow queries
    if (latestMetrics.database.slowQueries > 10) {
      this.createAlert('error', `High number of slow database queries: ${latestMetrics.database.slowQueries}`);
    }

    // Check API error rate
    if (latestMetrics.api.errorRate > 10) {
      this.createAlert('error', `High API error rate: ${latestMetrics.api.errorRate}%`);
    }

    // Check system health
    if (this.healthStatus?.status === 'unhealthy') {
      this.createAlert('critical', 'System is in unhealthy state');
    } else if (this.healthStatus?.status === 'degraded') {
      this.createAlert('warning', 'System is in degraded state');
    }
  }

  private createAlert(type: 'warning' | 'error' | 'critical', message: string, metadata?: Record<string, any>) {
    const alert: SystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata,
    };

    this.alerts.push(alert);

    // Keep only last 500 alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    // Log alert to audit system
    AuditLogger.log('SYSTEM_ALERT', {
      alertType: type,
      message,
      metadata,
      alertId: alert.id,
    });

    // Emit alert via WebSocket if available
    this.emitAlert(alert);
  }

  private emitAlert(alert: SystemAlert) {
    // This would emit the alert via WebSocket to connected clients
    // Implementation depends on your WebSocket setup
    if (typeof window !== 'undefined') return;
    
    // Server-side WebSocket emission would go here
    console.log(`System Alert [${alert.type.toUpperCase()}]: ${alert.message}`);
  }

  // Public methods for getting data
  getMetrics(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  getAlerts(limit: number = 50, unresolvedOnly: boolean = false): SystemAlert[] {
    let alerts = this.alerts.slice(-limit);
    if (unresolvedOnly) {
      alerts = alerts.filter(alert => !alert.resolved);
    }
    return alerts.reverse(); // Most recent first
  }

  getHealthStatus(): SystemHealth | null {
    return this.healthStatus;
  }

  resolveAlert(alertId: string, resolvedBy: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;

      AuditLogger.log('ALERT_RESOLVED', {
        alertId,
        resolvedBy,
        alertType: alert.type,
        message: alert.message,
      });
    }
  }

  getSystemSummary() {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved);
    
    return {
      health: this.healthStatus,
      metrics: latestMetrics,
      alerts: {
        total: this.alerts.length,
        unresolved: unresolvedAlerts.length,
        critical: unresolvedAlerts.filter(a => a.type === 'critical').length,
        error: unresolvedAlerts.filter(a => a.type === 'error').length,
        warning: unresolvedAlerts.filter(a => a.type === 'warning').length,
      },
      uptime: process.uptime(),
      lastUpdate: latestMetrics?.timestamp || null,
    };
  }
}

// Global instance
export const systemMonitor = new SystemMonitor();

// Export for testing
export { SystemMonitor };