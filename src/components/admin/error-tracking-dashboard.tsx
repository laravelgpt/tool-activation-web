'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';

interface ErrorEvent {
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

interface ErrorStats {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  topErrors: Array<{ message: string; count: number }>;
}

interface ErrorRule {
  id: string;
  name: string;
  description: string;
  conditions: any;
  actions: any;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ErrorTrackingDashboard() {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [rules, setRules] = useState<ErrorRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    type: '',
    severity: '',
    resolved: '',
    search: '',
    timeRange: '24h'
  });

  const fetchErrors = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/errors?${params}`);
      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/error-rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error('Failed to fetch error rules:', error);
    }
  };

  const resolveError = async (errorId: string, resolution: string) => {
    try {
      const response = await fetch(`/api/admin/errors/${errorId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      });

      if (response.ok) {
        await fetchErrors();
      }
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const refreshData = () => {
    setLoading(true);
    Promise.all([fetchErrors(), fetchRules()]).finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, [filters]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      case 'system': return <XCircle className="h-4 w-4" />;
      case 'performance': return <Clock className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Error Tracking</h1>
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Error Tracking</h1>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalErrors}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.errorsBySeverity.critical || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {stats.errorsByType.security || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Security-related errors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {errors.filter(e => e.resolved).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully resolved
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search errors..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.resolved} onValueChange={(value) => setFilters({ ...filters, resolved: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="false">Unresolved</SelectItem>
                <SelectItem value="true">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.timeRange} onValueChange={(value) => setFilters({ ...filters, timeRange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="errors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="errors">Errors ({errors.length})</TabsTrigger>
          <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Events</CardTitle>
              <CardDescription>
                Recent error events and system issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-4">
                  {errors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No errors found matching your filters
                    </div>
                  ) : (
                    errors.map((error) => (
                      <Card key={error.id} className={error.resolved ? 'opacity-60' : ''}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between space-x-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getTypeIcon(error.type)}
                                <Badge variant={getLevelColor(error.level)}>
                                  {error.level.toUpperCase()}
                                </Badge>
                                <Badge variant={getSeverityColor(error.severity)}>
                                  {error.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  {error.type}
                                </Badge>
                                {error.resolved && (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolved
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-semibold">{error.message}</h3>
                              
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Route: {error.route || 'Unknown'}</p>
                                <p>Count: {error.count} occurrences</p>
                                <p>Last seen: {new Date(error.lastSeen).toLocaleString()}</p>
                                {error.userId && <p>User: {error.userId}</p>}
                                {error.ipAddress && <p>IP: {error.ipAddress}</p>}
                              </div>

                              {error.context && Object.keys(error.context).length > 0 && (
                                <details className="text-sm">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    Context Information
                                  </summary>
                                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {JSON.stringify(error.context, null, 2)}
                                  </pre>
                                </details>
                              )}

                              {error.stackTrace && (
                                <details className="text-sm">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    Stack Trace
                                  </summary>
                                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {error.stackTrace}
                                  </pre>
                                </details>
                              )}

                              {error.resolved && (
                                <Alert>
                                  <CheckCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>Resolved by {error.resolvedBy}</strong> on {error.resolvedAt ? new Date(error.resolvedAt).toLocaleString() : 'Unknown'}
                                    <br />
                                    {error.resolution}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            {!error.resolved && (
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const resolution = prompt('Enter resolution details:');
                                    if (resolution) {
                                      resolveError(error.id, resolution);
                                    }
                                  }}
                                >
                                  Resolve
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Rules</CardTitle>
              <CardDescription>
                Automated error handling and alerting rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No error rules configured
                  </div>
                ) : (
                  rules.map((rule) => (
                    <Card key={rule.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{rule.name}</h3>
                              <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                                {rule.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                            
                            <div className="text-sm space-y-1">
                              <details>
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Conditions
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(rule.conditions, null, 2)}
                                </pre>
                              </details>
                              
                              <details>
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Actions
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(rule.actions, null, 2)}
                                </pre>
                              </details>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Errors by Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.errorsByLevel).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="capitalize">{level}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalErrors) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Errors by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.errorsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalErrors) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topErrors.map((error, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm truncate flex-1 mr-2">{error.message}</span>
                        <Badge variant="outline">{error.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Errors by Severity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.errorsBySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <span className="capitalize">{severity}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                severity === 'critical' ? 'bg-red-500' :
                                severity === 'high' ? 'bg-orange-500' :
                                severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(count / stats.totalErrors) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}