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
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

export function SessionManagement() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SessionSecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
        setSecuritySettings(data.securitySettings);
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

  const terminateSession = async (sessionId: string) => {
    setTerminating(sessionId);
    try {
      const response = await fetch('/api/auth/sessions', {
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

  const terminateAllSessions = async () => {
    setTerminating('all');
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terminateAll: true })
      });

      if (response.ok) {
        setSessions([]);
        toast({
          title: 'All Sessions Terminated',
          description: 'All your active sessions have been terminated'
        });
      } else {
        throw new Error('Failed to terminate sessions');
      }
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to terminate all sessions',
        variant: 'destructive'
      });
    } finally {
      setTerminating(null);
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

  const isCurrentSession = (session: SessionInfo) => {
    // This is a simplified check - in production, you'd compare with the current session ID
    return sessions.length > 0 && session.id === sessions[0].id;
  };

  const isSessionExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const timeUntilExpiry = new Date(expiresAt).getTime() - now.getTime();
    return timeUntilExpiry < 2 * 60 * 60 * 1000; // 2 hours
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
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
                Session Management
              </CardTitle>
              <CardDescription>
                Manage your active sessions and security settings
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
              {securitySettings && (
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Session Security Settings</DialogTitle>
                      <DialogDescription>
                        Configure session security preferences (admin only)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Max Concurrent Sessions</label>
                          <p className="text-sm text-muted-foreground">
                            {securitySettings.maxConcurrentSessions}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Session Timeout</label>
                          <p className="text-sm text-muted-foreground">
                            {securitySettings.sessionTimeoutHours} hours
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Remember Me Duration</label>
                          <p className="text-sm text-muted-foreground">
                            {securitySettings.rememberMeDays} days
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Re-auth Required</label>
                          <p className="text-sm text-muted-foreground">
                            {securitySettings.requireReauthAfterHours} hours
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${securitySettings.enableSessionMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className="text-sm">Session Monitoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${securitySettings.enableAutomaticLogout ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className="text-sm">Automatic Logout</span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={terminateAllSessions}
                  disabled={terminating === 'all'}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Terminate All
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`p-4 ${isCurrentSession(session) ? 'border-primary' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(session.userAgent)}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {getDeviceType(session.userAgent)}
                                </h4>
                                {isCurrentSession(session) && (
                                  <Badge variant="default" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                                {isSessionExpiringSoon(session.expiresAt) && (
                                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                                    Expiring Soon
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
                            {!isCurrentSession(session) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => terminateSession(session.id)}
                                disabled={terminating === session.id}
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  For security reasons, we recommend terminating sessions on devices you no longer use or recognize.
                  If you see any suspicious activity, terminate all sessions immediately.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}