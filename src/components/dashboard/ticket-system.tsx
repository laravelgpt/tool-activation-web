'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Send,
  User,
  Shield
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  createdAt: string;
  updatedAt: string;
  replies: any[];
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

interface TicketReply {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export function TicketSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'MEDIUM' as const,
    category: '',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Ticket created successfully',
        });
        setShowCreateDialog(false);
        setNewTicket({ subject: '', message: '', priority: 'MEDIUM', category: '' });
        fetchTickets();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create ticket',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create ticket',
        variant: 'destructive',
      });
    }
  };

  const fetchReplies = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/tickets/${ticketId}/replies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies || []);
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    }
  };

  const addReply = async () => {
    if (!newReply.trim() || !selectedTicket) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/tickets/${selectedTicket.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newReply }),
      });

      if (response.ok) {
        setNewReply('');
        fetchReplies(selectedTicket.id);
        fetchTickets(); // Refresh to update status
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to send reply',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <AlertTriangle className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>
                Get help from our support team
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>
                    Describe your issue and our support team will help you
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newTicket.priority} 
                        onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Technical, Billing"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={newTicket.message}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Detailed description of your issue..."
                      rows={6}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createTicket}>
                      <Send className="mr-2 h-4 w-4" />
                      Create Ticket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No tickets found</p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                Create Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{(ticket.status || '').replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {ticket.message.substring(0, 150)}
                        {ticket.message.length > 150 && '...'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Replies: {ticket.replies.length}</span>
                        {ticket.category && <span>Category: {ticket.category}</span>}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        fetchReplies(ticket.id);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedTicket?.subject}</DialogTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(selectedTicket?.status || '')}>
                  {getStatusIcon(selectedTicket?.status || '')}
                  <span className="ml-1">{(selectedTicket?.status || '').replace('_', ' ')}</span>
                </Badge>
                <Badge className={getPriorityColor(selectedTicket?.priority || '')}>
                  {selectedTicket?.priority}
                </Badge>
              </div>
            </div>
            <DialogDescription>
              Created on {selectedTicket && new Date(selectedTicket.createdAt).toLocaleDateString()}
              {selectedTicket?.category && ` • Category: ${selectedTicket.category}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Original Message */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{selectedTicket?.user.name || selectedTicket?.user.email}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedTicket && new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm">{selectedTicket?.message}</p>
            </div>

            {/* Replies */}
            <div className="space-y-3">
              <h4 className="font-medium">Replies ({replies.length})</h4>
              {replies.map((reply) => (
                <div key={reply.id} className={`border rounded-lg p-4 ${reply.isStaff ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {reply.isStaff ? (
                      <>
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-600">Support Staff</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        <span className="font-medium">{reply.user?.name || reply.user?.email}</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{reply.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {selectedTicket?.status !== 'CLOSED' && selectedTicket?.status !== 'RESOLVED' && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="reply">Your Reply</Label>
                  <Textarea
                    id="reply"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={addReply} disabled={!newReply.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}