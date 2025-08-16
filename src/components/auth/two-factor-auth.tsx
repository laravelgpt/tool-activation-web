'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Smartphone, 
  Key, 
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  QrCode,
  Lock
} from 'lucide-react';

interface TwoFactorAuthProps {
  userId: string;
  onStatusChange?: (enabled: boolean) => void;
}

interface BackupCode {
  code: string;
  used: boolean;
}

export function TwoFactorAuth({ userId, onStatusChange }: TwoFactorAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    check2FAStatus();
  }, [userId]);

  const check2FAStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.status.enabled);
        if (onStatusChange) {
          onStatusChange(data.status.enabled);
        }
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.setup.qrCode);
        setSecret(data.setup.secret);
        setBackupCodes(data.setup.backupCodes.map((code: string) => ({ code, used: false })));
        setShowSetup(true);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enable 2FA');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to enable 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          secret,
          token: verificationCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.backupCodes.map((code: string) => ({ code, used: false })));
        setShowSetup(false);
        setIsEnabled(true);
        if (onStatusChange) {
          onStatusChange(true);
        }
        toast({
          title: 'Success',
          description: 'Two-factor authentication enabled successfully',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Invalid verification code');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          password: 'user_password' // In a real app, you'd collect this from the user
        }),
      });

      if (response.ok) {
        setIsEnabled(false);
        setShowBackupCodes(false);
        if (onStatusChange) {
          onStatusChange(false);
        }
        toast({
          title: 'Success',
          description: 'Two-factor authentication disabled',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disable 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isEnabled ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {isEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Badge variant={isEnabled ? 'default' : 'secondary'} className="text-xs">
                  {isEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isEnabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Enable 2FA for enhanced security'
                }
              </p>
            </div>
          </div>
          <Button
            onClick={isEnabled ? handleDisable2FA : handleEnable2FA}
            disabled={isLoading}
            variant={isEnabled ? 'destructive' : 'default'}
            className="hidden sm:flex"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : isEnabled ? (
              <Lock className="mr-2 h-4 w-4" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            {isEnabled ? 'Disable' : 'Enable'}
          </Button>
        </motion.div>

        {/* Mobile Action Button */}
        <Button
          onClick={isEnabled ? handleDisable2FA : handleEnable2FA}
          disabled={isLoading}
          variant={isEnabled ? 'destructive' : 'default'}
          className="w-full sm:hidden"
        >
          {isLoading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : isEnabled ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : (
            <Shield className="mr-2 h-4 w-4" />
          )}
          {isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </Button>

        {/* Setup Dialog */}
        <AnimatePresence>
          {showSetup && (
            <Dialog open={showSetup} onOpenChange={setShowSetup}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Set Up Two-Factor Authentication
                  </DialogTitle>
                  <DialogDescription>
                    Scan the QR code with your authenticator app and enter the verification code
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* QR Code Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center space-y-4 p-6 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Smartphone className="h-4 w-4" />
                      Scan with Authenticator App
                    </div>
                    
                    {qrCode && (
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <div 
                          dangerouslySetInnerHTML={{ __html: qrCode }} 
                          className="flex justify-center"
                        />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground text-center max-w-sm">
                      Use apps like Google Authenticator, Authy, or Microsoft Authenticator
                    </div>
                  </motion.div>

                  {/* Manual Entry */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm font-medium">Or enter manually:</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={secret}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(secret)}
                        className="shrink-0"
                      >
                        {copiedCode === secret ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>

                  {/* Verification Code */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={6}
                      className="text-center text-lg font-mono tracking-widest"
                    />
                  </motion.div>

                  {/* Action Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      onClick={handleVerify2FA} 
                      disabled={verificationCode.length !== 6 || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Verify and Enable
                    </Button>
                  </motion.div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Backup Codes Section */}
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Backup Codes</p>
                      <p className="text-sm text-muted-foreground">
                        Save these codes in a safe place. You can use them if you lose access to your authenticator app.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                    >
                      {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showBackupCodes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                      >
                        {backupCodes.map((backupCode, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="relative group">
                              <code
                                className={`block w-full p-2 text-center text-xs font-mono rounded border ${
                                  backupCode.used 
                                    ? 'bg-muted text-muted-foreground line-through' 
                                    : 'bg-background hover:bg-muted cursor-pointer'
                                }`}
                                onClick={() => !backupCode.used && copyToClipboard(backupCode.code)}
                              >
                                {backupCode.code}
                              </code>
                              {copiedCode === backupCode.code && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute inset-0 flex items-center justify-center bg-green-500 text-white rounded text-xs"
                                >
                                  Copied!
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Enhanced Security</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Protects against unauthorized access even if your password is compromised
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Backup Codes</span>
            </div>
            <p className="text-xs text-muted-foreground">
              10 backup codes ensure you never lose access to your account
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Easy Setup</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Compatible with all popular authenticator apps
            </p>
          </Card>
        </motion.div>
      </CardContent>
    </Card>
  );
}