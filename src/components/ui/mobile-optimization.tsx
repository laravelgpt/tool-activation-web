'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  Battery, 
  Zap, 
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Gauge
} from 'lucide-react';

interface MobileOptimizationProps {
  onOptimizationChange: (settings: MobileSettings) => void;
}

interface MobileSettings {
  reduceAnimations: boolean;
  optimizeImages: boolean;
  enableOfflineMode: boolean;
  compressData: boolean;
  enableLazyLoading: boolean;
  reduceDataUsage: boolean;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  pixelRatio: number;
  touchEnabled: boolean;
}

interface ConnectionInfo {
  type: 'fast' | 'slow' | 'offline';
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function MobileOptimization({ onOptimizationChange }: MobileOptimizationProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    width: 0,
    height: 0,
    pixelRatio: 1,
    touchEnabled: false,
  });
  
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    type: 'fast',
  });
  
  const [settings, setSettings] = useState<MobileSettings>({
    reduceAnimations: false,
    optimizeImages: false,
    enableOfflineMode: false,
    compressData: false,
    enableLazyLoading: false,
    reduceDataUsage: false,
  });

  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    detectDeviceInfo();
    detectConnectionInfo();
    
    const handleResize = () => detectDeviceInfo();
    const handleOnline = () => detectConnectionInfo();
    const handleOffline = () => detectConnectionInfo();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // @ts-expect-error - NetworkInformation API is not in TypeScript types
    if (navigator.connection) {
      // @ts-expect-error - NetworkInformation API is not in TypeScript types
      navigator.connection.addEventListener('change', detectConnectionInfo);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // @ts-expect-error - NetworkInformation API is not in TypeScript types
      if (navigator.connection) {
        // @ts-expect-error - NetworkInformation API is not in TypeScript types
        navigator.connection.removeEventListener('change', detectConnectionInfo);
      }
    };
  }, []);

  useEffect(() => {
    autoOptimize();
  }, [deviceInfo, connectionInfo]);

  const detectDeviceInfo = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    let type: DeviceInfo['type'] = 'desktop';
    if (width < 768) {
      type = 'mobile';
    } else if (width < 1024) {
      type = 'tablet';
    }
    
    setDeviceInfo({
      type,
      width,
      height,
      pixelRatio,
      touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    });
  };

  const detectConnectionInfo = () => {
    if (!navigator.onLine) {
      setConnectionInfo({ type: 'offline' });
      return;
    }
    
    // @ts-expect-error - NetworkInformation API is not in TypeScript types
    if (navigator.connection) {
      // @ts-expect-error - NetworkInformation API is not in TypeScript types
      const connection = navigator.connection;
      let type: ConnectionInfo['type'] = 'fast';
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        type = 'slow';
      }
      
      setConnectionInfo({
        type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    } else {
      setConnectionInfo({ type: 'fast' });
    }
  };

  const autoOptimize = () => {
    const newSettings: MobileSettings = { ...settings };
    
    // Optimize based on device type
    if (deviceInfo.type === 'mobile') {
      newSettings.reduceAnimations = true;
      newSettings.optimizeImages = true;
      newSettings.enableLazyLoading = true;
      newSettings.reduceDataUsage = true;
    }
    
    // Optimize based on connection
    if (connectionInfo.type === 'slow') {
      newSettings.optimizeImages = true;
      newSettings.compressData = true;
      newSettings.enableLazyLoading = true;
      newSettings.reduceDataUsage = true;
    }
    
    if (connectionInfo.type === 'offline') {
      newSettings.enableOfflineMode = true;
      newSettings.compressData = true;
      newSettings.reduceDataUsage = true;
    }
    
    // Optimize based on data saver mode
    if (connectionInfo.saveData) {
      newSettings.reduceDataUsage = true;
      newSettings.optimizeImages = true;
      newSettings.compressData = true;
    }
    
    setSettings(newSettings);
    onOptimizationChange(newSettings);
  };

  const handleSettingChange = (key: keyof MobileSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onOptimizationChange(newSettings);
  };

  const getDeviceIcon = () => {
    switch (deviceInfo.type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getConnectionIcon = () => {
    switch (connectionInfo.type) {
      case 'slow':
        return <Battery className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <Wifi className="h-4 w-4 text-red-500" />;
      default:
        return <Zap className="h-4 w-4 text-green-500" />;
    }
  };

  const getPerformanceScore = () => {
    let score = 100;
    
    // Deduct points for mobile device
    if (deviceInfo.type === 'mobile') score -= 20;
    if (deviceInfo.type === 'tablet') score -= 10;
    
    // Deduct points for slow connection
    if (connectionInfo.type === 'slow') score -= 30;
    if (connectionInfo.type === 'offline') score -= 50;
    
    // Add points for optimizations
    if (settings.reduceAnimations) score += 10;
    if (settings.optimizeImages) score += 15;
    if (settings.compressData) score += 10;
    if (settings.enableLazyLoading) score += 10;
    if (settings.reduceDataUsage) score += 15;
    
    return Math.max(0, Math.min(100, score));
  };

  const handleOptimizeNow = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    autoOptimize();
    setIsOptimizing(false);
  };

  const performanceScore = getPerformanceScore();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Optimization
        </CardTitle>
        <CardDescription>
          Optimize your experience for mobile devices and network conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device and Connection Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getDeviceIcon()}
              </motion.div>
              <div>
                <Label className="text-sm font-medium">Device Type</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {deviceInfo.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {deviceInfo.width}×{deviceInfo.height}
                  </span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  scale: connectionInfo.type === 'offline' ? [1, 1.1, 1] : 1,
                  opacity: connectionInfo.type === 'offline' ? [1, 0.5, 1] : 1
                }}
                transition={{ duration: 1, repeat: connectionInfo.type === 'offline' ? Infinity : 0 }}
              >
                {getConnectionIcon()}
              </motion.div>
              <div>
                <Label className="text-sm font-medium">Connection</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={connectionInfo.type === 'fast' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {connectionInfo.type}
                  </Badge>
                  {connectionInfo.effectiveType && (
                    <span className="text-xs text-muted-foreground">
                      {connectionInfo.effectiveType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Performance Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Performance Score</Label>
            <Badge 
              variant={performanceScore > 70 ? 'default' : performanceScore > 40 ? 'secondary' : 'destructive'}
            >
              {performanceScore}/100
            </Badge>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                performanceScore > 70 ? 'bg-green-500' : 
                performanceScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${performanceScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            {performanceScore > 70 ? 'Excellent performance' :
             performanceScore > 40 ? 'Good performance' : 'Performance needs improvement'}
          </p>
        </motion.div>

        {/* Optimization Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Reduce Animations</Label>
              <p className="text-xs text-muted-foreground">
                Disable animations for better performance
              </p>
            </div>
            <Switch
              checked={settings.reduceAnimations}
              onCheckedChange={(checked) => handleSettingChange('reduceAnimations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Optimize Images</Label>
              <p className="text-xs text-muted-foreground">
                Load lower quality images on mobile
              </p>
            </div>
            <Switch
              checked={settings.optimizeImages}
              onCheckedChange={(checked) => handleSettingChange('optimizeImages', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Enable Lazy Loading</Label>
              <p className="text-xs text-muted-foreground">
                Load content only when needed
              </p>
            </div>
            <Switch
              checked={settings.enableLazyLoading}
              onCheckedChange={(checked) => handleSettingChange('enableLazyLoading', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Offline Mode</Label>
              <p className="text-xs text-muted-foreground">
                Enable offline functionality
              </p>
            </div>
            <Switch
              checked={settings.enableOfflineMode}
              onCheckedChange={(checked) => handleSettingChange('enableOfflineMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Data Compression</Label>
              <p className="text-xs text-muted-foreground">
                Compress data transfers for faster loading
              </p>
            </div>
            <Switch
              checked={settings.compressData}
              onCheckedChange={(checked) => handleSettingChange('compressData', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Reduce Data Usage</Label>
              <p className="text-xs text-muted-foreground">
                Minimize data consumption
              </p>
            </div>
            <Switch
              checked={settings.reduceDataUsage}
              onCheckedChange={(checked) => handleSettingChange('reduceDataUsage', checked)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={handleOptimizeNow} 
            disabled={isOptimizing}
            className="flex-1"
          >
            {isOptimizing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Gauge className="mr-2 h-4 w-4" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={autoOptimize}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Auto Optimize
          </Button>
        </div>

        {/* Optimization Tips */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Optimization Tips:</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Enable optimizations when on mobile data or slow connections</li>
                <li>• Use offline mode for frequently accessed content</li>
                <li>• Reduce animations for better battery life</li>
                <li>• Enable data compression to save bandwidth</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs font-medium">Data Saved</p>
                <p className="text-xs text-muted-foreground">
                  {settings.reduceDataUsage ? 'Up to 50%' : 'None'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs font-medium">Load Time</p>
                <p className="text-xs text-muted-foreground">
                  {settings.optimizeImages ? 'Faster' : 'Normal'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs font-medium">Battery</p>
                <p className="text-xs text-muted-foreground">
                  {settings.reduceAnimations ? 'Saved' : 'Normal'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}