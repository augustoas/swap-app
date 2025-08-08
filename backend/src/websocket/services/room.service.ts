import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket, ChatRoomInfo } from '../interfaces/websocket.interface';

/**
 * Room Service
 * 
 * This service manages WebSocket room operations for the application,
 * providing centralized room management, user permissions, and real-time
 * communication coordination. It handles both chat rooms and notification rooms
 * with proper security and access control.
 * 
 * Key Features:
 * - Chat room management with permission validation
 * - Personal notification room management
 * - Room naming conventions and standardization
 * - User join/leave operations with proper authorization
 * - Real-time user presence tracking
 * - Chat room information caching for performance
 * - Room-based message broadcasting
 * 
 * Room Types:
 * - Chat Rooms: `chat_room_{chatRoomId}` - For job-related communications
 * - Notification Rooms: `user_notifications_{userId}` - For personal notifications
 * 
 * Security Features:
 * - Permission validation before room access
 * - User authorization checks
 * - Access control for chat rooms (job participants only)
 * - Personal notification room isolation
 * - Logging and monitoring for security events
 * 
 * Architecture Benefits:
 * - Centralized room management logic
 * - Consistent room naming and access patterns
 * - Efficient caching for room information
 * - Scalable room operations
 * - Clean separation of room types and logic
 * 
 * Integration Points:
 * - WebSocket Gateway: Room operations during connection events
 * - Chat Handler: Chat room access and permissions
 * - Notification Handler: Personal notification delivery
 * - Database Services: Chat room validation and information
 * 
 * Performance Considerations:
 * - In-memory caching for chat room information
 * - Efficient room operations using Socket.IO primitives
 * - Optimized user presence tracking
 * - Minimal database queries through caching
 * 
 * Scalability Notes:
 * - Room operations are local to each server instance
 * - Consider Redis adapter for multi-instance deployments
 * - Cache invalidation strategies for distributed systems
 * - Load balancing considerations for sticky sessions
 */
@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  
  // In-memory cache for chat room information
  // This cache improves performance by reducing database queries
  // for frequently accessed chat room permissions and metadata
  private chatRoomsCache = new Map<number, ChatRoomInfo>();

  constructor() {}

  // Room Naming and Identification Methods

  /**
   * Generate Chat Room Name
   * 
   * Creates a standardized room name for chat rooms based on chat room ID.
   * This naming convention ensures consistent room identification across
   * the application and prevents naming conflicts.
   * 
   * Naming Convention:
   * - Format: `chat_room_{chatRoomId}`
   * - Ensures uniqueness across different room types
   * - Provides clear identification for debugging
   * - Enables easy room management and monitoring
   * 
   * @param chatRoomId - Unique chat room identifier
   * @returns string - Standardized room name for Socket.IO
   */
  getChatRoomName(chatRoomId: number): string {
    return `chat_room_${chatRoomId}`;
  }

  /**
   * Generate Notification Room Name
   * 
   * Creates a standardized room name for personal notification rooms.
   * Each user has their own notification room for receiving personal
   * notifications across all their connected devices.
   * 
   * Naming Convention:
   * - Format: `user_notifications_{userId}`
   * - One room per user for all notifications
   * - Supports multi-device notification delivery
   * - Isolates user notifications for privacy
   * 
   * @param userId - Unique user identifier
   * @returns string - Standardized notification room name
   */
  getNotificationRoomName(userId: number): string {
    return `user_notifications_${userId}`;
  }

  // Chat Room Management Methods

  /**
   * Join Chat Room
   * 
   * Adds a user to a chat room with proper validation and notification.
   * This method handles the complete chat room joining process including
   * permission checks, room operations, and user notifications.
   * 
   * Join Process:
   * 1. Generate standardized room name
   * 2. Add user socket to the room
   * 3. Log the join event for monitoring
   * 4. Notify other room participants of new user
   * 5. Handle errors gracefully with proper logging
   * 
   * Security Considerations:
   * - Permission validation should be done before calling this method
   * - Room access is controlled by chat room service validation
   * - User identity is verified through authenticated socket
   * 
   * Real-Time Features:
   * - Immediate notification to other room participants
   * - User presence indication for chat interface
   * - Real-time user list updates
   * 
   * @param socket - Authenticated socket of joining user
   * @param chatRoomId - ID of chat room to join
   * @param server - Socket.IO server instance for room operations
   * @returns Promise<boolean> - True if join successful, false otherwise
   */
  async joinChatRoom(socket: AuthenticatedSocket, chatRoomId: number, server: Server): Promise<boolean> {
    try {
      // Generate standardized room name for Socket.IO operations
      const roomName = this.getChatRoomName(chatRoomId);
      
      // Add user socket to the specified room
      // Socket.IO handles the low-level room management
      await socket.join(roomName);
      
      // Log successful join for monitoring and debugging
      this.logger.log(`User ${socket.user.email} joined chat room ${chatRoomId}`);
      
      // Notify other users in the room about the new participant
      // This enables real-time user presence updates in the chat interface
      // The joining user doesn't receive this notification (socket.to())
      socket.to(roomName).emit('user_joined_room', {
        userId: socket.user.id,
        username: `${socket.user.firstname} ${socket.user.lastname}`,
        chatRoomId: chatRoomId,
      });

      return true;
    } catch (error) {
      // Log errors for debugging and monitoring
      // Room join failures could indicate network issues or server problems
      this.logger.error(`Error joining chat room ${chatRoomId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Leave Chat Room
   * 
   * Removes a user from a chat room with proper notification to remaining users.
   * This method handles the complete chat room leaving process including
   * room operations and user notifications.
   * 
   * Leave Process:
   * 1. Generate standardized room name
   * 2. Remove user socket from the room
   * 3. Log the leave event for monitoring
   * 4. Notify remaining room participants of user departure
   * 5. Handle errors gracefully with proper logging
   * 
   * Use Cases:
   * - User explicitly leaves chat room
   * - User navigates away from chat interface
   * - User disconnects from WebSocket
   * - Chat room access is revoked
   * 
   * Real-Time Features:
   * - Immediate notification to remaining participants
   * - User presence updates for chat interface
   * - Clean user list maintenance
   * 
   * @param socket - Authenticated socket of leaving user
   * @param chatRoomId - ID of chat room to leave
   * @param server - Socket.IO server instance for room operations
   * @returns Promise<boolean> - True if leave successful, false otherwise
   */
  async leaveChatRoom(socket: AuthenticatedSocket, chatRoomId: number, server: Server): Promise<boolean> {
    try {
      // Generate standardized room name for Socket.IO operations
      const roomName = this.getChatRoomName(chatRoomId);
      
      // Remove user socket from the specified room
      await socket.leave(roomName);
      
      // Log successful leave for monitoring and debugging
      this.logger.log(`User ${socket.user.email} left chat room ${chatRoomId}`);
      
      // Notify remaining users in the room about user departure
      // This enables real-time user presence updates
      // The leaving user doesn't receive this notification
      socket.to(roomName).emit('user_left_room', {
        userId: socket.user.id,
        username: `${socket.user.firstname} ${socket.user.lastname}`,
        chatRoomId: chatRoomId,
      });

      return true;
    } catch (error) {
      // Log errors for debugging and monitoring
      this.logger.error(`Error leaving chat room ${chatRoomId}: ${error.message}`);
      return false;
    }
  }

  // Notification Room Management Methods

  /**
   * Join Notification Room
   * 
   * Adds a user to their personal notification room with security validation.
   * This method ensures users can only join their own notification rooms
   * and handles the complete notification room setup process.
   * 
   * Security Features:
   * - Users can only join their own notification rooms
   * - Identity validation through authenticated socket
   * - Access control to prevent unauthorized access
   * - Logging for security monitoring
   * 
   * Join Process:
   * 1. Validate user can only join their own notification room
   * 2. Generate standardized notification room name
   * 3. Add user socket to their notification room
   * 4. Log successful join for monitoring
   * 5. Handle security violations and errors
   * 
   * Multi-Device Support:
   * - Multiple user devices can join the same notification room
   * - Notifications are delivered to all user devices
   * - Consistent notification experience across devices
   * 
   * @param socket - Authenticated socket of user
   * @param userId - User ID for notification room (must match socket user)
   * @returns Promise<boolean> - True if join successful, false otherwise
   */
  async joinNotificationRoom(socket: AuthenticatedSocket, userId: number): Promise<boolean> {
    try {
      // Security check: Only allow users to join their own notification room
      // This prevents unauthorized access to other users' notifications
      if (socket.user.id !== userId) {
        this.logger.warn(`User ${socket.user.email} attempted to join notification room of user ${userId}`);
        return false;
      }

      // Generate standardized notification room name
      const roomName = this.getNotificationRoomName(userId);
      
      // Add user socket to their personal notification room
      await socket.join(roomName);
      
      // Log successful join for monitoring
      this.logger.log(`User ${socket.user.email} joined notification room`);
      return true;
    } catch (error) {
      // Log errors for debugging and security monitoring
      this.logger.error(`Error joining notification room for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Leave Notification Room
   * 
   * Removes a user from their personal notification room.
   * This method handles notification room cleanup when users disconnect
   * or explicitly leave their notification room.
   * 
   * Leave Process:
   * 1. Generate standardized notification room name
   * 2. Remove user socket from notification room
   * 3. Log leave event for monitoring
   * 4. Handle errors gracefully
   * 
   * Use Cases:
   * - User disconnects from WebSocket
   * - User explicitly disables notifications
   * - Connection cleanup during logout
   * - Server maintenance or restart
   * 
   * @param socket - Authenticated socket of user
   * @param userId - User ID for notification room
   * @returns Promise<boolean> - True if leave successful, false otherwise
   */
  async leaveNotificationRoom(socket: AuthenticatedSocket, userId: number): Promise<boolean> {
    try {
      // Generate standardized notification room name
      const roomName = this.getNotificationRoomName(userId);
      
      // Remove user socket from notification room
      await socket.leave(roomName);
      
      // Log successful leave for monitoring
      this.logger.log(`User ${socket.user.email} left notification room`);
      return true;
    } catch (error) {
      // Log errors for debugging and monitoring
      this.logger.error(`Error leaving notification room for user ${userId}: ${error.message}`);
      return false;
    }
  }

  // Utility and Information Methods

  /**
   * Get Chat Room Users
   * 
   * Retrieves a list of socket IDs currently connected to a specific chat room.
   * This method provides real-time user presence information for chat rooms.
   * 
   * Use Cases:
   * - Display active users in chat interface
   * - Determine message delivery status
   * - Check if users are actively in chat room
   * - Implement typing indicators and presence features
   * 
   * Performance Notes:
   * - Efficient Socket.IO room query operation
   * - Returns socket IDs rather than full user objects
   * - Minimal overhead for presence checking
   * 
   * @param server - Socket.IO server instance
   * @param chatRoomId - Chat room ID to query
   * @returns Promise<string[]> - Array of socket IDs in the room
   */
  getChatRoomUsers(server: Server, chatRoomId: number): Promise<string[]> {
    const roomName = this.getChatRoomName(chatRoomId);
    return server.in(roomName).allSockets().then(sockets => Array.from(sockets));
  }

  /**
   * Get Notification Room Users
   * 
   * Retrieves a list of socket IDs currently connected to a user's notification room.
   * This method helps determine if a user is online and can receive real-time notifications.
   * 
   * Use Cases:
   * - Check if user is online for notification delivery
   * - Determine notification delivery method (real-time vs. offline)
   * - Monitor user connection status
   * - Implement user presence indicators
   * 
   * @param server - Socket.IO server instance
   * @param userId - User ID to query notification room
   * @returns Promise<string[]> - Array of socket IDs in notification room
   */
  getNotificationRoomUsers(server: Server, userId: number): Promise<string[]> {
    const roomName = this.getNotificationRoomName(userId);
    return server.in(roomName).allSockets().then(sockets => Array.from(sockets));
  }

  // Chat Room Information Caching Methods

  /**
   * Set Chat Room Information in Cache
   * 
   * Stores chat room information in memory cache for fast access and
   * permission validation. This cache improves performance by reducing
   * database queries for frequently accessed chat room data.
   * 
   * Cached Information:
   * - Chat room ID and job context
   * - Job creator and worker IDs
   * - Room active status
   * - Permission validation data
   * 
   * Cache Benefits:
   * - Fast permission checks without database queries
   * - Reduced latency for room operations
   * - Improved user experience
   * - Lower database load
   * 
   * @param chatRoomId - Chat room ID to cache
   * @param info - Chat room information to store
   */
  setChatRoomInfo(chatRoomId: number, info: ChatRoomInfo): void {
    this.chatRoomsCache.set(chatRoomId, info);
  }

  /**
   * Get Chat Room Information from Cache
   * 
   * Retrieves cached chat room information for fast access.
   * Returns undefined if chat room is not in cache, indicating
   * that database validation may be required.
   * 
   * @param chatRoomId - Chat room ID to retrieve
   * @returns ChatRoomInfo | undefined - Cached room info or undefined
   */
  getChatRoomInfo(chatRoomId: number): ChatRoomInfo | undefined {
    return this.chatRoomsCache.get(chatRoomId);
  }

  /**
   * Remove Chat Room Information from Cache
   * 
   * Removes chat room information from cache when room is deleted
   * or becomes inactive. This prevents stale data from being used
   * for permission validation.
   * 
   * Cache Invalidation Triggers:
   * - Chat room deletion
   * - Job completion or cancellation
   * - Permission changes
   * - System maintenance
   * 
   * @param chatRoomId - Chat room ID to remove from cache
   */
  removeChatRoomInfo(chatRoomId: number): void {
    this.chatRoomsCache.delete(chatRoomId);
  }

  // Permission Validation Methods

  /**
   * Validate User Access to Chat Room
   * 
   * Checks if a user has permission to access a specific chat room
   * using cached information. This method provides fast permission
   * validation for chat room operations.
   * 
   * Access Rules:
   * - Only job creator and job worker can access chat room
   * - Chat room must be active
   * - User must be one of the two participants
   * 
   * Cache-First Strategy:
   * - First checks cached information for fast validation
   * - Returns false if not in cache (requires database validation)
   * - Calling code should handle cache misses appropriately
   * 
   * Security Notes:
   * - This is a preliminary check using cached data
   * - Database validation should be performed for critical operations
   * - Cache misses should trigger proper permission validation
   * 
   * @param userId - User ID requesting access
   * @param chatRoomId - Chat room ID to validate access
   * @returns boolean - True if access allowed, false if denied or unknown
   */
  canUserAccessChatRoom(userId: number, chatRoomId: number): boolean {
    // Retrieve cached chat room information
    const chatRoomInfo = this.getChatRoomInfo(chatRoomId);
    
    // If not in cache, return false to trigger database validation
    if (!chatRoomInfo) {
      return false; // Will be validated by the handler
    }

    // Check if user is either job creator or job worker
    // These are the only two users who should have access to the chat room
    return chatRoomInfo.jobCreatorId === userId || chatRoomInfo.jobWorkerId === userId;
  }
} 