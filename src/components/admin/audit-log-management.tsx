'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Search, Filter, RefreshCw, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useAuthFetch } from '@/hooks/use-auth-fetch';
import { AuditLogEntry, AuditLogFilters } from '@/lib/audit-logger';

interface AuditLogStats {
  totalLogs: number;
  logsBySeverity: Record<string, number>;
  logsByAction: Record<string, number>;
  logsByUser: Array<{ userId: string; email: string; count: number }>;
  topEntities: Array<{ entityType: string; entityId: string; count: number }>;
}

export function AuditLogManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const authFetch = useAuthFetch();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: 50,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchLogs();
      fetchStats();
    }
  }, [user, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/admin/audit-logs?${new URLSearchParams(filters as any)}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      } else {
        throw new Error('Failed to fetch audit logs');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/admin/audit-logs/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit log stats:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await authFetch(`/api/admin/audit-logs/export?format=${format}`);
      if (response.ok) {
        const data = await response.text();
        const blob = new Blob([data], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: `Audit logs exported as ${format.toUpperCase()}`,
        });
      } else {
        throw new Error('Failed to export audit logs');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export audit logs',
        variant: 'destructive',
      });
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to clean up old audit logs? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authFetch('/api/admin/audit-logs/cleanup', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Cleaned up ${data.deletedCount} old audit logs`,
        });
        fetchLogs();
        fetchStats();
      } else {
        throw new Error('Failed to cleanup audit logs');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cleanup audit logs',
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'ERROR':
        return 'bg-orange-100 text-orange-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm:ss');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.logsBySeverity.CRITICAL || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Events</CardTitle>
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.logsBySeverity.ERROR || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning Events</CardTitle>
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.logsBySeverity.WARNING || 0}
              </div>
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
          <CardDescription>Filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                placeholder="Filter by action..."
                value={filters.action || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Input
                id="entityType"
                placeholder="Filter by entity type..."
                value={filters.entityType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={filters.severity || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Severities</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({ limit: 50, offset: 0 });
                    fetchLogs();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanup}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Old Logs
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {logs.length} of {total} logs
        </div>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>System audit trail and security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.user?.email || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{log.user?.name || ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {log.action}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.entityId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.description || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip || '-'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about this audit event
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">ID</Label>
                                  <p className="font-mono text-sm">{selectedLog.id}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Timestamp</Label>
                                  <p className="text-sm">{formatDate(selectedLog.timestamp)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">User</Label>
                                  <p className="text-sm">{selectedLog.user?.email || 'Unknown'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Severity</Label>
                                  <Badge className={getSeverityColor(selectedLog.severity)}>
                                    {selectedLog.severity}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Action</Label>
                                <p className="font-mono text-sm bg-muted p-2 rounded">
                                  {selectedLog.action}
                                </p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Entity</Label>
                                <p className="text-sm">
                                  {selectedLog.entityType}
                                  {selectedLog.entityId && (
                                    <span className="font-mono text-muted-foreground ml-2">
                                      ({selectedLog.entityId})
                                    </span>
                                  )}
                                </p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm">{selectedLog.description || 'No description'}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">IP Address</Label>
                                <p className="font-mono text-sm">{selectedLog.ip || 'Not available'}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">User Agent</Label>
                                <p className="text-sm break-all">{selectedLog.userAgent || 'Not available'}</p>
                              </div>
                              
                              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Metadata</Label>
                                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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