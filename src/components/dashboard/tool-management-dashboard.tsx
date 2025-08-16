'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  Play, 
  Pause, 
  Settings, 
  Shield, 
  Zap,
  Clock,
  Star,
  Users,
  TrendingUp,
  Activity,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { AnimatedContainer, AnimatedHeading, AnimatedText, AnimatedCard } from '@/components/ui/animated-container';

interface Tool {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'expired';
  version: string;
  lastUsed: string;
  usageCount: number;
  rating: number;
  description: string;
  icon: string;
  features: string[];
}

const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Adobe Photoshop Pro',
    category: 'Design',
    status: 'active',
    version: 'v24.0',
    lastUsed: '2 hours ago',
    usageCount: 156,
    rating: 4.8,
    description: 'Professional photo editing and graphic design software',
    icon: '🎨',
    features: ['Advanced Editing', 'AI Tools', 'Cloud Integration']
  },
  {
    id: '2',
    name: 'Visual Studio Code',
    category: 'Development',
    status: 'active',
    version: 'v1.85',
    lastUsed: '1 day ago',
    usageCount: 342,
    rating: 4.9,
    description: 'Code editor redefined and optimized for building and debugging modern web',
    icon: '💻',
    features: ['IntelliSense', 'Debugging', 'Extensions']
  },
  {
    id: '3',
    name: 'AutoCAD 2024',
    category: 'Engineering',
    status: 'active',
    version: 'v2024.1',
    lastUsed: '3 days ago',
    usageCount: 89,
    rating: 4.6,
    description: 'Professional CAD software for 2D and 3D design',
    icon: '🏗️',
    features: ['3D Modeling', 'Collaboration', 'Cloud Storage']
  },
  {
    id: '4',
    name: 'Final Cut Pro',
    category: 'Video',
    status: 'inactive',
    version: 'v10.6.8',
    lastUsed: '1 week ago',
    usageCount: 45,
    rating: 4.7,
    description: 'Professional video editing software',
    icon: '🎬',
    features: ['4K Editing', 'Color Grading', 'Effects']
  }
];

const categories = ['All', 'Design', 'Development', 'Engineering', 'Video', 'Security'];

export function ToolManagementDashboard() {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [filteredTools, setFilteredTools] = useState<Tool[]>(mockTools);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tools');

  useEffect(() => {
    let filtered = tools;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTools(filtered);
  }, [tools, selectedCategory, searchQuery]);

  const getStatusColor = (status: Tool['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'expired': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const stats = {
    totalTools: tools.length,
    activeTools: tools.filter(t => t.status === 'active').length,
    totalUsage: tools.reduce((sum, t) => sum + t.usageCount, 0),
    avgRating: (tools.reduce((sum, t) => sum + t.rating, 0) / tools.length).toFixed(1)
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedContainer animation="fadeInDown" className="text-center space-y-4">
          <AnimatedHeading as="h1" className="text-3xl md:text-4xl font-bold">
            Tool Management Dashboard
          </AnimatedHeading>
          <AnimatedText className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage and monitor all your unlocked tools in one place
          </AnimatedText>
        </AnimatedContainer>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, label: 'Total Tools', value: stats.totalTools, color: 'text-blue-500' },
            { icon: Activity, label: 'Active Tools', value: stats.activeTools, color: 'text-green-500' },
            { icon: TrendingUp, label: 'Total Usage', value: stats.totalUsage.toLocaleString(), color: 'text-purple-500' },
            { icon: Star, label: 'Avg Rating', value: stats.avgRating, color: 'text-yellow-500' }
          ].map((stat, index) => (
            <AnimatedCard
              key={stat.label}
              className="p-6"
              delay={index * 0.1}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">My Tools</CardTitle>
                <CardDescription>
                  Manage your unlocked tools and licenses
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="tools" className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTools.map((tool, index) => (
                    <AnimatedCard
                      key={tool.id}
                      className="p-6 hover:shadow-lg transition-all duration-300"
                      delay={index * 0.1}
                      whileHover={{ y: -5 }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{tool.icon}</div>
                            <div>
                              <h3 className="font-semibold text-lg">{tool.name}</h3>
                              <p className="text-sm text-muted-foreground">{tool.category}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(tool.status)}>
                            {tool.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{tool.description}</p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Version</span>
                            <span className="font-medium">{tool.version}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Used</span>
                            <span className="font-medium">{tool.lastUsed}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Usage</span>
                            <span className="font-medium">{tool.usageCount} times</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{tool.rating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {tool.features.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {tool.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tool.features.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            variant={tool.status === 'active' ? 'default' : 'outline'}
                          >
                            {tool.status === 'active' ? (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Launch
                              </>
                            ) : (
                              <>
                                <Unlock className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { tool: 'Adobe Photoshop Pro', action: 'launched', time: '2 hours ago' },
                      { tool: 'Visual Studio Code', action: 'used', time: '1 day ago' },
                      { tool: 'AutoCAD 2024', action: 'updated', time: '3 days ago' }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{activity.tool}</p>
                            <p className="text-sm text-muted-foreground">{activity.action}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Auto-update tools</p>
                          <p className="text-sm text-muted-foreground">Keep your tools up to date automatically</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Usage analytics</p>
                          <p className="text-sm text-muted-foreground">Share anonymous usage data to improve service</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Two-factor authentication</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Session timeout</p>
                          <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}