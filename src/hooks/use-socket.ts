'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/auth-context';

interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  isRead: boolean;
}

export function useSocket() {
  const { user, accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !accessToken) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      
      // Authenticate with user ID and token
      socket.emit('authenticate', {
        userId: user.id,
        token: accessToken,
      });
    });

    socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Notification events
    socket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('notification:read:success', (data) => {
      console.log('Notification marked as read:', data);
      setNotifications(prev => 
        prev.map(n => n.id === data.notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    socket.on('notification:read:error', (data) => {
      console.error('Failed to mark notification as read:', data);
    });

    // Legacy message support
    socket.on('message', (msg) => {
      console.log('Received message:', msg);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user, accessToken]);

  const markAsRead = (notificationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('notification:read', { notificationId });
    }
  };

  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    unreadNotifications.forEach(notification => {
      markAsRead(notification.id);
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}