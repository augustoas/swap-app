import { io, Socket } from 'socket.io-client';
import { ref } from 'vue';
import type { User } from '@/types/resource';
import type {
  WebSocketResponse,
  ConnectedUser,
  JoinNotificationsDto,
  SendNotificationDto,
  NotificationReceivedDto,
  JoinNotificationsResponse,
  NotificationEventData,
  ConnectionSuccessData,
  ConnectionErrorData,
  WebSocketConfig,
  WebSocketState,
  EventCallback,
  WebSocketError,
  WebSocketErrorCode,
  NotificationType,
  JoinChatRoomDto,
  LeaveChatRoomDto,
  SendMessageDto,
  MessageReceivedDto,
  JoinChatRoomResponse,
  ChatHistoryResponse,
  ChatRoomInfo,
  ChatMessage,
  UserJoinedRoom,
  UserLeftRoom
} from '@/types/websocket';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  // Reactive state
  public isConnected = ref(false);
  public isConnecting = ref(false);
  public connectedUsers = ref<ConnectedUser[]>([]);
  public currentUser = ref<User | null>(null);
  public notificationStats = ref<{ unreadCount: number; totalCount: number }>({ unreadCount: 0, totalCount: 0 });
  public joinedChatRooms = ref<Set<number>>(new Set());
  
  // Event callbacks
  private eventCallbacks = new Map<string, EventCallback[]>();

  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Connect to WebSocket server with JWT authentication
   */
  async connect(token: string): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }

    this.isConnecting.value = true;

    try {
      this.socket = io('http://localhost:4000', {
        auth: {
          token: token
        },
        transports: ['websocket'],
        autoConnect: false,
      });

      this.setupSocketListeners();
      
      return new Promise((resolve) => {
        this.socket?.connect();
        
        const timeout = setTimeout(() => {
          this.isConnecting.value = false;
          resolve(false);
        }, 10000);

        this.socket?.once('connected', (data) => {
          clearTimeout(timeout);
          this.isConnected.value = true;
          this.isConnecting.value = false;
          this.reconnectAttempts = 0;
          
          if (data.data?.userId) {
            // Set current user data if available
            this.currentUser.value = {
              id: data.data.userId,
              // Add other user properties as needed
            } as User;
          }
          
          console.log('WebSocket connected successfully:', data);
          resolve(true);
        });

        this.socket?.once('connection_error', (error) => {
          clearTimeout(timeout);
          this.isConnecting.value = false;
          console.error('WebSocket connection error:', error);
          resolve(false);
        });
      });
    } catch (error) {
      this.isConnecting.value = false;
      console.error('Failed to connect WebSocket:', error);
      return false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected.value = false;
    this.isConnecting.value = false;
    this.currentUser.value = null;
    this.notificationStats.value = { unreadCount: 0, totalCount: 0 };
    this.joinedChatRooms.value.clear();
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected.value = true;
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      this.isConnected.value = false;
      console.log('Socket disconnected:', reason);
      this.handleReconnect();
    });

    // Notification events (matching backend)
    this.socket.on('notification_received', (notification: NotificationReceivedDto) => {
      this.emit('notification:received', notification);
    });

    // Chat events (matching backend)
    this.socket.on('message_received', (message: MessageReceivedDto) => {
      this.emit('chat:message', message);
    });

    this.socket.on('user_joined_room', (data: UserJoinedRoom) => {
      this.emit('chat:user_joined', data);
    });

    this.socket.on('user_left_room', (data: UserLeftRoom) => {
      this.emit('chat:user_left', data);
    });

    // Notification response events (matching backend)
    this.socket.on('join_notifications_response', (response: WebSocketResponse<JoinNotificationsResponse>) => {
      if (response.success && response.data) {
        this.notificationStats.value.unreadCount = response.data.unreadCount;
      }
      this.emit('notification:join_response', response);
    });

    this.socket.on('leave_notifications_response', (response: WebSocketResponse) => {
      this.emit('notification:leave_response', response);
    });

    this.socket.on('send_notification_response', (response: WebSocketResponse) => {
      this.emit('notification:send_response', response);
    });

    // Chat response events (matching backend)
    this.socket.on('join_chat_room_response', (response: WebSocketResponse<JoinChatRoomResponse>) => {
      if (response.success && response.data) {
        this.joinedChatRooms.value.add(response.data.chatRoomId);
      }
      this.emit('chat:join_room_response', response);
    });

    this.socket.on('leave_chat_room_response', (response: WebSocketResponse) => {
      this.emit('chat:leave_room_response', response);
    });

    this.socket.on('send_message_response', (response: WebSocketResponse<MessageReceivedDto>) => {
      this.emit('chat:send_message_response', response);
    });

    this.socket.on('get_chat_history_response', (response: WebSocketResponse<ChatHistoryResponse>) => {
      this.emit('chat:history_response', response);
    });

    this.socket.on('get_connected_users_response', (response: WebSocketResponse<{count: number, users: ConnectedUser[]}>) => {
      if (response.success && response.data) {
        this.connectedUsers.value = response.data.users;
      }
      this.emit('users:connected_response', response);
    });

    // Pong response
    this.socket.on('pong', (response: WebSocketResponse) => {
      this.emit('ping:response', response);
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.socket?.connect();
    }, delay);
  }



  /**
   * Notification methods (matching backend DTOs)
   */
  async joinNotifications(userId: number): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const data: JoinNotificationsDto = {
      userId: userId.toString()
    };

    this.socket.emit('join_notifications', data);
  }

  async leaveNotifications(userId: number): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const data: JoinNotificationsDto = {
      userId: userId.toString()
    };

    this.socket.emit('leave_notifications', data);
  }

  async sendNotification(userId: number, title: string, message: string, type?: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const data: SendNotificationDto = {
      userId: userId.toString(),
      title,
      message,
      type
    };

    this.socket.emit('send_notification', data);
  }

  /**
   * Get notification statistics
   */
  getNotificationStats() {
    return this.notificationStats.value;
  }

  /**
   * Update notification stats manually (for integration with notification store)
   */
  updateNotificationStats(stats: { unreadCount: number; totalCount: number }) {
    this.notificationStats.value = stats;
  }

  /**
   * Chat room methods (matching backend DTOs)
   */
  async joinChatRoom(chatRoomId: number): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const data: JoinChatRoomDto = {
      chatRoomId: chatRoomId.toString()
    };

    this.socket.emit('join_chat_room', data);
  }

  async leaveChatRoom(chatRoomId: number): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const data: LeaveChatRoomDto = {
      chatRoomId: chatRoomId.toString()
    };

    this.socket.emit('leave_chat_room', data);
    this.joinedChatRooms.value.delete(chatRoomId);
  }

  async sendMessage(chatRoomId: number, text: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    const data: SendMessageDto = {
      chatRoomId: chatRoomId.toString(),
      text: text
    };

    this.socket.emit('send_message', data);
  }

  async getChatHistory(chatRoomId: number): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('get_chat_history', {
      chatRoomId: chatRoomId.toString()
    });
  }

  /**
   * Chat room state management
   */
  getChatRooms(): Set<number> {
    return this.joinedChatRooms.value;
  }

  isInChatRoom(chatRoomId: number): boolean {
    return this.joinedChatRooms.value.has(chatRoomId);
  }

  /**
   * Utility methods
   */
  async getConnectedUsers(): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('get_connected_users');
  }

  async ping(): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('ping');
  }

  /**
   * Event handling
   */
  private setupEventHandlers(): void {
    // Initialize event callbacks map
    this.eventCallbacks = new Map();
  }

  on(event: string, callback: EventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    
    const callbacks = this.eventCallbacks.get(event)!;
    
    // Prevent duplicate callbacks for the same event
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
      console.log(`✅ Added listener for event: ${event} (total: ${callbacks.length})`);
    } else {
      console.warn(`⚠️ Duplicate listener prevented for event: ${event}`);
    }
  }

  off(event: string, callback?: EventCallback): void {
    if (!this.eventCallbacks.has(event)) return;
    
    if (callback) {
      const callbacks = this.eventCallbacks.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        console.log(`🗑️ Removed listener for event: ${event} (remaining: ${callbacks.length})`);
      } else {
        console.warn(`⚠️ Callback not found for event: ${event}`);
      }
    } else {
      this.eventCallbacks.delete(event);
      console.log(`🗑️ Removed all listeners for event: ${event}`);
    }
  }

  private emit(event: string, data: any): void {
    if (!this.eventCallbacks.has(event)) return;
    
    this.eventCallbacks.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event callback for ${event}:`, error);
      }
    });
  }

  /**
   * Getters
   */
  get connected(): boolean {
    return this.isConnected.value;
  }

  get connecting(): boolean {
    return this.isConnecting.value;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export default new WebSocketService(); 