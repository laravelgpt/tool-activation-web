'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, AlertTriangle, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useAuthFetch } from '@/hooks/use-auth-fetch';

interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  topBlockedIPs: Array<{
    ip: string;
    blockedCount: number;
    totalRequests: number;
    lastBlocked: Date;
  }>;
  topEndpoints: Array<{
    endpoint: string;
    requestCount: number;
    blockedCount: number;
  }>;
  currentLimits: Array<{
    key: string;
    remaining: number;
    total: number;
    reset: Date;
    endpoint: string;
  }>;
}

export function RateLimitMonitoring() {
  const { user } = useAuth();
  const { toast } = useToast();
  const authFetch = useAuthFetch();
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/rate-limit/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error('Failed to fetch rate limit stats');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch rate limit statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getTimeUntilReset = (reset: Date) => {
    const now = new Date();
    const resetDate = new Date(reset);
    const diff = resetDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Reset now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">No rate limit statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.blockedRequests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.blockedRequests, stats.totalRequests)} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Block Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(stats.blockedRequests, stats.totalRequests)}
            </div>
            <Progress 
              value={stats.totalRequests > 0 ? (stats.blockedRequests / stats.totalRequests) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Current Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Active Rate Limits
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Current rate limit status for active connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.currentLimits.map((limit, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{limit.endpoint}</span>
                    <Badge variant={limit.remaining > limit.total * 0.2 ? 'default' : 'destructive'}>
                      {limit.remaining}/{limit.total}
                    </Badge>
                  </div>
                  <Progress 
                    value={(limit.remaining / limit.total) * 100} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>Key: {limit.key}</span>
                    <span>Resets in: {getTimeUntilReset(limit.reset)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {stats.currentLimits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active rate limits found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Blocked IPs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Blocked IPs</CardTitle>
          <CardDescription>
            IP addresses with the most rate limit violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Blocked Requests</TableHead>
                  <TableHead>Total Requests</TableHead>
                  <TableHead>Block Rate</TableHead>
                  <TableHead>Last Blocked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topBlockedIPs.map((ip, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{ip.ip}</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {ip.blockedCount.toLocaleString()}
                    </TableCell>
                    <TableCell>{ip.totalRequests.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(ip.blockedCount / ip.totalRequests) * 100} 
                          className="w-20 h-2"
                        />
                        <span className="text-sm">
                          {formatPercentage(ip.blockedCount, ip.totalRequests)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(ip.lastBlocked)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
          <CardDescription>
            Most frequently accessed API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Total Requests</TableHead>
                  <TableHead>Blocked Requests</TableHead>
                  <TableHead>Block Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topEndpoints.map((endpoint, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {endpoint.endpoint}
                    </TableCell>
                    <TableCell className="font-medium">
                      {endpoint.requestCount.toLocaleString()}
                    </TableCell>
                    <TableCell className={endpoint.blockedCount > 0 ? 'text-red-600' : ''}>
                      {endpoint.blockedCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={endpoint.requestCount > 0 ? (endpoint.blockedCount / endpoint.requestCount) * 100 : 0} 
                          className="w-20 h-2"
                        />
                        <span className="text-sm">
                          {formatPercentage(endpoint.blockedCount, endpoint.requestCount)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}