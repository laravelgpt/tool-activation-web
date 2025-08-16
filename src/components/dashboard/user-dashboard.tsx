'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useAuthFetch } from '@/hooks/use-auth-fetch';
import { ProfileForm } from '@/components/profile/profile-form';
import { ToolsCatalog } from '@/components/dashboard/tools-catalog';
import { ToolManagementDashboard } from '@/components/dashboard/tool-management-dashboard';
import { DeviceManagement } from '@/components/dashboard/device-management';
import { PaymentSection } from '@/components/dashboard/payment-section';
import { TicketSystem } from '@/components/dashboard/ticket-system';
import { ReferralSystem } from '@/components/dashboard/referral-system';
import { NewsSection } from '@/components/dashboard/news-section';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import { UserActivityLogs } from '@/components/dashboard/user-activity-logs';
import { SessionManagement } from '@/components/dashboard/session-management';
import { NotificationSystem } from '@/components/ui/notification-system';
import { NavigationHeader } from '@/components/layout/navigation-header';
import { Key, CreditCard, User, Shield, Activity, Monitor, Download, Package, MessageSquare, Users, Newspaper, MonitorSmartphone } from 'lucide-react';

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

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS' | 'ADJUSTMENT' | 'REFERRAL';
  description?: string;
  createdAt: string;
}

export function UserDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const authFetch = useAuthFetch();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch licenses
      const licensesResponse = await authFetch('/api/licenses');
      if (licensesResponse.ok) {
        const licensesData = await licensesResponse.json();
        setLicenses(licensesData.licenses || []);
      }

      // Fetch credits and transactions
      const creditsResponse = await authFetch('/api/credits?transactions=true');
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json();
        setTransactions(creditsData.transactions || []);
      }

      // Fetch devices
      const devicesResponse = await authFetch('/api/devices');
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData.devices || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader title="User Dashboard" />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationSystem />
            <Badge variant="outline" className="text-sm">
              {user?.role}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="hidden sm:flex"
            >
              Refresh
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.credits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licenses.filter(l => l.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total licenses: {licenses.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.filter(d => d.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              Total devices: {devices.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Credit transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="licenses">{t('licenses')}</TabsTrigger>
          <TabsTrigger value="credits">{t('credits')}</TabsTrigger>
          <TabsTrigger value="tools">{t('tools')}</TabsTrigger>
          <TabsTrigger value="tool-management">Tool Manager</TabsTrigger>
          <TabsTrigger value="devices">{t('devices')}</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="support">{t('support')}</TabsTrigger>
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase Credits
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Activate License
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Tools
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  View Activity Log
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Licenses</CardTitle>
                <CardDescription>
                  Your latest license activations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {licenses.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No licenses found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {licenses.slice(0, 3).map((license) => (
                      <div key={license.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium text-sm">{license.tool?.name || 'General License'}</div>
                          <div className="text-xs text-muted-foreground">
                            {license.device?.name || 'Unknown Device'}
                          </div>
                        </div>
                        <Badge className={getLicenseTypeColor(license.type)}>
                          {license.type}
                        </Badge>
                      </div>
                    ))}
                    {licenses.length > 3 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          View All Licenses
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest credit transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">{transaction.description || transaction.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                      </span>
                    </div>
                  ))}
                  {transactions.length > 5 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        View All Transactions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <NewsSection />
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Licenses</CardTitle>
              <CardDescription>
                Manage your license keys and view usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No licenses found</p>
                  <Button className="mt-4">Get License</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {licenses.map((license) => (
                    <div key={license.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getLicenseTypeColor(license.type)}>
                            {license.type}
                          </Badge>
                          <Badge variant={license.active ? 'default' : 'secondary'}>
                            {license.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {formatDate(license.createdAt)}
                        </div>
                      </div>
                      
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        {license.key}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Usage:</span>
                          <span className="ml-1 font-medium">
                            {license.usageCount} / {license.usageLimit || '∞'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="ml-1 font-medium">
                            {license.expiresAt ? formatDate(license.expiresAt) : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Used:</span>
                          <span className="ml-1 font-medium">
                            {formatDate(license.lastUsedAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`ml-1 font-medium ${license.active ? 'text-green-600' : 'text-red-600'}`}>
                            {license.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {license.tool && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Tool:</span>
                          <span className="ml-1 font-medium">{license.tool.name}</span>
                        </div>
                      )}

                      {license.device && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Device:</span>
                          <span className="ml-1 font-medium">{license.device.name || 'Unknown Device'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <div className="space-y-6">
            <PaymentSection onPaymentSuccess={fetchUserData} />
            
            <ReferralSystem />
            
            <Card>
              <CardHeader>
                <CardTitle>Credit History</CardTitle>
                <CardDescription>
                  View your credit transactions and usage history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No credit transactions found</p>
                    <Button className="mt-4" onClick={() => document.querySelector('[data-value="credits"]')?.scrollIntoView()}>
                      Buy Credits
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{transaction.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <ToolsCatalog />
        </TabsContent>

        <TabsContent value="tool-management" className="space-y-4">
          <ToolManagementDashboard />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceManagement />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsSection />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <UserActivityLogs />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <TicketSystem />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          {user && <ProfileForm user={user} />}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}