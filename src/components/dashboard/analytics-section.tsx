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
  CreditCard, 
  Key, 
  Users,
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  stats: {
    totalLicenses: number;
    activeLicenses: number;
    totalCreditsUsed: number;
    totalCreditsPurchased: number;
    totalReferralBonus: number;
    mostUsedTool: Record<string, number>;
    dailyUsage: Record<string, number>;
  };
  period: string;
  startDate: string;
  endDate: string;
}

export function AnalyticsSection() {
  const { toast, user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`/api/analytics?period=${period}`, {
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
        description: 'Failed to fetch analytics data',
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

  const getTopTools = () => {
    if (!analytics?.stats.mostUsedTool) return [];
    return Object.entries(analytics.stats.mostUsedTool)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getDailyUsageData = () => {
    if (!analytics?.stats.dailyUsage) return [];
    return Object.entries(analytics.stats.dailyUsage)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7); // Last 7 days
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track your usage patterns and statistics
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenses Created</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stats.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.stats.activeLicenses} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stats.totalCreditsUsed}</div>
            <p className="text-xs text-muted-foreground">
              Total usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Purchased</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stats.totalCreditsPurchased}</div>
            <p className="text-xs text-muted-foreground">
              Total purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Bonus</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stats.totalReferralBonus}</div>
            <p className="text-xs text-muted-foreground">
              Total earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Usage
            </CardTitle>
            <CardDescription>
              Credit usage over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getDailyUsageData().map(([date, usage]) => (
                <div key={date} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((usage / Math.max(...getDailyUsageData().map(([,u]) => u))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{usage}</span>
                  </div>
                </div>
              ))}
              {getDailyUsageData().length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No usage data available for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Most Used Tools
            </CardTitle>
            <CardDescription>
              Your most frequently used tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTopTools().map(([tool, count]) => (
                <div key={tool} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tool}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(count / Math.max(...getTopTools().map(([,c]) => c))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count} uses
                    </Badge>
                  </div>
                </div>
              ))}
              {getTopTools().length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No tool usage data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            {getPeriodLabel(period)} • {new Date(analytics.startDate).toLocaleDateString()} - {new Date(analytics.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                +{analytics.stats.totalCreditsPurchased}
              </div>
              <div className="text-sm text-muted-foreground">Credits Added</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                -{analytics.stats.totalCreditsUsed}
              </div>
              <div className="text-sm text-muted-foreground">Credits Used</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.stats.totalCreditsPurchased - analytics.stats.totalCreditsUsed}
              </div>
              <div className="text-sm text-muted-foreground">Net Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}