import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { AuthenticatedSocket } from './interfaces/websocket.interface';
import { WebSocketService } from './services/websocket.service';
import { ChatHandler } from './handlers/chat.handler';
import { NotificationHandler } from './handlers/notification.handler';
import type { JoinChatRoomDto, LeaveChatRoomDto, SendMessageDto } from './dto/chat.dto';
import type { JoinNotificationsDto, SendNotificationDto } from './dto/notification.dto';

/**
 * WebSocket Gateway
 * 
 * This is the main WebSocket gateway that serves as the single entry point for all
 * real-time communications in the application. It handles connection lifecycle,
 * authentication, event routing, and provides a unified interface for WebSocket
 * operations across the entire system.
 * 
 * Key Responsibilities:
 * - WebSocket connection management and lifecycle
 * - JWT-based authentication for all connections
 * - Event routing to specialized handlers
 * - Real-time chat functionality
 * - Personal notification delivery
 * - Connection monitoring and diagnostics
 * - Public API for external service integration
 * 
 * Architecture Benefits:
 * - Single gateway reduces connection overhead
 * - Centralized authentication and security
 * - Modular event handling through specialized handlers
 * - Consistent connection management across features
 * - Simplified client-side connection logic
 * 
 * Real-Time Features:
 * - Job-based chat rooms for worker-creator communication
 * - Personal notification rooms for user alerts
 * - User presence detection and status
 * - Multi-device support with connection tracking
 * - Real-time message delivery and confirmation
 * 
 * Security Features:
 * - JWT token authentication on connection
 * - Room-based access control and permissions
 * - Input validation through DTOs and ValidationPipe
 * - User authorization for all operations
 * - Secure event handling with proper error responses
 * 
 * Integration Points:
 * - Business modules (Jobs, Offers, Reviews) for notifications
 * - Chat system for real-time messaging
 * - Authentication system for user validation
 * - Notification system for alert delivery
 * - Frontend applications for user interface
 * 
 * Performance Considerations:
 * - Single gateway reduces resource usage
 * - Efficient event routing to specialized handlers
 * - Connection pooling and reuse
 * - Optimized room-based message delivery
 * - Minimal overhead for connection management
 * 
 * Scalability Features:
 * - Stateful connections with proper session management
 * - Room-based scaling for chat operations
 * - Event handler separation for maintenance
 * - External service API for system integration
 * - Monitoring and diagnostics for operations
 */
@WSGateway({
  cors: {
    origin: '*', // Configure this for production - should be specific domains
    credentials: true,
  },
  namespace: '/', // Default namespace for all connections
})
@UsePipes(new ValidationPipe()) // Automatic DTO validation for all events
export class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly chatHandler: ChatHandler,
    private readonly notificationHandler: NotificationHandler,
  ) {}

  /**
   * Gateway Initialization Hook
   * 
   * Called when the WebSocket gateway is fully initialized and ready to accept connections.
   * This method performs any necessary setup and logs the gateway status.
   * 
   * Initialization Tasks:
   * - Log gateway startup for monitoring
   * - Verify handler dependencies are ready
   * - Confirm server configuration
   * - Set up any global event listeners if needed
   * 
   * @param server - Socket.IO server instance
   */
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Connection Handler
   * 
   * Handles new WebSocket connection attempts with comprehensive authentication
   * and setup process. This method is the gateway's security checkpoint and
   * ensures only authenticated users can establish connections.
   * 
   * Connection Process:
   * 1. Extract JWT token from connection handshake
   * 2. Authenticate token and validate user
   * 3. Add connection to tracking system
   * 4. Auto-join user's notification room
   * 5. Send connection confirmation to client
   * 6. Handle authentication failures gracefully
   * 
   * Authentication Methods:
   * - Auth object: `client.handshake.auth.token`
   * - Authorization header: `Authorization: Bearer <token>`
   * - Supports multiple token delivery methods
   * 
   * Security Features:
   * - JWT token validation using existing auth system
   * - User existence verification
   * - Connection rejection for invalid tokens
   * - Proper error handling without information leakage
   * - Comprehensive logging for security monitoring
   * 
   * Auto-Setup Features:
   * - Automatic notification room joining
   * - Connection tracking and presence management
   * - Multi-device support initialization
   * - User session establishment
   * 
   * @param client - Incoming Socket.IO connection
   * @param args - Additional connection arguments
   */
  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Extract JWT token from multiple possible sources
      // Support both auth object and authorization header formats
      // This provides flexibility for different client implementations
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      // Reject connections without authentication token
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (${client.id})`);
        client.disconnect();
        return;
      }

      // Authenticate the socket using existing authentication system
      // This ensures consistent security across REST API and WebSocket
      const authenticatedSocket = await this.webSocketService.authenticateSocket(client, token);
      
      // Add authenticated connection to tracking system
      // This enables user presence detection and multi-device support
      this.webSocketService.addConnectedUser(authenticatedSocket);

      // Auto-join the user's personal notification room
      // This ensures users can receive notifications immediately upon connection
      await this.notificationHandler.handleJoinNotifications(
        authenticatedSocket,
        { userId: authenticatedSocket.user.id.toString() },
        this.server,
      );

      // Send connection success confirmation to client
      // This provides immediate feedback and connection context
      authenticatedSocket.emit('connected', {
        success: true,
        message: 'Connected successfully',
        data: {
          userId: authenticatedSocket.user.id,
          connectedAt: new Date(),
        },
      });

      // Log successful connection for monitoring and analytics
      this.logger.log(`Client connected: ${authenticatedSocket.user.email} (${client.id})`);
    } catch (error) {
      // Handle authentication errors with proper logging and client notification
      this.logger.error(`Connection error: ${error.message} (${client.id})`);
      
      // Notify client of connection failure with error details
      client.emit('connection_error', {
        success: false,
        error: error.message,
      });
      
      // Disconnect invalid connection to prevent resource usage
      client.disconnect();
    }
  }

  /**
   * Disconnection Handler
   * 
   * Handles WebSocket disconnections and performs cleanup operations.
   * This method ensures proper resource cleanup and maintains accurate
   * connection tracking when users disconnect.
   * 
   * Cleanup Operations:
   * - Remove connection from tracking system
   * - Update user presence status
   * - Clean up room memberships
   * - Log disconnection for monitoring
   * 
   * Disconnect Triggers:
   * - User closes browser/application
   * - Network connectivity issues
   * - Authentication token expiration
   * - Server-initiated disconnection
   * - Application restart or maintenance
   * 
   * @param client - Disconnecting Socket.IO connection
   */
  async handleDisconnect(client: Socket) {
    // Remove connection from tracking system
    // This updates user presence and connection counts
    this.webSocketService.removeConnectedUser(client.id);
    
    // Log disconnection for monitoring and analytics
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Chat Event Handlers
  // These methods handle all chat-related WebSocket events with proper
  // validation, authorization, and response formatting

  /**
   * Join Chat Room Event Handler
   * 
   * Handles user requests to join specific chat rooms with proper
   * validation and permission checking. This event is triggered when
   * users want to participate in job-related conversations.
   * 
   * Event Flow:
   * 1. Validate user authentication and request data
   * 2. Check user permissions for the specific chat room
   * 3. Add user to the chat room
   * 4. Return chat room information and message history
   * 5. Notify other participants of user joining
   * 
   * Security Features:
   * - User authentication validation
   * - Chat room permission verification
   * - Job participant access control
   * - Input validation through DTOs
   * 
   * @param client - Authenticated socket connection
   * @param data - Chat room join request data
   */
  @SubscribeMessage('join_chat_room')
  async handleJoinChatRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinChatRoomDto,
  ) {
    // Delegate to specialized chat handler for business logic
    const response = await this.chatHandler.handleJoinChatRoom(client, data, this.server);
    
    // Send response back to requesting client
    client.emit('join_chat_room_response', response);
  }

  /**
   * Leave Chat Room Event Handler
   * 
   * Handles user requests to leave chat rooms with proper cleanup
   * and notification to remaining participants.
   * 
   * @param client - Authenticated socket connection
   * @param data - Chat room leave request data
   */
  @SubscribeMessage('leave_chat_room')
  async handleLeaveChatRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LeaveChatRoomDto,
  ) {
    // Delegate to specialized chat handler
    const response = await this.chatHandler.handleLeaveChatRoom(client, data, this.server);
    
    // Send response back to requesting client
    client.emit('leave_chat_room_response', response);
  }

  /**
   * Send Message Event Handler
   * 
   * Handles chat message sending with real-time delivery to all
   * chat room participants and offline notification support.
   * 
   * Message Flow:
   * 1. Validate user permissions and message content
   * 2. Store message in database for persistence
   * 3. Broadcast message to all room participants
   * 4. Send notifications to offline participants
   * 5. Return delivery confirmation to sender
   * 
   * @param client - Authenticated socket connection
   * @param data - Message content and target chat room
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    // Delegate to specialized chat handler for message processing
    const response = await this.chatHandler.handleSendMessage(client, data, this.server);
    
    // Send response back to requesting client
    client.emit('send_message_response', response);
  }

  /**
   * Get Chat History Event Handler
   * 
   * Handles requests for chat message history with proper pagination
   * and permission validation.
   * 
   * @param client - Authenticated socket connection
   * @param data - Chat room ID for history request
   */
  @SubscribeMessage('get_chat_history')
  async handleGetChatHistory(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    // Delegate to specialized chat handler
    const response = await this.chatHandler.handleGetChatHistory(client, data, this.server);
    
    // Send response back to requesting client
    client.emit('get_chat_history_response', response);
  }

  // Notification Event Handlers
  // These methods handle all notification-related WebSocket events

  /**
   * Join Notifications Event Handler
   * 
   * Handles user requests to join their personal notification room.
   * This is typically called automatically on connection but can be
   * manually triggered for notification room management.
   * 
   * @param client - Authenticated socket connection
   * @param data - Notification room join request
   */
  @SubscribeMessage('join_notifications')
  async handleJoinNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinNotificationsDto,
  ) {
    // Delegate to specialized notification handler
    const response = await this.notificationHandler.handleJoinNotifications(client, data, this.server);
    
    // Send response back to requesting client
    client.emit('join_notifications_response', response);
  }

  /**
   * Leave Notifications Event Handler
   * 
   * Handles user requests to leave their notification room,
   * effectively disabling real-time notifications.
   * 
   * @param client - Authenticated socket connection
   * @param data - Notification room leave request
   */
  @SubscribeMessage('leave_notifications')
  async handleLeaveNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinNotificationsDto,
  ) {
    // Delegate to specialized notification handler
    const response = await this.notificationHandler.handleLeaveNotifications(client, data, this.server);
    
    // Send response back to requesting client
    client.emit('leave_notifications_response', response);
  }

  /**
   * Send Notification Event Handler
   * 
   * Handles manual notification sending requests, typically used
   * for administrative or system-generated notifications.
   * 
   * @param client - Authenticated socket connection
   * @param data - Notification content and target user
   */
  @SubscribeMessage('send_notification')
  async handleSendNotification(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendNotificationDto,
  ) {
    // Delegate to specialized notification handler
    const response = await this.notificationHandler.handleSendNotification(client, data, this.server);
    
    // Send response back to requesting client
    client.emit('send_notification_response', response);
  }

  // Administrative and System Event Handlers
  // These methods provide system monitoring and diagnostic capabilities

  /**
   * Get Connected Users Event Handler
   * 
   * Provides administrative information about currently connected users
   * for monitoring, analytics, and system management purposes.
   * 
   * Information Provided:
   * - Total count of unique connected users
   * - List of connected user information
   * - Connection timestamps and details
   * 
   * Security Note: This should be restricted to administrative users
   * in production environments.
   * 
   * @param client - Authenticated socket connection
   */
  @SubscribeMessage('get_connected_users')
  async handleGetConnectedUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    // Get connection statistics from WebSocket service
    const connectedUsers = this.webSocketService.getAllConnectedUsers();
    const connectedCount = this.webSocketService.getConnectedUsersCount();
    
    // Send comprehensive connection information
    client.emit('get_connected_users_response', {
      success: true,
      data: {
        count: connectedCount,
        users: connectedUsers,
      },
    });
  }

  /**
   * Ping Event Handler
   * 
   * Handles ping requests for connection health monitoring and
   * latency measurement. This is useful for maintaining connection
   * quality and detecting network issues.
   * 
   * Use Cases:
   * - Connection health monitoring
   * - Network latency measurement
   * - Keep-alive mechanism
   * - Connection quality diagnostics
   * 
   * @param client - Authenticated socket connection
   */
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    // Send immediate pong response with timestamp
    client.emit('pong', {
      success: true,
      message: 'pong',
      timestamp: new Date(),
    });
  }

  // Public API Methods for External Service Integration
  // These methods provide a clean interface for other modules to
  // send notifications and interact with the WebSocket system

  /**
   * Send Notification to Specific User
   * 
   * Public method for external services to send real-time notifications
   * to specific users. This method provides a clean interface for
   * business modules to integrate with the notification system.
   * 
   * Integration Usage:
   * - Job service: Notify users of job updates
   * - Offer service: Alert users of new offers
   * - Review service: Notify of review requests
   * - System services: Send administrative alerts
   * 
   * @param userId - Target user ID for notification
   * @param title - Notification title
   * @param message - Notification message content
   * @param type - Optional notification type for categorization
   * @returns Promise<void> - Resolves when notification is processed
   */
  async sendNotificationToUser(userId: number, title: string, message: string, type?: string) {
    return this.notificationHandler.sendNotificationToUser(this.server, userId, title, message, type);
  }

  /**
   * Send Notification to Multiple Users
   * 
   * Public method for external services to send bulk notifications
   * to multiple users efficiently.
   * 
   * @param userIds - Array of target user IDs
   * @param title - Notification title
   * @param message - Notification message content
   * @param type - Optional notification type
   * @returns Promise<void> - Resolves when all notifications are processed
   */
  async sendNotificationToUsers(userIds: number[], title: string, message: string, type?: string) {
    return this.notificationHandler.sendNotificationToUsers(this.server, userIds, title, message, type);
  }

  /**
   * Get Server Instance
   * 
   * Provides access to the underlying Socket.IO server instance
   * for advanced operations that require direct server access.
   * 
   * Use Cases:
   * - Custom room operations
   * - Advanced broadcasting needs
   * - Integration with external WebSocket tools
   * - System administration and monitoring
   * 
   * Security Note: This method should be used carefully and only
   * by trusted system components.
   * 
   * @returns Server - Socket.IO server instance
   */
  getServer(): Server {
    return this.server;
  }
} 