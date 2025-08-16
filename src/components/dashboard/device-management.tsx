'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useAuthFetch } from '@/hooks/use-auth-fetch';
import { Trash2, Settings, Monitor, Smartphone, Tablet } from 'lucide-react';

interface Device {
  id: string;
  name?: string;
  hwid: string;
  ip?: string;
  mac?: string;
  isActive: boolean;
  lastSeen?: string;
  createdAt: string;
  deviceInfo?: any;
}

export function DeviceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const authFetch = useAuthFetch();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    hwid: '',
    mac: '',
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch devices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDevice.hwid.trim()) {
      toast({
        title: 'Error',
        description: 'HWID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await authFetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Device added successfully',
        });
        setShowAddDialog(false);
        setNewDevice({ name: '', hwid: '', mac: '' });
        fetchDevices();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add device');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add device',
        variant: 'destructive',
      });
    }
  };

  const handleToggleDevice = async (deviceId: string, action: 'activate' | 'deactivate') => {
    try {
      const response = await authFetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Device ${action}d successfully`,
        });
        fetchDevices();
      } else {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} device`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} device`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authFetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Device deleted successfully',
        });
        fetchDevices();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete device');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete device',
        variant: 'destructive',
      });
    }
  };

  const getDeviceIcon = (deviceInfo?: any) => {
    if (deviceInfo?.type === 'smartphone') return <Smartphone className="h-4 w-4" />;
    if (deviceInfo?.type === 'tablet') return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Device Management</h2>
          <p className="text-muted-foreground">
            Manage your registered devices and their access permissions
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>Add Device</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Register a new device to your account for license activation
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name (Optional)</Label>
                <Input
                  id="deviceName"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Computer, Phone, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceHwid">HWID *</Label>
                <Input
                  id="deviceHwid"
                  value={newDevice.hwid}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, hwid: e.target.value }))}
                  placeholder="Enter device hardware ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceMac">MAC Address (Optional)</Label>
                <Input
                  id="deviceMac"
                  value={newDevice.mac}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, mac: e.target.value }))}
                  placeholder="00:00:00:00:00:00"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Device</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No devices registered</h3>
            <p className="text-muted-foreground mb-4">
              Register your first device to start using licenses and tools
            </p>
            <Button onClick={() => setShowAddDialog(true)}>Add Your First Device</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registered Devices</CardTitle>
            <CardDescription>
              View and manage all devices registered to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>HWID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.deviceInfo)}
                        <div>
                          <div className="font-medium">{device.name || 'Unnamed Device'}</div>
                          <div className="text-sm text-muted-foreground">
                            Added {formatDate(device.createdAt)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {device.hwid.substring(0, 16)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={device.isActive ? 'default' : 'secondary'}>
                        {device.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(device.lastSeen)}</TableCell>
                    <TableCell>{device.ip || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleDevice(device.id, device.isActive ? 'deactivate' : 'activate')}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}