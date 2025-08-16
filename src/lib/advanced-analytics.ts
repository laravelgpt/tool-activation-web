import { db } from './db';
import { performanceMonitor } from './performance-monitor';

export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growthRate: number;
  };
  licenses: {
    total: number;
    active: number;
    expired: number;
    byType: Record<string, number>;
    usageStats: {
      averageUsage: number;
      highUsageLicenses: number;
      lowUsageLicenses: number;
    };
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    bySource: Record<string, number>;
    growthRate: number;
  };
  system: {
    uptime: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    health: 'healthy' | 'warning' | 'critical';
  };
  tools: {
    total: number;
    active: number;
    popularTools: Array<{
      id: string;
      name: string;
      usageCount: number;
    }>;
  };
}

export interface UserBehaviorAnalytics {
  userId: string;
  loginFrequency: number;
  averageSessionDuration: number;
  mostUsedFeatures: string[];
  licenseUsage: number;
  lastActivity: Date;
  riskScore: number;
}

export class AdvancedAnalytics {
  async getAnalyticsData(): Promise<AnalyticsData> {
    const [
      userStats,
      licenseStats,
      revenueStats,
      systemStats,
      toolStats
    ] = await Promise.all([
      this.getUserStats(),
      this.getLicenseStats(),
      this.getRevenueStats(),
      this.getSystemStats(),
      this.getToolStats()
    ]);

    return {
      users: userStats,
      licenses: licenseStats,
      revenue: revenueStats,
      system: systemStats,
      tools: toolStats,
    };
  }

  private async getUserStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      usersLastMonth
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { createdAt: { gte: today } } }),
      db.user.count({ where: { createdAt: { gte: weekAgo } } }),
      db.user.count({ where: { createdAt: { gte: monthAgo } } }),
      db.user.count({ where: { createdAt: { lt: monthAgo } } }),
    ]);

    const growthRate = usersLastMonth > 0 
      ? ((newThisMonth - usersLastMonth) / usersLastMonth) * 100 
      : 0;

    return {
      total: totalUsers,
      active: activeUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      growthRate,
    };
  }

  private async getLicenseStats() {
    const [
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      licensesByType,
      allLicenses
    ] = await Promise.all([
      db.license.count(),
      db.license.count({ where: { active: true } }),
      db.license.count({ 
        where: { 
          OR: [
            { active: false },
            { expiresAt: { lt: new Date() } }
          ]
        } 
      }),
      db.license.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      db.license.findMany({
        select: {
          usageCount: true,
          usageLimit: true,
        },
      }),
    ]);

    const byType = licensesByType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    const usageStats = {
      averageUsage: allLicenses.reduce((sum, license) => {
        const usagePercentage = license.usageLimit > 0 
          ? (license.usageCount / license.usageLimit) * 100 
          : 0;
        return sum + usagePercentage;
      }, 0) / allLicenses.length,
      highUsageLicenses: allLicenses.filter(license => 
        license.usageLimit > 0 && (license.usageCount / license.usageLimit) > 0.8
      ).length,
      lowUsageLicenses: allLicenses.filter(license => 
        license.usageLimit > 0 && (license.usageCount / license.usageLimit) < 0.2
      ).length,
    };

    return {
      total: totalLicenses,
      active: activeLicenses,
      expired: expiredLicenses,
      byType,
      usageStats,
    };
  }

  private async getRevenueStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      todayRevenue,
      thisWeekRevenue,
      thisMonthRevenue,
      revenueBySource,
      lastMonthRevenue
    ] = await Promise.all([
      db.creditTransaction.aggregate({
        where: { type: 'PURCHASE' },
        _sum: { amount: true },
      }),
      db.creditTransaction.aggregate({
        where: { 
          type: 'PURCHASE',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
      db.creditTransaction.aggregate({
        where: { 
          type: 'PURCHASE',
          createdAt: { gte: weekAgo },
        },
        _sum: { amount: true },
      }),
      db.creditTransaction.aggregate({
        where: { 
          type: 'PURCHASE',
          createdAt: { gte: monthAgo },
        },
        _sum: { amount: true },
      }),
      db.creditTransaction.groupBy({
        by: ['type'],
        where: { type: 'PURCHASE' },
        _sum: { amount: true },
      }),
      db.creditTransaction.aggregate({
        where: { 
          type: 'PURCHASE',
          createdAt: { lt: monthAgo },
        },
        _sum: { amount: true },
      }),
    ]);

    const bySource = revenueBySource.reduce((acc, item) => {
      acc[item.type] = item._sum.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    const growthRate = (lastMonthRevenue._sum.amount || 0) > 0 
      ? ((thisMonthRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 0) * 100 
      : 0;

    return {
      total: totalRevenue._sum.amount || 0,
      today: todayRevenue._sum.amount || 0,
      thisWeek: thisWeekRevenue._sum.amount || 0,
      thisMonth: thisMonthRevenue._sum.amount || 0,
      bySource,
      growthRate,
    };
  }

  private async getSystemStats() {
    const perfMetrics = performanceMonitor.getMetrics();
    const healthStatus = performanceMonitor.getHealthStatus();

    return {
      uptime: perfMetrics.uptime,
      averageResponseTime: perfMetrics.averageResponseTime,
      errorRate: perfMetrics.errorRate,
      memoryUsage: perfMetrics.memoryUsage.heapUsed / 1024 / 1024, // Convert to MB
      health: healthStatus.status,
    };
  }

  private async getToolStats() {
    const [
      totalTools,
      activeTools,
      popularTools
    ] = await Promise.all([
      db.tool.count(),
      db.tool.count({ where: { isActive: true } }),
      db.tool.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              licenses: true,
              activationLogs: true,
            },
          },
        },
        orderBy: {
          activationLogs: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      total: totalTools,
      active: activeTools,
      popularTools: popularTools.map(tool => ({
        id: tool.id,
        name: tool.name,
        usageCount: tool._count.activationLogs,
      })),
    };
  }

  async getUserBehaviorAnalytics(userId: string): Promise<UserBehaviorAnalytics> {
    const [
      user,
      activityLogs,
      licenses,
      recentActivity
    ] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
      db.activityLog.findMany({
        where: { userId },
        select: { action: string, createdAt: true },
      }),
      db.license.findMany({
        where: { userId },
        select: { usageCount: true, usageLimit: true },
      }),
      db.activityLog.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate login frequency (logins per day)
    const loginActions = activityLogs.filter(log => log.action === 'login');
    const daysSinceCreation = Math.max(1, Math.ceil((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const loginFrequency = loginActions.length / daysSinceCreation;

    // Calculate average session duration (simplified)
    const sessionDurations = [];
    for (let i = 0; i < loginActions.length - 1; i++) {
      const duration = loginActions[i + 1].createdAt.getTime() - loginActions[i].createdAt.getTime();
      if (duration > 0 && duration < 24 * 60 * 60 * 1000) { // Less than 24 hours
        sessionDurations.push(duration);
      }
    }
    const averageSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length 
      : 0;

    // Find most used features
    const featureCounts = new Map<string, number>();
    activityLogs.forEach(log => {
      const feature = log.action.split('_')[0]; // Simple feature extraction
      featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
    });
    const mostUsedFeatures = Array.from(featureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature]) => feature);

    // Calculate license usage
    const totalLicenseUsage = licenses.reduce((sum, license) => {
      return sum + (license.usageLimit > 0 ? license.usageCount / license.usageLimit : 0);
    }, 0);
    const licenseUsage = licenses.length > 0 ? totalLicenseUsage / licenses.length : 0;

    // Calculate risk score (simplified)
    let riskScore = 0;
    if (loginFrequency > 10) riskScore += 20; // Very frequent logins
    if (averageSessionDuration > 4 * 60 * 60 * 1000) riskScore += 15; // Very long sessions
    if (licenseUsage > 0.9) riskScore += 25; // High license usage
    if (activityLogs.length > 1000) riskScore += 10; // Very active user

    return {
      userId,
      loginFrequency,
      averageSessionDuration,
      mostUsedFeatures,
      licenseUsage,
      lastActivity: recentActivity?.createdAt || new Date(),
      riskScore,
    };
  }

  async getSystemTrends(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const [
      userGrowth,
      licenseGrowth,
      revenueGrowth,
      systemMetrics
    ] = await Promise.all([
      this.getUserGrowth(startDate),
      this.getLicenseGrowth(startDate),
      this.getRevenueGrowth(startDate),
      this.getSystemMetricsTrends(startDate),
    ]);

    return {
      userGrowth,
      licenseGrowth,
      revenueGrowth,
      systemMetrics,
    };
  }

  private async getUserGrowth(startDate: Date) {
    const users = await db.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyGrowth = new Map<string, number>();
    users.forEach(user => {
      const day = user.createdAt.toISOString().split('T')[0];
      dailyGrowth.set(day, (dailyGrowth.get(day) || 0) + 1);
    });

    return Array.from(dailyGrowth.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private async getLicenseGrowth(startDate: Date) {
    const licenses = await db.license.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, type: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day and type
    const dailyGrowth = new Map<string, Record<string, number>>();
    licenses.forEach(license => {
      const day = license.createdAt.toISOString().split('T')[0];
      if (!dailyGrowth.has(day)) {
        dailyGrowth.set(day, {});
      }
      const typeCounts = dailyGrowth.get(day)!;
      typeCounts[license.type] = (typeCounts[license.type] || 0) + 1;
    });

    return Array.from(dailyGrowth.entries()).map(([date, types]) => ({
      date,
      ...types,
    }));
  }

  private async getRevenueGrowth(startDate: Date) {
    const transactions = await db.creditTransaction.findMany({
      where: { 
        type: 'PURCHASE',
        createdAt: { gte: startDate },
      },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyRevenue = new Map<string, number>();
    transactions.forEach(transaction => {
      const day = transaction.createdAt.toISOString().split('T')[0];
      dailyRevenue.set(day, (dailyRevenue.get(day) || 0) + transaction.amount);
    });

    return Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  private async getSystemMetricsTrends(startDate: Date) {
    const requestMetrics = performanceMonitor.getRequestMetrics();
    const filteredMetrics = requestMetrics.filter(metric => 
      metric.timestamp >= startDate
    );

    // Group by hour
    const hourlyMetrics = new Map<string, {
      count: number;
      totalResponseTime: number;
      errorCount: number;
    }>();

    filteredMetrics.forEach(metric => {
      const hour = new Date(metric.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      if (!hourlyMetrics.has(hour)) {
        hourlyMetrics.set(hour, { count: 0, totalResponseTime: 0, errorCount: 0 });
      }
      const hourData = hourlyMetrics.get(hour)!;
      hourData.count++;
      hourData.totalResponseTime += metric.responseTime;
      if (metric.statusCode >= 400) {
        hourData.errorCount++;
      }
    });

    return Array.from(hourlyMetrics.entries()).map(([hour, data]) => ({
      hour,
      requestCount: data.count,
      averageResponseTime: data.totalResponseTime / data.count,
      errorRate: (data.errorCount / data.count) * 100,
    }));
  }
}

export const advancedAnalytics = new AdvancedAnalytics();