export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  lastReset: Date;
}

export interface RequestMetrics {
  path: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private requestMetrics: RequestMetrics[];
  private maxRequestMetrics: number = 1000;

  constructor() {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      lastReset: new Date(),
    };
    this.requestMetrics = [];
  }

  recordRequest(metrics: RequestMetrics): void {
    this.requestMetrics.push(metrics);
    
    // Keep only the most recent metrics
    if (this.requestMetrics.length > this.maxRequestMetrics) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxRequestMetrics);
    }

    // Update overall metrics
    this.metrics.requestCount++;
    this.metrics.averageResponseTime = this.calculateAverageResponseTime();
    this.metrics.errorRate = this.calculateErrorRate();
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.uptime = process.uptime();
  }

  private calculateAverageResponseTime(): number {
    if (this.requestMetrics.length === 0) return 0;
    
    const totalResponseTime = this.requestMetrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return totalResponseTime / this.requestMetrics.length;
  }

  private calculateErrorRate(): number {
    if (this.requestMetrics.length === 0) return 0;
    
    const errorCount = this.requestMetrics.filter(metric => metric.statusCode >= 400).length;
    return (errorCount / this.requestMetrics.length) * 100;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getRequestMetrics(limit?: number): RequestMetrics[] {
    if (limit) {
      return this.requestMetrics.slice(-limit);
    }
    return [...this.requestMetrics];
  }

  getMetricsByPath(path: string): {
    count: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const pathMetrics = this.requestMetrics.filter(metric => metric.path === path);
    
    if (pathMetrics.length === 0) {
      return { count: 0, averageResponseTime: 0, errorRate: 0 };
    }

    const totalResponseTime = pathMetrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    const errorCount = pathMetrics.filter(metric => metric.statusCode >= 400).length;

    return {
      count: pathMetrics.length,
      averageResponseTime: totalResponseTime / pathMetrics.length,
      errorRate: (errorCount / pathMetrics.length) * 100,
    };
  }

  getTopSlowPaths(limit: number = 10): Array<{
    path: string;
    averageResponseTime: number;
    count: number;
  }> {
    const pathStats = new Map<string, { totalResponseTime: number; count: number }>();

    this.requestMetrics.forEach(metric => {
      const existing = pathStats.get(metric.path) || { totalResponseTime: 0, count: 0 };
      pathStats.set(metric.path, {
        totalResponseTime: existing.totalResponseTime + metric.responseTime,
        count: existing.count + 1,
      });
    });

    return Array.from(pathStats.entries())
      .map(([path, stats]) => ({
        path,
        averageResponseTime: stats.totalResponseTime / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, limit);
  }

  getErrorMetrics(): Array<{
    path: string;
    statusCode: number;
    count: number;
    lastOccurrence: Date;
  }> {
    const errorStats = new Map<string, { count: number; lastOccurrence: Date }>();

    this.requestMetrics
      .filter(metric => metric.statusCode >= 400)
      .forEach(metric => {
        const key = `${metric.path}:${metric.statusCode}`;
        const existing = errorStats.get(key) || { count: 0, lastOccurrence: new Date(0) };
        errorStats.set(key, {
          count: existing.count + 1,
          lastOccurrence: metric.timestamp > existing.lastOccurrence ? metric.timestamp : existing.lastOccurrence,
        });
      });

    return Array.from(errorStats.entries())
      .map(([key, stats]) => {
        const [path, statusCode] = key.split(':');
        return {
          path,
          statusCode: parseInt(statusCode),
          count: stats.count,
          lastOccurrence: stats.lastOccurrence,
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      lastReset: new Date(),
    };
    this.requestMetrics = [];
  }

  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    metrics: PerformanceMetrics;
  } {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let message = 'System is healthy';

    // Check memory usage
    if (memoryUsageMB > 500) {
      status = 'critical';
      message = 'High memory usage detected';
    } else if (memoryUsageMB > 300) {
      status = 'warning';
      message = 'Memory usage is high';
    }

    // Check error rate
    if (this.metrics.errorRate > 10) {
      status = 'critical';
      message = 'High error rate detected';
    } else if (this.metrics.errorRate > 5) {
      status = 'warning';
      message = 'Error rate is elevated';
    }

    // Check response time
    if (this.metrics.averageResponseTime > 2000) {
      status = 'critical';
      message = 'Slow response times detected';
    } else if (this.metrics.averageResponseTime > 1000) {
      status = 'warning';
      message = 'Response times are slow';
    }

    return {
      status,
      message,
      metrics: this.getMetrics(),
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware wrapper for performance monitoring
export function withPerformanceMonitoring(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now();
    const url = new URL(req.url);
    
    try {
      const response = await handler(req);
      const responseTime = Date.now() - startTime;
      
      // Record metrics
      performanceMonitor.recordRequest({
        path: url.pathname,
        method: req.method,
        responseTime,
        statusCode: response.status,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record error metrics
      performanceMonitor.recordRequest({
        path: url.pathname,
        method: req.method,
        responseTime,
        statusCode: 500,
        timestamp: new Date(),
      });

      throw error;
    }
  };
}