'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Activity,
  Zap,
  Server,
  Network
} from 'lucide-react';
import { SystemMetrics, SystemAlert, SystemHealth } from '@/lib/system-monitor';

interface SystemMonitoringDashboardProps {
  userId: string;
  userName: string;
}

export function SystemMonitoringDashboard({ userId, userName }: SystemMonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSystemData = async () => {
    try {
      const [metricsRes, alertsRes, healthRes] = await Promise.all([
        fetch('/api/admin/system/metrics?limit=50'),
        fetch('/api/admin/system/alerts?limit=20&unresolvedOnly=true'),
        fetch('/api/admin/system/health')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.data);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.data);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/system/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy: userName })
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const latestMetrics = metrics[metrics.length - 1];
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system metrics and health monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchSystemData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Overall system health status and score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(health.status)}`}>
                  {health.status.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{health.score}%</div>
                <div className="text-sm text-muted-foreground">Health Score</div>
                <Progress value={health.score} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.values(health.checks).filter(Boolean).length}/{Object.keys(health.checks).length}
                </div>
                <div className="text-sm text-muted-foreground">Services Online</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(health.checks).map(([service, isOnline]) => (
                <Badge key={service} variant={isOnline ? "default" : "destructive"}>
                  {service}: {isOnline ? 'Online' : 'Offline'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      {latestMetrics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Usage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{latestMetrics.cpu.usage}%</div>
                  <Progress value={latestMetrics.cpu.usage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {latestMetrics.cpu.cores} cores
                  </p>
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{latestMetrics.memory.percentage}%</div>
                  <Progress value={latestMetrics.memory.percentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatBytes(latestMetrics.memory.used)} / {formatBytes(latestMetrics.memory.total)}
                  </p>
                </CardContent>
              </Card>

              {/* Disk Usage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{latestMetrics.disk.percentage}%</div>
                  <Progress value={latestMetrics.disk.percentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatBytes(latestMetrics.disk.used)} / {formatBytes(latestMetrics.disk.total)}
                  </p>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{latestMetrics.users.active}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {latestMetrics.users.newToday} new today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Network and API Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Network Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Incoming</div>
                      <div className="text-lg font-semibold">
                        {formatBytes(latestMetrics.network.incoming)}/s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Outgoing</div>
                      <div className="text-lg font-semibold">
                        {formatBytes(latestMetrics.network.outgoing)}/s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    API Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Requests/s</div>
                      <div className="text-lg font-semibold">
                        {latestMetrics.api.requestsPerSecond}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                      <div className="text-lg font-semibold">
                        {latestMetrics.api.responseTime}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                      <div className="text-lg font-semibold">
                        {latestMetrics.api.errorRate}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Database Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Connections</div>
                    <div className="text-lg font-semibold">
                      {latestMetrics.database.connections}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Query Time</div>
                    <div className="text-lg font-semibold">
                      {latestMetrics.database.queryTime}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Slow Queries</div>
                    <div className="text-lg font-semibold">
                      {latestMetrics.database.slowQueries}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Historical system performance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {metrics.slice(-20).reverse().map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">
                          {metric.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <span>CPU: {metric.cpu.usage}%</span>
                          <span>Memory: {metric.memory.percentage}%</span>
                          <span>API: {metric.api.requestsPerSecond}/s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>
                  Active system alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold">No Active Alerts</p>
                    <p className="text-muted-foreground">All systems are operating normally</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <Alert key={alert.id} className="border-l-4 border-l-red-500">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getAlertIcon(alert.type)}
                              <div className="flex-1">
                                <AlertDescription className="font-medium">
                                  {alert.message}
                                </AlertDescription>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {alert.timestamp.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Last Update Info */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleString()}
        {autoRefresh && ' • Auto refresh enabled'}
      </div>
    </div>
  );
}