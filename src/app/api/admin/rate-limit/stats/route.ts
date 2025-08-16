import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimiters } from '@/lib/api-rate-limiter';
import { withAdminAuth } from '@/lib/middleware';

async function handler(req: NextRequest) {
  try {
    // Collect statistics from all rate limiters
    const stats = {
      totalRequests: 0,
      blockedRequests: 0,
      topBlockedIPs: [] as Array<{
        ip: string;
        blockedCount: number;
        totalRequests: number;
        lastBlocked: Date;
      }>,
      topEndpoints: [] as Array<{
        endpoint: string;
        requestCount: number;
        blockedCount: number;
      }>,
      currentLimits: [] as Array<{
        key: string;
        remaining: number;
        total: number;
        reset: Date;
        endpoint: string;
      }>,
    };

    // This is a simplified implementation
    // In a real-world scenario, you would want to persist this data
    // or use a more sophisticated tracking system
    
    // Simulate collecting data from rate limiters
    const ipStats = new Map<string, { blocked: number; total: number; lastBlocked: Date }>();
    const endpointStats = new Map<string, { requests: number; blocked: number }>();

    // Process all rate limiter stores
    for (const [limiterName, limiter] of Object.entries(apiRateLimiters)) {
      // This is a mock implementation - in reality, you'd access the limiter's internal state
      // For now, we'll return sample data
    }

    // Mock data for demonstration
    stats.totalRequests = 15420;
    stats.blockedRequests = 342;
    stats.topBlockedIPs = [
      {
        ip: '192.168.1.100',
        blockedCount: 45,
        totalRequests: 156,
        lastBlocked: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        ip: '10.0.0.50',
        blockedCount: 23,
        totalRequests: 89,
        lastBlocked: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        ip: '203.0.113.1',
        blockedCount: 18,
        totalRequests: 67,
        lastBlocked: new Date(Date.now() - 30 * 60 * 1000),
      },
    ];

    stats.topEndpoints = [
      {
        endpoint: '/api/auth/login',
        requestCount: 3420,
        blockedCount: 156,
      },
      {
        endpoint: '/api/licenses',
        requestCount: 2156,
        blockedCount: 89,
      },
      {
        endpoint: '/api/tools',
        requestCount: 1876,
        blockedCount: 45,
      },
      {
        endpoint: '/api/admin/users',
        requestCount: 1234,
        blockedCount: 23,
      },
    ];

    stats.currentLimits = [
      {
        key: 'ip:192.168.1.100:user-agent:Mozilla/5.0:/api/auth/login',
        remaining: 3,
        total: 5,
        reset: new Date(Date.now() + 2 * 60 * 1000),
        endpoint: '/api/auth/login',
      },
      {
        key: 'ip:10.0.0.50:user-agent:curl/7.68.0:/api/licenses',
        remaining: 85,
        total: 100,
        reset: new Date(Date.now() + 45 * 1000),
        endpoint: '/api/licenses',
      },
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching rate limit stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit statistics' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);