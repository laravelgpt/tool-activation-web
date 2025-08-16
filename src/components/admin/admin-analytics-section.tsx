'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  CreditCard,
  Key,
  Monitor,
  MessageSquare,
  Newspaper,
  Activity,
  Calendar,
  Target,
  Award
} from 'lucide-react';

interface AdminAnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalLicenses: number;
    activeLicenses: number;
    totalDevices: number;
    activeDevices: number;
    totalTransactions: number;
    totalPayments: number;
    completedPayments: number;
    totalTickets: number;
    openTickets: number;
    totalNews: number;
    publishedNews: number;
  };
  periodStats: {
    newUsers: number;
    newLicenses: number;
    periodTransactions: number;
    periodPayments: number;
    periodCompletedPayments: number;
    periodTickets: number;
    periodNews: number;
  };
  financial: {
    totalRevenue: number;
    averagePayment: number;
    totalPayments: number;
    completedRevenue: number;
    completedPayments: number;
    conversionRate: number;
  };
  userActivity: any[];
  licenseUsage: any[];
  paymentMethods: any[];
  topUsers: {
    byCredits: any[];
    byReferrals: any[];
  };
  period: string;
  startDate: string;
  endDate: string;
}

export function AdminAnalyticsSection() {
  const { toast, user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [period, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 7 days';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics || user?.role !== 'ADMIN') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Access denied</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Admin Analytics</h3>
          <p className="text-sm text-muted-foreground">
            System-wide statistics and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.activeLicenses} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.financial.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.financial.averagePayment)} avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.totalTickets} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Period Statistics
          </CardTitle>
          <CardDescription>
            {getPeriodLabel(period)} • {new Date(analytics.startDate).toLocaleDateString()} - {new Date(analytics.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.periodStats.newUsers}</div>
              <div className="text-sm text-muted-foreground">New Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.periodStats.newLicenses}</div>
              <div className="text-sm text-muted-foreground">New Licenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.periodStats.periodPayments}</div>
              <div className="text-sm text-muted-foreground">Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{analytics.periodStats.periodTickets}</div>
              <div className="text-sm text-muted-foreground">Support Tickets</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Performance
            </CardTitle>
            <CardDescription>
              Revenue and conversion metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Revenue</span>
                <span className="font-bold">{formatCurrency(analytics.financial.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(analytics.financial.completedRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Conversion Rate</span>
                <span className="font-bold">{formatPercentage(analytics.financial.conversionRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Payment</span>
                <span className="font-bold">{formatCurrency(analytics.financial.averagePayment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Payment method distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.paymentMethods.map((method) => (
                <div key={method.method} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{method.method}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(method._count._all / Math.max(...analytics.paymentMethods.map(m => m._count._all))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {method._count._all}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Users by Credits
            </CardTitle>
            <CardDescription>
              Users with the highest credit balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topUsers.byCredits.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.name || user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.referralsCount} referrals
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{user.credits} credits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Users by Referrals
            </CardTitle>
            <CardDescription>
              Users with the most successful referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topUsers.byReferrals.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.name || user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.credits} credits
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{user.referralsCount} referrals</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}