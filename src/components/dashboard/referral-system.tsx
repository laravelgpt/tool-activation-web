'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  CheckCircle, 
  TrendingUp,
  UserPlus,
  CreditCard
} from 'lucide-react';

interface ReferralData {
  referralCode?: string;
  referredBy?: {
    id: string;
    email: string;
    name?: string;
  };
  referrals: Array<{
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    credits: number;
  }>;
  stats: {
    totalReferrals: number;
    totalCreditsEarned: number;
    totalTransactions: number;
  };
}

export function ReferralSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/referrals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: 'Referral code generated successfully',
        });
        fetchReferralData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to generate referral code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate referral code',
        variant: 'destructive',
      });
    }
  };

  const copyReferralLink = () => {
    if (!referralData?.referralCode) return;
    
    const referralLink = `${window.location.origin}?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const shareReferralLink = async () => {
    if (!referralData?.referralCode) return;
    
    const referralLink = `${window.location.origin}?ref=${referralData.referralCode}`;
    const shareText = `Join me on this amazing unlocking tool platform! Use my referral code: ${referralData.referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Unlocking Tool Platform',
          text: shareText,
          url: referralLink,
        });
      } catch (error) {
        // Fallback to copying if share fails
        copyReferralLink();
      }
    } else {
      // Fallback to copying if share API is not available
      copyReferralLink();
    }
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
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralData?.stats.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Users referred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralData?.stats.totalCreditsEarned || 0}</div>
            <p className="text-xs text-muted-foreground">
              From referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Rate</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Credits per referral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with friends to earn bonus credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralData?.referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={referralData.referralCode}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralLink}
                  className="flex-shrink-0"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareReferralLink}
                  className="flex-shrink-0"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  You and your friend will each receive 5 credits when they sign up using your referral code!
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                You don't have a referral code yet
              </p>
              <Button onClick={generateReferralCode}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Referral Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referred By Section */}
      {referralData?.referredBy && (
        <Card>
          <CardHeader>
            <CardTitle>Referred By</CardTitle>
            <CardDescription>
              You were referred by this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">
                  {referralData.referredBy.name || referralData.referredBy.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  {referralData.referredBy.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>
            Users who signed up using your referral code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralData?.referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Share your referral code to start earning credits!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralData?.referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {referral.name || referral.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {referral.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {referral.credits} credits
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}