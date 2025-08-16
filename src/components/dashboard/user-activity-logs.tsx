'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { 
  Activity,
  Clock,
  Search,
  Filter,
  User,
  Key,
  CreditCard,
  MessageSquare,
  Download,
  Shield,
  Calendar
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const actionIcons: Record<string, React.ReactNode> = {
  USER_LOGIN: <User className="h-4 w-4" />,
  USER_LOGOUT: <User className="h-4 w-4" />,
  USER_REGISTER: <User className="h-4 w-4" />,
  LICENSE_CREATE: <Key className="h-4 w-4" />,
  LICENSE_ACTIVATE: <Key className="h-4 w-4" />,
  LICENSE_USE: <Key className="h-4 w-4" />,
  CREDIT_PURCHASE: <CreditCard className="h-4 w-4" />,
  CREDIT_USE: <CreditCard className="h-4 w-4" />,
  TICKET_CREATE: <MessageSquare className="h-4 w-4" />,
  TICKET_REPLY: <MessageSquare className="h-4 w-4" />,
  DOWNLOAD: <Download className="h-4 w-4" />,
  ADMIN_ACTION: <Shield className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  USER_LOGIN: 'text-green-600',
  USER_LOGOUT: 'text-blue-600',
  USER_REGISTER: 'text-purple-600',
  LICENSE_CREATE: 'text-green-600',
  LICENSE_ACTIVATE: 'text-green-600',
  LICENSE_USE: 'text-orange-600',
  CREDIT_PURCHASE: 'text-green-600',
  CREDIT_USE: 'text-red-600',
  TICKET_CREATE: 'text-blue-600',
  TICKET_REPLY: 'text-blue-600',
  DOWNLOAD: 'text-purple-600',
  ADMIN_ACTION: 'text-red-600',
};

export function UserActivityLogs() {
  const { toast, user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, [page, limit, filterAction]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filterAction) {
        params.append('action', filterAction);
      }

      const response = await fetch(`/api/user/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data: ActivityLogsResponse = await response.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
      } else {
        throw new Error('Failed to fetch activity logs');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatEntityType = (entityType: string) => {
    return entityType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entityType.toLowerCase().includes(searchLower) ||
      log.description?.toLowerCase().includes(searchLower) ||
      log.metadata?.toString().toLowerCase().includes(searchLower)
    );
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Logs</h3>
          <p className="text-sm text-muted-foreground">
            Your recent activity and system interactions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchActivityLogs}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activity logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {formatAction(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-muted ${actionColors[log.action] || 'text-gray-600'}`}>
                        {actionIcons[log.action] || <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {formatAction(log.action)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {formatEntityType(log.entityType)}
                          </Badge>
                        </div>
                        {log.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(log.createdAt)}</span>
                          </div>
                          {log.ip && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              <span>{log.ip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Select value={limit.toString()} onValueChange={(value) => {
                  setLimit(parseInt(value));
                  setPage(1);
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}