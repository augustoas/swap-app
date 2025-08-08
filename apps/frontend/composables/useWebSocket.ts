import { ref, computed, onMounted, onUnmounted } from 'vue';
import WebSocketService from '@/sockets/websocket.service';
import type { 
  WebSocketResponse, 
  ConnectedUser,
  NotificationReceivedDto,
  JoinNotificationsResponse,
  NotificationEventData
} from '@/types/websocket';
import type { Notification } from '@/types/resource';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  token?: string;
  userId?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = false, token, userId } = options;
  
  // Reactive state from the service
  const isConnected = computed(() => WebSocketService.connected);
  const isConnecting = computed(() => WebSocketService.connecting);
  const connectedUsers = computed(() => WebSocketService.connectedUsers.value);
  const currentUser = computed(() => WebSocketService.currentUser.value);
  const socketId = computed(() => WebSocketService.socketId);
  const notificationStats = computed(() => WebSocketService.getNotificationStats());
  
  // Local reactive state
  const notificationPreferences = ref({
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableChatNotifications: true,
    enableJobNotifications: true,
    enableSystemNotifications: true
  });
  
  // Connection methods
  const connect = async (authToken?: string): Promise<boolean> => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) {
      console.error('No token provided for WebSocket connection');
      return false;
    }
    
    return await WebSocketService.connect(tokenToUse);
  };
  
  const disconnect = (): void => {
    WebSocketService.disconnect();
  };
  
  // Notification methods
  const joinNotifications = async (notificationUserId?: number): Promise<void> => {
    const userIdToUse = notificationUserId || userId;
    if (!userIdToUse) {
      console.error('No userId provided for joining notifications');
      return;
    }
    await WebSocketService.joinNotifications(userIdToUse);
  };
  
  const leaveNotifications = async (notificationUserId?: number): Promise<void> => {
    const userIdToUse = notificationUserId || userId;
    if (!userIdToUse) {
      console.error('No userId provided for leaving notifications');
      return;
    }
    await WebSocketService.leaveNotifications(userIdToUse);
  };
  
  // Utility methods
  const getConnectedUsers = async (): Promise<void> => {
    await WebSocketService.getConnectedUsers();
  };
  
  const ping = async (): Promise<void> => {
    await WebSocketService.ping();
  };
  
  // Note: Notification management is handled by notificationSocket.ts
  // This composable focuses on chat and other WebSocket functionality
  
  const handleNotificationJoinResponse = (response: WebSocketResponse<JoinNotificationsResponse>): void => {
    if (response.success && response.data) {
      console.log('Joined notifications room, unread count:', response.data.unreadCount);
    }
  };
  
  // Setup event listeners (notifications handled by notificationSocket.ts)
  const setupEventListeners = (): void => {
    WebSocketService.on('notification:join_response', handleNotificationJoinResponse);
  };
  
  // Cleanup event listeners
  const cleanupEventListeners = (): void => {
    WebSocketService.off('notification:join_response', handleNotificationJoinResponse);
  };
  
  // Lifecycle hooks
  onMounted(() => {
    setupEventListeners();
    
    if (autoConnect && token) {
      connect(token);
    }
  });
  
  onUnmounted(() => {
    cleanupEventListeners();
  });
  
  return {
    // State
    isConnected,
    isConnecting,
    connectedUsers,
    currentUser,
    socketId,
    notificationStats,

    notificationPreferences: computed(() => notificationPreferences.value),
    
    // Connection methods
    connect,
    disconnect,
    
    // Notification methods
    joinNotifications,
    leaveNotifications,
    sendNotification: WebSocketService.sendNotification.bind(WebSocketService),
    
    // Note: Notification helper methods removed - handled by notificationSocket.ts
    
    // Utility methods
    getConnectedUsers,
    ping,
    
    // Event listener management
    setupEventListeners,
    cleanupEventListeners,
    
    // Direct access to service for advanced use cases
    service: WebSocketService,
  };
} 