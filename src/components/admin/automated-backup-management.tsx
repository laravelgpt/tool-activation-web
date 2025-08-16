'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  HardDrive, 
  Clock, 
  Play, 
  Pause, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Activity,
  Shield,
  Server,
  Cloud,
  FileText,
  BarChart3
} from 'lucide-react';
import { BackupConfig, BackupJob, BackupVerification } from '@/lib/automated-backup';

interface AutomatedBackupManagementProps {
  userId: string;
  userName: string;
}

export function AutomatedBackupManagement({ userId, userName }: AutomatedBackupManagementProps) {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [verifications, setVerifications] = useState<BackupVerification[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<BackupConfig | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [newConfig, setNewConfig] = useState({
    name: '',
    type: 'database' as const,
    schedule: 'daily' as const,
    enabled: true,
    retention: 30,
    compression: true,
    encryption: true,
    destination: 'local' as const,
    destinationConfig: '{}',
  });

  const fetchData = async () => {
    try {
      const [configsRes, jobsRes, verificationsRes, statsRes] = await Promise.all([
        fetch('/api/admin/backup/configs'),
        fetch('/api/admin/backup/jobs'),
        fetch('/api/admin/backup/verifications'),
        fetch('/api/admin/backup/stats'),
      ]);

      if (configsRes.ok) {
        const configsData = await configsRes.json();
        setConfigs(configsData.data);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.data);
      }

      if (verificationsRes.ok) {
        const verificationsData = await verificationsRes.json();
        setVerifications(verificationsData.data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async () => {
    try {
      const response = await fetch('/api/admin/backup/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newConfig,
          destinationConfig: JSON.parse(newConfig.destinationConfig),
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewConfig({
          name: '',
          type: 'database',
          schedule: 'daily',
          enabled: true,
          retention: 30,
          compression: true,
          encryption: true,
          destination: 'local',
          destinationConfig: '{}',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating backup config:', error);
    }
  };

  const updateConfig = async (configId: string, updates: Partial<BackupConfig>) => {
    try {
      const response = await fetch(`/api/admin/backup/configs/${configId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating backup config:', error);
    }
  };

  const deleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this backup configuration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backup/configs/${configId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting backup config:', error);
    }
  };

  const runBackupNow = async (configId: string) => {
    try {
      const response = await fetch('/api/admin/backup/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error running backup:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
      case 'active':
        return 'text-green-600';
      case 'running':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'paused':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Automated Backup System</h2>
          <p className="text-muted-foreground">
            Manage backup configurations, schedules, and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Create Config
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Backup Configuration</DialogTitle>
                <DialogDescription>
                  Configure a new automated backup schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Configuration Name</Label>
                    <Input
                      id="name"
                      value={newConfig.name}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Daily Database Backup"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Backup Type</Label>
                    <Select 
                      value={newConfig.type} 
                      onValueChange={(value: any) => setNewConfig(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="full">Full System</SelectItem>
                        <SelectItem value="incremental">Incremental</SelectItem>
                        <SelectItem value="files">Files</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Select 
                      value={newConfig.schedule} 
                      onValueChange={(value: any) => setNewConfig(prev => ({ ...prev, schedule: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retention">Retention (days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={newConfig.retention}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, retention: parseInt(e.target.value) }))}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Select 
                      value={newConfig.destination} 
                      onValueChange={(value: any) => setNewConfig(prev => ({ ...prev, destination: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationConfig">Destination Config</Label>
                    <Textarea
                      id="destinationConfig"
                      value={newConfig.destinationConfig}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, destinationConfig: e.target.value }))}
                      placeholder='{"path": "./backups"}'
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enabled"
                      checked={newConfig.enabled}
                      onCheckedChange={(checked) => setNewConfig(prev => ({ ...prev, enabled: checked }))}
                    />
                    <Label htmlFor="enabled">Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compression"
                      checked={newConfig.compression}
                      onCheckedChange={(checked) => setNewConfig(prev => ({ ...prev, compression: checked }))}
                    />
                    <Label htmlFor="compression">Compression</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption"
                      checked={newConfig.encryption}
                      onCheckedChange={(checked) => setNewConfig(prev => ({ ...prev, encryption: checked }))}
                    />
                    <Label htmlFor="encryption">Encryption</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createConfig}>
                    Create Configuration
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configs</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConfigs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.enabledConfigs} enabled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backup Jobs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.failedJobs} failed, {stats.runningJobs} running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verifications</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.passedVerifications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.failedVerifications} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
              <p className="text-xs text-muted-foreground">
                All backups combined
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="configs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="jobs">Backup Jobs</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Configurations</CardTitle>
              <CardDescription>
                Manage automated backup schedules and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configs.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold">No backup configurations</p>
                    <p className="text-muted-foreground">Create your first backup configuration to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {configs.map((config) => (
                      <Card key={config.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">{config.name}</h3>
                                <Badge variant={config.enabled ? "default" : "secondary"}>
                                  {config.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                                <Badge variant="outline">{config.type}</Badge>
                                <Badge variant="outline">{config.schedule}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                  <span>Retention: {config.retention} days</span>
                                  <span>Compression: {config.compression ? 'Yes' : 'No'}</span>
                                  <span>Encryption: {config.encryption ? 'Yes' : 'No'}</span>
                                  <span>Destination: {config.destination}</span>
                                </div>
                                {config.nextRun && (
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Next run: {config.nextRun.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runBackupNow(config.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Run Now
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateConfig(config.id, { enabled: !config.enabled })}
                              >
                                {config.enabled ? (
                                  <>
                                    <Pause className="h-4 w-4 mr-1" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-1" />
                                    Enable
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteConfig(config.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Jobs</CardTitle>
              <CardDescription>
                View backup job history and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Config</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-semibold">No backup jobs</p>
                          <p className="text-muted-foreground">Run a backup to see job history</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobs.map((job) => {
                        const config = configs.find(c => c.id === job.configId);
                        const duration = job.endTime ? job.endTime.getTime() - job.startTime.getTime() : null;
                        
                        return (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{config?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(job.status)}
                                <span className={getStatusColor(job.status)}>
                                  {job.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{job.startTime.toLocaleString()}</TableCell>
                            <TableCell>{duration ? formatDuration(duration) : '-'}</TableCell>
                            <TableCell>{job.size ? formatBytes(job.size) : '-'}</TableCell>
                            <TableCell>{job.fileCount || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{job.location || '-'}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Verifications</CardTitle>
              <CardDescription>
                View backup integrity verification results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Backup Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Integrity</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Checksum</TableHead>
                      <TableHead>Restore</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-semibold">No verifications</p>
                          <p className="text-muted-foreground">Verifications run automatically after backups</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      verifications.map((verification) => {
                        const job = jobs.find(j => j.id === verification.backupJobId);
                        const duration = verification.endTime ? verification.endTime.getTime() - verification.startTime.getTime() : null;
                        
                        return (
                          <TableRow key={verification.id}>
                            <TableCell className="font-medium">{job?.configId || 'Unknown'}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(verification.status)}
                                <span className={getStatusColor(verification.status)}>
                                  {verification.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{verification.startTime.toLocaleString()}</TableCell>
                            <TableCell>{duration ? formatDuration(duration) : '-'}</TableCell>
                            <TableCell>
                              {verification.checks.integrity ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              {verification.checks.size ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              {verification.checks.checksum ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              {verification.checks.restore ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Backup Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                      <div className="text-lg font-semibold">
                        {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
                      </div>
                      <Progress 
                        value={stats.totalJobs > 0 ? (stats.completedJobs / stats.totalJobs) * 100 : 0} 
                        className="mt-2" 
                      />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Verification Rate</div>
                      <div className="text-lg font-semibold">
                        {stats.totalVerifications > 0 ? Math.round((stats.passedVerifications / stats.totalVerifications) * 100) : 0}%
                      </div>
                      <Progress 
                        value={stats.totalVerifications > 0 ? (stats.passedVerifications / stats.totalVerifications) * 100 : 0} 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                  
                  {stats.lastBackup && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground">Last Backup</div>
                      <div className="text-sm">
                        <div>{stats.lastBackup.startTime.toLocaleString()}</div>
                        <div className="text-muted-foreground">
                          {stats.lastBackup.status} • {stats.lastBackup.size ? formatBytes(stats.lastBackup.size) : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Active Jobs</div>
                      <div className="text-lg font-semibold">{stats.runningJobs}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Failed Jobs</div>
                      <div className="text-lg font-semibold text-red-600">{stats.failedJobs}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Pending Verifications</div>
                      <div className="text-lg font-semibold">
                        {verifications.filter(v => v.status === 'pending').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Failed Verifications</div>
                      <div className="text-lg font-semibold text-red-600">{stats.failedVerifications}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">Storage Used</div>
                    <div className="text-lg font-semibold">{formatBytes(stats.totalSize)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}