'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: 'STRIPE' | 'PAYPAL' | 'CRYPTOCURRENCY' | 'BANK_TRANSFER' | 'MANUAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  createdAt: string;
}

interface PaymentSectionProps {
  onPaymentSuccess?: () => void;
}

export function PaymentSection({ onPaymentSuccess }: PaymentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 10,
    method: 'STRIPE' as const,
    currency: 'USD',
  });

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handlePayment = async () => {
    if (!paymentData.amount || paymentData.amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Payment Successful',
          description: `Added ${data.creditsAdded} credits to your account`,
        });
        setShowPaymentForm(false);
        setPaymentData({ amount: 10, method: 'STRIPE', currency: 'USD' });
        fetchPayments();
        onPaymentSuccess?.();
      } else {
        toast({
          title: 'Payment Failed',
          description: data.error || 'Failed to process payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'STRIPE':
        return <CreditCard className="h-4 w-4" />;
      case 'PAYPAL':
        return <DollarSign className="h-4 w-4" />;
      case 'CRYPTOCURRENCY':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const presetAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Purchase credits to use our tools and services
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              variant={showPaymentForm ? "outline" : "default"}
            >
              {showPaymentForm ? 'Cancel' : 'Add Credits'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showPaymentForm && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex gap-2 mb-2">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={paymentData.amount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentData(prev => ({ ...prev, amount }))}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Input
                  id="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select 
                  value={paymentData.method} 
                  onValueChange={(value: any) => setPaymentData(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRIPE">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Stripe (Credit Card)
                      </div>
                    </SelectItem>
                    <SelectItem value="PAYPAL">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        PayPal
                      </div>
                    </SelectItem>
                    <SelectItem value="CRYPTOCURRENCY">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Cryptocurrency
                      </div>
                    </SelectItem>
                    <SelectItem value="BANK_TRANSFER">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="MANUAL">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Manual Payment
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You will receive {paymentData.amount} credits for ${paymentData.amount}. 
                  {paymentData.method === 'CRYPTOCURRENCY' && ' Note: Crypto payments may take longer to process.'}
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handlePayment} 
                disabled={loading || !paymentData.amount}
                className="w-full"
              >
                {loading ? 'Processing...' : `Pay $${paymentData.amount}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View your recent payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment history found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowPaymentForm(true)}
              >
                Make Your First Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getMethodIcon(payment.method)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {payment.amount} {payment.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        {payment.transactionId && (
                          <span className="ml-2 font-mono text-xs">
                            ID: {payment.transactionId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    {payment.status === 'COMPLETED' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {payment.status === 'FAILED' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {payment.status === 'PENDING' && (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}