'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useAuthFetch } from '@/hooks/use-auth-fetch';
import { NavigationHeader } from '@/components/layout/navigation-header';
import { AdminSessionManagement } from '@/components/admin/admin-session-management';
import { AdminAnalyticsSection } from '@/components/admin/admin-analytics-section';
import { AuditLogManagement } from '@/components/admin/audit-log-management';
import { RateLimitMonitoring } from '@/components/admin/rate-limit-monitoring';
import { SystemMonitoringDashboard } from '@/components/admin/system-monitoring-dashboard';
import { AutomatedBackupManagement } from '@/components/admin/automated-backup-management';
import ErrorTrackingDashboard from '@/components/admin/error-tracking-dashboard';
import { 
  Users, 
  Key, 
  CreditCard, 
  Monitor, 
  Settings, 
  RefreshCw, 
  Trash2, 
  Shield,
  Activity,
  Download,
  AlertTriangle,
  Cpu,
  Database,
  MonitorSmartphone
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'SUPPORT';
  credits: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface License {
  id: string;
  key: string;
  type: 'TRIAL' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
  active: boolean;
  usageCount: number;
  usageLimit: number;
  expiresAt?: string;
  createdAt: string;
  lastUsedAt?: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  device?: {
    id: string;
    name?: string;
    hwid: string;
  };
  tool?: {
    id: string;
    name: string;
  };
}

interface Device {
  id: string;
  name?: string;
  hwid: string;
  ip?: string;
  mac?: string;
  isActive: boolean;
  lastSeen?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS' | 'ADJUSTMENT' | 'REFERRAL';
  description?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const authFetch = useAuthFetch();
  const [users, setUsers] = useState<User[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newLicense, setNewLicense] = useState({
    type: 'STANDARD',
    usageLimit: 10,
    expiresAt: ''
  });
  const [creditAdjustment, setCreditAdjustment] = useState({
    amount: 0,
    type: 'ADJUSTMENT',
    description: ''
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await authFetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Fetch all licenses
      const licensesResponse = await authFetch('/api/licenses');
      if (licensesResponse.ok) {
        const licensesData = await licensesResponse.json();
        setLicenses(licensesData.licenses || []);
      }

      // Fetch all devices
      const devicesResponse = await authFetch('/api/admin/devices');
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData.devices || []);
      }

      // Fetch all transactions
      const transactionsResponse = await authFetch('/api/admin/transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLicense = async () => {
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await authFetch('/api/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          type: newLicense.type,
          usageLimit: newLicense.usageLimit,
          expiresAt: newLicense.expiresAt || undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'License created successfully',
        });
        setNewLicense({ type: 'STANDARD', usageLimit: 10, expiresAt: '' });
        fetchAdminData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create license');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create license',
        variant: 'destructive',
      });
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser || creditAdjustment.amount === 0) {
      toast({
        title: 'Error',
        description: 'Please select a user and enter an amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await authFetch('/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          amount: creditAdjustment.amount,
          type: creditAdjustment.type,
          description: creditAdjustment.description,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Credits adjusted successfully',
        });
        setCreditAdjustment({ amount: 0, type: 'ADJUSTMENT', description: '' });
        fetchAdminData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to adjust credits');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to adjust credits',
        variant: 'destructive',
      });
    }
  };

  const handleResetHWID = async (deviceId: string) => {
    if (!confirm('Are you sure you want to reset the HWID for this device? This will unbind the device from all licenses.')) {
      return;
    }

    try {
      const response = await authFetch(`/api/admin/devices/${deviceId}/reset-hwid`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'HWID reset successfully',
        });
        fetchAdminData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset HWID');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset HWID',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivateLicense = async (licenseKey: string) => {
    if (!confirm('Are you sure you want to deactivate this license?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/licenses?key=${licenseKey}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'License deactivated successfully',
        });
        fetchAdminData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deactivate license');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deactivate license',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'TRIAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'STANDARD':
        return 'bg-blue-100 text-blue-800';
      case 'PRO':
        return 'bg-green-100 text-green-800';
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
      case 'BONUS':
      case 'REFUND':
      case 'REFERRAL':
        return 'text-green-600';
      case 'USAGE':
        return 'text-red-600';
      case 'ADJUSTMENT':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p>You do not have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader title="Admin Dashboard" showAdminLink={true} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, licenses, and system settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              ADMIN
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="hidden sm:flex"
            >
              Refresh Data
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active: {users.filter(u => u.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licenses.length}</div>
            <p className="text-xs text-muted-foreground">
              Active: {licenses.filter(l => l.active).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              Active: {devices.filter(d => d.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Credit operations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="rate-limit">Rate Limit</TabsTrigger>
          <TabsTrigger value="system-monitor">System Monitor</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="error-tracking">Error Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userSelect">Select User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedUser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Create License</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="licenseType">License Type</Label>
                          <Select 
                            value={newLicense.type} 
                            onValueChange={(value) => setNewLicense(prev => ({ ...prev, type: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TRIAL">Trial</SelectItem>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="PRO">Pro</SelectItem>
                              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usageLimit">Usage Limit</Label>
                          <Input
                            id="usageLimit"
                            type="number"
                            value={newLicense.usageLimit}
                            onChange={(e) => setNewLicense(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                          <Input
                            id="expiresAt"
                            type="date"
                            value={newLicense.expiresAt}
                            onChange={(e) => setNewLicense(prev => ({ ...prev, expiresAt: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleCreateLicense} className="w-full">
                          Create License
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Adjust Credits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="creditAmount">Amount</Label>
                          <Input
                            id="creditAmount"
                            type="number"
                            value={creditAdjustment.amount}
                            onChange={(e) => setCreditAdjustment(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="creditType">Type</Label>
                          <Select 
                            value={creditAdjustment.type} 
                            onValueChange={(value) => setCreditAdjustment(prev => ({ ...prev, type: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BONUS">Bonus</SelectItem>
                              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                              <SelectItem value="REFUND">Refund</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="creditDescription">Description</Label>
                          <Input
                            id="creditDescription"
                            value={creditAdjustment.description}
                            onChange={(e) => setCreditAdjustment(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Reason for adjustment"
                          />
                        </div>
                        <Button onClick={handleAdjustCredits} className="w-full">
                          Adjust Credits
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.credits}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Licenses</CardTitle>
              <CardDescription>
                Manage all license keys and their usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Key</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {license.key.substring(0, 16)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{license.user.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{license.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLicenseTypeColor(license.type)}>
                          {license.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {license.usageCount} / {license.usageLimit || '∞'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={license.active ? 'default' : 'secondary'}>
                          {license.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {license.device ? (
                          <div className="text-sm">
                            {license.device.name || 'Unknown Device'}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {license.active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivateLicense(license.key)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Devices</CardTitle>
              <CardDescription>
                Manage all registered devices and their HWIDs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>HWID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{device.name || 'Unnamed Device'}</div>
                          <div className="text-sm text-muted-foreground">
                            Added {formatDate(device.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{device.user.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{device.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {device.hwid.substring(0, 16)}...
                        </code>
                      </TableCell>
                      <TableCell>{device.ip || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant={device.isActive ? 'default' : 'secondary'}>
                          {device.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(device.lastSeen)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetHWID(device.id)}
                            title="Reset HWID"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                View all credit transactions across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell className={getTransactionTypeColor(transaction.type)}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalyticsSection />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Tools</CardTitle>
              <CardDescription>
                Administrative tools and system management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Users:</span>
                        <span className="font-medium">{users.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Licenses:</span>
                        <span className="font-medium">{licenses.filter(l => l.active).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Credits in System:</span>
                        <span className="font-medium">{users.reduce((sum, user) => sum + user.credits, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Devices:</span>
                        <span className="font-medium">{devices.filter(d => d.isActive).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={fetchAdminData}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground">
                        {transactions.slice(0, 3).map((transaction) => (
                          <div key={transaction.id} className="py-1">
                            <div className="font-medium">{transaction.user.name || transaction.user.email}</div>
                            <div className="text-xs">
                              {transaction.type}: {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <AuditLogManagement />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <AdminSessionManagement />
        </TabsContent>

        <TabsContent value="system-monitor" className="space-y-4">
          <SystemMonitoringDashboard userId={user.id} userName={user.name || user.email} />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <AutomatedBackupManagement userId={user.id} userName={user.name || user.email} />
        </TabsContent>

        <TabsContent value="error-tracking" className="space-y-4">
          <ErrorTrackingDashboard />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}