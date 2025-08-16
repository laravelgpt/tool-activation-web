'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthFetch } from '@/hooks/use-auth-fetch';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Clock,
  HardDrive,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Backup {
  id: string;
  timestamp: string;
  size: number;
  checksum: string;
  formattedSize: string;
  formattedDate: string;
}

export function BackupManagement() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const { toast } = useToast();
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await authFetch('/api/admin/backup');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch backups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const response = await authFetch('/api/admin/backup', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: 'Backup created successfully',
        });
        fetchBackups();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create backup');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite all current data and cannot be undone.')) {
      return;
    }

    setRestoring(backupId);
    try {
      const response = await authFetch(`/api/admin/backup/${backupId}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Backup restored successfully',
        });
        fetchBackups();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to restore backup');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to restore backup',
        variant: 'destructive',
      });
    } finally {
      setRestoring(null);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authFetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Backup deleted successfully',
        });
        fetchBackups();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete backup');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete backup',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    try {
      const response = await authFetch(`/api/admin/backup/${backupId}`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${data.backup.timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: 'Backup downloaded successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download backup',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Management
          </CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backup Management
        </CardTitle>
        <CardDescription>
          Create, manage, and restore system backups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">System Backups</h3>
            <p className="text-sm text-muted-foreground">
              {backups.length} backup{backups.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <Button 
            onClick={handleCreateBackup} 
            disabled={creating}
            className="w-full sm:w-auto"
          >
            {creating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            Create Backup
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Restoring a backup will overwrite all current data. 
            Make sure to create a backup before restoring if you need to preserve current data.
          </AlertDescription>
        </Alert>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Checksum</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="space-y-2">
                        <Database className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">No backups available</p>
                        <p className="text-sm text-muted-foreground">
                          Create your first backup to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((backup, index) => (
                    <motion.tr
                      key={backup.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{backup.formattedDate}</span>
                          </div>
                          <code className="text-xs text-muted-foreground">
                            {backup.id.substring(0, 8)}...
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{backup.formattedSize}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {backup.checksum.substring(0, 16)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadBackup(backup.id)}
                            title="Download backup"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreBackup(backup.id)}
                            disabled={restoring === backup.id}
                            title="Restore backup"
                          >
                            {restoring === backup.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBackup(backup.id)}
                            title="Delete backup"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Auto Backup</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatic backups are created every 24 hours
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Integrity Check</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All backups include SHA-256 checksums for verification
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Retention</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Backups are retained for 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}