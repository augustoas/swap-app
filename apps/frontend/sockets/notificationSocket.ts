import WebSocketService from './websocket.service';
import type { Notification } from '@/types/resource';
import type { NotificationReceivedDto } from '@/types/websocket';

class NotificationSocket {
  private userId: number | null = null;
  private token: string | null = null;
  private isJoinedToNotifications = false;

  async connect(userId: number, token?: string): Promise<boolean> {
    // If already connected with same user, don't reconnect
    if (this.userId === userId && this.isJoinedToNotifications) {
      console.log('Notification socket already connected for user:', userId);
      return true;
    }
    
    // Clean up any existing connection
    this.disconnect();
    
    this.userId = userId;
    this.token = token || this.token;
    
    if (!this.token) {
      console.error('No token provided for notification socket connection');
      return false;
    }

    try {
      // Connect to the main WebSocket service
      const connected = await WebSocketService.connect(this.token);
      
      if (connected) {
        // Setup notification listeners (removeNotificationListeners called in disconnect above)
        this.setupNotificationListeners();
        
        // The backend automatically joins the user to their notification room
        // but we can explicitly join to ensure connection
        await WebSocketService.joinNotifications(userId);
        this.isJoinedToNotifications = true;
        
        console.log('Notification socket connected successfully for user:', userId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to connect notification socket:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.userId && this.isJoinedToNotifications) {
      // Remove notification listeners
      this.removeNotificationListeners();
      
      // Leave notification room
      WebSocketService.leaveNotifications(this.userId).catch(console.error);
      this.isJoinedToNotifications = false;
    }
    
    // Note: We don't disconnect the main WebSocket service here
    // as it might be used by other parts of the application
    this.userId = null;
    this.token = null;
  }

  private setupNotificationListeners(): void {
    console.log('📡 SETTING UP NOTIFICATION LISTENERS for user:', this.userId);
    WebSocketService.on('notification:received', this.handleNotification);
    WebSocketService.on('notification:join_response', this.handleJoinResponse);
    WebSocketService.on('notification:leave_response', this.handleLeaveResponse);
  }

  private removeNotificationListeners(): void {
    console.log('🚫 REMOVING NOTIFICATION LISTENERS for user:', this.userId);
    WebSocketService.off('notification:received', this.handleNotification);
    WebSocketService.off('notification:join_response', this.handleJoinResponse);
    WebSocketService.off('notification:leave_response', this.handleLeaveResponse);
  }

  private handleNotification = (notification: NotificationReceivedDto): void => {
    try {
      console.log('🔔 NOTIFICATION RECEIVED:', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        userId: notification.userId,
        timestamp: new Date().toISOString()
      });

      // Special debug for message-type notifications
      if (notification.type === 'message' || notification.title?.toLowerCase().includes('mensaje')) {
        console.warn('⚠️ MESSAGE NOTIFICATION DETECTED:', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          userId: notification.userId,
          stackTrace: new Error().stack
        });
      }
      
      const notificationStore = useNotificationStore();
      
      // Check if notification already exists to prevent duplicates
      const existingNotifications = notificationStore.getAllNotification;
      const alreadyExists = existingNotifications.some(n => n.id === notification.id);
      
      if (alreadyExists) {
        console.warn('⚠️ DUPLICATE NOTIFICATION PREVENTED:', notification.id);
        return;
      }
      
      // Convert NotificationReceivedDto to Notification format
      const notificationData: Notification = {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        subtitle: notification.message, // Use message as subtitle
        message: notification.message,
        path: notification.type || '/notifications',
        is_read: false,
        createdDate: notification.createdDate,
        updatedDate: notification.createdDate,
      };
      
      console.log('✅ ADDING NOTIFICATION TO STORE:', notificationData.id);
      notificationStore.addNotification(notificationData);
      
      // Update notification stats
      const currentStats = WebSocketService.getNotificationStats();
      WebSocketService.updateNotificationStats({
        unreadCount: currentStats.unreadCount + 1,
        totalCount: currentStats.totalCount + 1
      });
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  private handleJoinResponse = (response: any): void => {
    if (response.success) {
      console.log('Successfully joined notification room:', response.data);
      if (response.data?.unreadCount !== undefined) {
        WebSocketService.updateNotificationStats({
          unreadCount: response.data.unreadCount,
          totalCount: response.data.unreadCount // We'll update this when we get more data
        });
      }
    } else {
      console.error('Failed to join notification room:', response.error);
    }
  };

  private handleLeaveResponse = (response: any): void => {
    if (response.success) {
      console.log('Successfully left notification room');
    } else {
      console.error('Failed to leave notification room:', response.error);
    }
  };

  // Send notification (for admin/system use)
  async sendNotification(userId: number, title: string, message: string, type?: string): Promise<void> {
    if (!WebSocketService.connected) {
      throw new Error('WebSocket not connected');
    }
    
    await WebSocketService.sendNotification(userId, title, message, type);
  }

  // Get notification statistics
  getNotificationStats() {
    return WebSocketService.getNotificationStats();
  }

  // Getters for backward compatibility
  get connected(): boolean {
    return WebSocketService.connected;
  }

  get connecting(): boolean {
    return WebSocketService.connecting;
  }

  get socketId(): string | undefined {
    return WebSocketService.socketId;
  }

  get isJoined(): boolean {
    return this.isJoinedToNotifications;
  }

  // Direct access to the main service for advanced use cases
  get service() {
    return WebSocketService;
  }
}

export default new NotificationSocket();
