'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Monitor, 
  Smartphone, 
  MapPin, 
  Clock, 
  LogOut, 
  Trash2, 
  AlertTriangle,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface SessionSecuritySettings {
  maxConcurrentSessions: number;
  sessionTimeoutHours: number;
  rememberMeDays: number;
  requireReauthAfterHours: number;
  suspiciousActivityThreshold: number;
  enableSessionMonitoring: boolean;
  enableAutomaticLogout: boolean;
}

export function AdminSessionManagement() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SessionSecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring'>('all');
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<SessionSecuritySettings | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecuritySettings = async () => {
    try {
      const response = await fetch('/api/auth/sessions/settings');
      if (response.ok) {
        const data = await response.json();
        setSecuritySettings(data.settings);
        setTempSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security settings',
        variant: 'destructive'
      });
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminating(sessionId);
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast({
          title: 'Session Terminated',
          description: 'The selected session has been terminated successfully'
        });
      } else {
        throw new Error('Failed to terminate session');
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast({
        title: 'Error',
        description: 'Failed to terminate session',
        variant: 'destructive'
      });
    } finally {
      setTerminating(null);
    }
  };

  const terminateAllUserSessions = async (userId: string) => {
    setTerminating(`user-${userId}`);
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, terminateAll: true })
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.userId !== userId));
        toast({
          title: 'User Sessions Terminated',
          description: 'All sessions for the selected user have been terminated'
        });
      } else {
        throw new Error('Failed to terminate user sessions');
      }
    } catch (error) {
      console.error('Failed to terminate user sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to terminate user sessions',
        variant: 'destructive'
      });
    } finally {
      setTerminating(null);
    }
  };

  const cleanupExpiredSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions?cleanup=true');
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Cleanup Completed',
          description: `${data.cleanedCount} expired sessions have been cleaned up`
        });
        loadSessions();
      } else {
        throw new Error('Failed to cleanup sessions');
      }
    } catch (error) {
      console.error('Failed to cleanup sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to cleanup expired sessions',
        variant: 'destructive'
      });
    }
  };

  const updateSecuritySettings = async () => {
    if (!tempSettings) return;

    try {
      const response = await fetch('/api/auth/sessions/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempSettings)
      });

      if (response.ok) {
        setSecuritySettings(tempSettings);
        setEditingSettings(false);
        toast({
          title: 'Settings Updated',
          description: 'Session security settings have been updated successfully'
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update security settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update security settings',
        variant: 'destructive'
      });
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceType = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) {
      return 'Mobile';
    }
    return 'Desktop';
  };

  const isSessionExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const timeUntilExpiry = new Date(expiresAt).getTime() - now.getTime();
    return timeUntilExpiry < 2 * 60 * 60 * 1000; // 2 hours
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.deviceInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress.includes(searchTerm);

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && session.isActive) ||
      (filterStatus === 'expiring' && isSessionExpiringSoon(session.expiresAt));

    return matchesSearch && matchesFilter;
  });

  const groupedSessions = filteredSessions.reduce((acc, session) => {
    if (!acc[session.userId]) {
      acc[session.userId] = [];
    }
    acc[session.userId].push(session);
    return acc;
  }, {} as Record<string, SessionInfo[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Session Management
          </CardTitle>
          <CardDescription>Loading session data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Session Management
              </CardTitle>
              <CardDescription>
                Monitor and manage all user sessions across the platform
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSessions}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cleanupExpiredSessions}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup Expired
              </Button>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={loadSecuritySettings}>
                    <Settings className="h-4 w-4" />
                    Security Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Session Security Settings</DialogTitle>
                    <DialogDescription>
                      Configure global session security settings
                    </DialogDescription>
                  </DialogHeader>
                  {securitySettings && tempSettings && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Max Concurrent Sessions</label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={tempSettings.maxConcurrentSessions}
                            onChange={(e) => setTempSettings(prev => prev ? ({
                              ...prev,
                              maxConcurrentSessions: parseInt(e.target.value) || 5
                            }) : null)}
                            disabled={!editingSettings}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Session Timeout (hours)</label>
                          <Input
                            type="number"
                            min="1"
                            max="168"
                            value={tempSettings.sessionTimeoutHours}
                            onChange={(e) => setTempSettings(prev => prev ? ({
                              ...prev,
                              sessionTimeoutHours: parseInt(e.target.value) || 24
                            }) : null)}
                            disabled={!editingSettings}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Remember Me Duration (days)</label>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={tempSettings.rememberMeDays}
                            onChange={(e) => setTempSettings(prev => prev ? ({
                              ...prev,
                              rememberMeDays: parseInt(e.target.value) || 30
                            }) : null)}
                            disabled={!editingSettings}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Re-auth Required (hours)</label>
                          <Input
                            type="number"
                            min="1"
                            max="168"
                            value={tempSettings.requireReauthAfterHours}
                            onChange={(e) => setTempSettings(prev => prev ? ({
                              ...prev,
                              requireReauthAfterHours: parseInt(e.target.value) || 8
                            }) : null)}
                            disabled={!editingSettings}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Session Monitoring</span>
                          <CheckCircle className={`h-4 w-4 ${tempSettings.enableSessionMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Automatic Logout</span>
                          <CheckCircle className={`h-4 w-4 ${tempSettings.enableAutomaticLogout ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        {editingSettings ? (
                          <>
                            <Button variant="outline" onClick={() => {
                              setEditingSettings(false);
                              setTempSettings(securitySettings);
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={updateSecuritySettings}>
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => setEditingSettings(true)}>
                            Edit Settings
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user, device, or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>

            {Object.keys(groupedSessions).length === 0 ? (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sessions found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSessions).map(([userId, userSessions]) => (
                  <div key={userId} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <h4 className="font-medium">
                          {userSessions[0]?.user?.name || 'Unknown User'}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {userSessions[0]?.user?.role || 'user'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {userSessions[0]?.user?.email}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => terminateAllUserSessions(userId)}
                        disabled={terminating === `user-${userId}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Terminate All
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      <AnimatePresence>
                        {userSessions.map((session, index) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getDeviceIcon(session.userAgent)}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">
                                        {getDeviceType(session.userAgent)}
                                      </h4>
                                      {isSessionExpiringSoon(session.expiresAt) && (
                                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                                          Expiring Soon
                                        </Badge>
                                      )}
                                      {!session.isActive && (
                                        <Badge variant="secondary" className="text-xs">
                                          Inactive
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {session.deviceInfo}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {session.location || 'Unknown'}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Last active {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right text-xs text-muted-foreground">
                                    <p>Expires {formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true })}</p>
                                    <p className="text-xs">IP: {session.ipAddress}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => terminateSession(session.id)}
                                    disabled={terminating === session.id}
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Admin session management allows you to monitor and terminate any user session. 
                Use this power responsibly and only when necessary for security purposes.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}