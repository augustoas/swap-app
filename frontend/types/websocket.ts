import type { Chat, ChatRoom, Notification, User } from './resource';

// Base WebSocket response structure
export interface WebSocketResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User-related interfaces
export interface ConnectedUser {
  socketId: string;
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
  connectedAt: Date;
}

// Notification DTOs (matching backend)
export interface JoinNotificationsDto {
  userId: string;
}

export interface SendNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: string;
}

export interface NotificationReceivedDto {
  id: number;
  userId: number;
  title: string;
  message: string;
  type?: string;
  createdDate: Date;
}

// Notification-specific responses
export interface JoinNotificationsResponse {
  userId: number;
  unreadCount: number;
}

export interface NotificationEventData {
  id: number;
  userId: number;
  title: string;
  subtitle?: string;
  message: string;
  type?: string;
  path?: string;
  is_read: boolean;
  createdDate: Date;
  updatedDate: Date;
}

// Chat DTOs (matching backend)
export interface JoinChatRoomDto {
  chatRoomId: string;
}

export interface LeaveChatRoomDto {
  chatRoomId: string;
}

export interface SendMessageDto {
  chatRoomId: string;
  text: string;
}

export interface MessageReceivedDto {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  text: string;
  createdDate: Date;
}

// Chat room responses
export interface ChatRoomInfo {
  id: number;
  jobId: number;
  jobCreator: {
    id: number;
    name: string;
  };
  jobWorker: {
    id: number;
    name: string;
  };
}

export interface JoinChatRoomResponse {
  chatRoomId: number;
  messages: MessageReceivedDto[];
  chatRoom: ChatRoomInfo;
}

export interface ChatHistoryResponse {
  chatRoomId: number;
  messages: MessageReceivedDto[];
}

// Legacy interface for compatibility
export interface ChatMessage {
  id: number;
  text: string;
  chatRoomId: number;
  senderId: number;
  sender?: User;
  createdDate: Date;
  updatedDate: Date;
}

export interface UserJoinedRoom {
  userId: number;
  username: string;
  chatRoomId: number;
}

export interface UserLeftRoom {
  userId: number;
  username: string;
  chatRoomId: number;
}

// Connection event data
export interface ConnectionSuccessData {
  userId: number;
  connectedAt: Date;
}

export interface ConnectionErrorData {
  success: false;
  error: string;
}

// WebSocket event types
export type WebSocketEvent = 
  // Connection events
  | 'connected'
  | 'connection_error'
  | 'disconnect'
  
  // Notification events
  | 'join_notifications'
  | 'leave_notifications'
  | 'send_notification'
  | 'notification_received'
  | 'join_notifications_response'
  | 'leave_notifications_response'
  | 'send_notification_response'
  
  // Chat events (matching backend)
  | 'join_chat_room'
  | 'leave_chat_room'
  | 'send_message'
  | 'get_chat_history'
  | 'message_received'
  | 'user_joined_room'
  | 'user_left_room'
  | 'join_chat_room_response'
  | 'leave_chat_room_response'
  | 'send_message_response'
  | 'get_chat_history_response'
  
  // Utility events
  | 'get_connected_users'
  | 'get_connected_users_response'
  | 'ping'
  | 'pong';

// Notification types enum
export enum NotificationType {
  CHAT = 'chat',
  JOB_CREATED = 'job_created',
  JOB_ACCEPTED = 'job_accepted',
  JOB_COMPLETED = 'job_completed',
  JOB_CANCELLED = 'job_cancelled',
  SYSTEM = 'system',
  GENERAL = 'general'
}

// WebSocket service configuration
export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
}

// Event callback type
export type EventCallback<T = any> = (data: T) => void;

// WebSocket service state
export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  currentUser: User | null;
  connectedUsers: ConnectedUser[];
  joinedChatRooms: Set<number>;
  reconnectAttempts: number;
}

// Notification service specific interfaces
export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
  lastNotificationDate?: Date;
}

export interface NotificationPreferences {
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableChatNotifications: boolean;
  enableJobNotifications: boolean;
  enableSystemNotifications: boolean;
}

// Error types
export interface WebSocketError {
  code: string;
  message: string;
  details?: any;
}

export enum WebSocketErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_DATA = 'INVALID_DATA',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT'
} 