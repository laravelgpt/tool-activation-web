import { Server } from 'socket.io';
import { db } from './db';

interface UserSocket {
  userId: string;
  socketId: string;
}

// Store user socket connections
const userSockets = new Map<string, string>(); // userId -> socketId

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle user authentication
    socket.on('authenticate', (data: { userId: string; token: string }) => {
      // In a real implementation, you would validate the token here
      // For now, we'll just store the user socket mapping
      userSockets.set(data.userId, socket.id);
      socket.userId = data.userId;
      
      console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
      
      // Join user-specific room
      socket.join(`user:${data.userId}`);
      
      // Send confirmation
      socket.emit('authenticated', {
        success: true,
        message: 'Successfully connected to real-time notifications'
      });
    });

    // Handle notifications
    socket.on('notification:read', async (data: { notificationId: string }) => {
      try {
        // Mark notification as read in database
        await db.notification.update({
          where: { id: data.notificationId },
          data: { isRead: true }
        });
        
        socket.emit('notification:read:success', {
          notificationId: data.notificationId
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('notification:read:error', {
          error: 'Failed to mark notification as read'
        });
      }
    });

    // Handle messages (legacy support)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove from user sockets mapping
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to WebSocket Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

// Helper functions to send notifications
export const sendUserNotification = async (io: Server, userId: string, notification: {
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  data?: any;
}) => {
  const socketId = userSockets.get(userId);
  
  // Save notification to database
  try {
    const dbNotification = await db.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
      },
    });

    // Send real-time notification if user is connected
    if (socketId) {
      io.to(socketId).emit('notification', {
        id: dbNotification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: dbNotification.createdAt.toISOString(),
        isRead: false
      });
    }
  } catch (error) {
    console.error('Error saving notification to database:', error);
  }
};

export const sendAdminNotification = async (io: Server, notification: {
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  data?: any;
}) => {
  // Get all admin users
  try {
    const adminUsers = await db.user.findMany({
      where: { role: 'ADMIN' },
    });

    // Send notification to each admin
    for (const admin of adminUsers) {
      await sendUserNotification(io, admin.id, notification);
    }
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

export const broadcastNotification = async (io: Server, notification: {
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  data?: any;
}) => {
  // Get all users
  try {
    const users = await db.user.findMany({
      where: { isActive: true },
    });

    // Send notification to each user
    for (const user of users) {
      await sendUserNotification(io, user.id, notification);
    }
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
};