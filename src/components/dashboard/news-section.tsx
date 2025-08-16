'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Newspaper, 
  Calendar, 
  ExternalLink, 
  Eye,
  Clock
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export function NewsSection() {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news?published=true&limit=5');
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Latest News & Announcements
              </CardTitle>
              <CardDescription>
                Stay updated with the latest platform news and announcements
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchNews}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No news or announcements yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back later for updates
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        {item.isPublished && (
                          <Badge className="bg-green-100 text-green-800">
                            Published
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        {item.updatedAt !== item.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Updated {formatDate(item.updatedAt)}</span>
                          </div>
                        )}
                      </div>

                      {item.imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-48 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <p className="text-muted-foreground mb-4">
                        {item.excerpt || truncateText(item.content, 200)}
                      </p>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedNews(item)}
                          className="ml-4 flex-shrink-0"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Read More
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Newspaper className="h-5 w-5" />
                            {item.title}
                          </DialogTitle>
                          <DialogDescription>
                            Published on {formatDate(item.createdAt)}
                            {item.updatedAt !== item.createdAt && (
                              <span className="ml-2">• Updated {formatDate(item.updatedAt)}</span>
                            )}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {item.imageUrl && (
                            <div>
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full h-64 object-cover rounded-md"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap">{item.content}</div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                            <Badge className={item.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {item.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Useful resources and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-medium mb-2">Getting Started</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to use our platform effectively
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Guide
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-medium mb-2">API Documentation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Integrate our tools with your applications
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Read Docs
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-medium mb-2">Community Forum</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with other users and share experiences
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Forum
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}