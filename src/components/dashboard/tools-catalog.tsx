'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useAuthFetch } from '@/hooks/use-auth-fetch';

interface Tool {
  id: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  price: number;
  isActive: boolean;
  features?: any;
  requirements?: any;
  downloads: Download[];
}

interface Download {
  id: string;
  version: string;
  fileName: string;
  fileSize?: number;
  downloadUrl: string;
  isActive: boolean;
  downloadCount: number;
}

export function ToolsCatalog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const authFetch = useAuthFetch();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/tools');
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch tools',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await authFetch('/api/tools?categories=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleDownload = async (downloadId: string, fileName: string, requiredCredits: number) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to download tools',
        variant: 'destructive',
      });
      return;
    }

    if (requiredCredits > 0 && user.credits < requiredCredits) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${requiredCredits} credits to download this tool`,
        variant: 'destructive',
      });
      return;
    }

    setDownloading(downloadId);
    try {
      const response = await authFetch(`/api/downloads/${downloadId}/download`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Download Started',
          description: `${fileName} is downloading...`,
        });

        if (data.creditsUsed > 0) {
          toast({
            title: 'Credits Used',
            description: `${data.creditsUsed} credits have been deducted from your account`,
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to download tool',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesCategory && matchesSearch;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No tools found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    {tool.category && (
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                    )}
                  </div>
                  {tool.price > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {tool.price} credits
                    </Badge>
                  )}
                </div>
                {tool.version && (
                  <CardDescription className="text-sm">
                    Version {tool.version}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {tool.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {tool.description}
                  </p>
                )}

                {tool.features && Object.keys(tool.features).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Features:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {Object.entries(tool.features).slice(0, 3).map(([key, value]) => (
                        <li key={key} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {String(value)}
                        </li>
                      ))}
                      {Object.keys(tool.features).length > 3 && (
                        <li className="text-muted-foreground">
                          +{Object.keys(tool.features).length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Available Downloads:</h4>
                  <div className="space-y-2">
                    {tool.downloads.map((download) => (
                      <div key={download.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{download.fileName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>v{download.version}</span>
                            <span>•</span>
                            <span>{formatFileSize(download.fileSize)}</span>
                            <span>•</span>
                            <span>{download.downloadCount} downloads</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(download.id, download.fileName, tool.price)}
                          disabled={downloading === download.id || !download.isActive}
                        >
                          {downloading === download.id ? 'Downloading...' : 'Download'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {tool.requirements && Object.keys(tool.requirements).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Requirements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(tool.requirements).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {String(value)}
                        </Badge>
                      ))}
                      {Object.keys(tool.requirements).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(tool.requirements).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}