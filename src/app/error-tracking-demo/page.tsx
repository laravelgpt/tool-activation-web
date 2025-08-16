'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useErrorTracking, usePerformanceTracking } from '@/hooks/use-error-tracking';
import { AlertTriangle, Bug, Zap, Shield } from 'lucide-react';

export default function ErrorTrackingDemo() {
  const { trackError, trackWarning, trackInfo } = useErrorTracking();
  const { trackPerformance, trackApiError } = usePerformanceTracking();
  const [customMessage, setCustomMessage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'error' | 'warning' | 'info'>('error');
  const [selectedType, setSelectedType] = useState<'application' | 'security' | 'performance' | 'network'>('application');

  const handleTrackError = () => {
    if (!customMessage.trim()) return;

    switch (selectedLevel) {
      case 'error':
        trackError(new Error(customMessage), { type: selectedType, demo: true });
        break;
      case 'warning':
        trackWarning(customMessage, { type: selectedType, demo: true });
        break;
      case 'info':
        trackInfo(customMessage, { type: selectedType, demo: true });
        break;
    }

    setCustomMessage('');
  };

  const handleSimulateError = (type: string) => {
    switch (type) {
      case 'javascript':
        // This will be caught by the error boundary
        throw new Error('Simulated JavaScript error for testing');
      
      case 'promise':
        // This will be caught by unhandled rejection handler
        Promise.reject(new Error('Simulated promise rejection for testing'));
        break;
      
      case 'api':
        // Simulate API error
        trackApiError('/api/test', new Error('Simulated API error'), { demo: true });
        break;
      
      case 'performance':
        // Simulate slow performance
        const startTime = Date.now();
        setTimeout(() => {
          const duration = Date.now() - startTime;
          trackPerformance('Slow Operation', duration, { demo: true });
        }, 100);
        break;
      
      case 'security':
        // Simulate security error
        trackError(new Error('Simulated security breach attempt'), {
          type: 'security',
          severity: 'critical',
          context: {
            ip: '192.168.1.100',
            userAgent: 'Malicious Bot 1.0',
            path: '/admin',
            method: 'POST'
          },
          tags: ['security', 'breach', 'demo'],
          severity: 'critical'
        });
        break;
    }
  };

  const handleConsoleError = () => {
    // This will be caught if console error tracking is enabled
    console.error('This is a test console error for error tracking demo');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Error Tracking Demo</h1>
        <p className="text-muted-foreground">
          Test the comprehensive error tracking and alerting system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Manual Error Tracking
            </CardTitle>
            <CardDescription>
              Manually track errors, warnings, and info messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                placeholder="Enter error message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={selectedLevel} onValueChange={(value: any) => setSelectedLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleTrackError} 
              className="w-full"
              disabled={!customMessage.trim()}
            >
              Track Error
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Simulate Errors
            </CardTitle>
            <CardDescription>
              Simulate different types of errors and events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleSimulateError('javascript')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              JavaScript Error
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleSimulateError('promise')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Promise Rejection
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleSimulateError('api')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              API Error
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleSimulateError('performance')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Performance Issue
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleSimulateError('security')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Security Event
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleConsoleError}
            >
              <Bug className="h-4 w-4 mr-2" />
              Console Error
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Error Tracking Features
            </CardTitle>
            <CardDescription>
              Key features of the error tracking system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Error Tracking</span>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Automatic Error Grouping</span>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Boundary Protection</span>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance Monitoring</span>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Event Tracking</span>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Alert System</span>
                <Badge variant="secondary">Configured</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Admin Dashboard</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            The error tracking system automatically captures and categorizes errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Automatic Capture</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Unhandled JavaScript errors</li>
                <li>• Unhandled promise rejections</li>
                <li>• React error boundaries</li>
                <li>• Console errors (optional)</li>
                <li>• API call failures</li>
                <li>• Performance issues</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Smart Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Error grouping and deduplication</li>
                <li>• Contextual information capture</li>
                <li>• Severity-based alerting</li>
                <li>• Real-time dashboard</li>
                <li>• Custom alert rules</li>
                <li>• Error resolution tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            View and manage all tracked errors in the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Navigate to the Admin Dashboard and click on the "Error Tracking" tab to view all tracked errors, 
              create alert rules, and manage error resolution workflows.
            </p>
            <Button 
              onClick={() => window.location.href = '/admin'}
              variant="outline"
            >
              Go to Admin Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}