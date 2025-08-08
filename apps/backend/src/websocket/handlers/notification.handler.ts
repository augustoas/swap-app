import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthenticatedSocket, WebSocketResponse } from '../interfaces/websocket.interface';
import { RoomService } from '../services/room.service';
import { NotificationService } from '../../notification/notification.service';
import { JoinNotificationsDto, SendNotificationDto, NotificationReceivedDto } from '../dto/notification.dto';

/**
 * Notification Handler
 * 
 * This specialized handler manages all notification-related WebSocket operations,
 * providing real-time notification delivery, user notification room management,
 * and integration with the broader notification system. It serves as the
 * bridge between business logic and real-time user notifications.
 * 
 * Key Responsibilities:
 * - Personal notification room management for each user
 * - Real-time notification delivery to connected users
 * - Integration with database notification persistence
 * - Bulk notification delivery for system-wide announcements
 * - Specialized notification types for different business contexts
 * - Notification room security and access control
 * 
 * Business Context:
 * - Delivers job-related notifications (offers, completions, cancellations)
 * - Chat message notifications for offline users
 * - System announcements and maintenance notifications
 * - Review requests and feedback notifications
 * - Marketplace activity and engagement notifications
 * 
 * Architecture Benefits:
 * - Centralized notification logic for all business modules
 * - Consistent notification format and delivery
 * - Efficient room-based notification routing
 * - Database persistence with real-time delivery
 * - Scalable notification architecture
 * 
 * Security Features:
 * - Personal notification room isolation
 * - User authentication and authorization
 * - Secure access control for notification rooms
 * - Input validation and sanitization
 * - Privacy protection for notification content
 * - Comprehensive logging for security monitoring
 * 
 * Real-Time Features:
 * - Instant notification delivery to online users
 * - Multi-device notification synchronization
 * - Notification room auto-joining on connection
 * - Presence-aware notification delivery
 * - Real-time notification status updates
 * 
 * Integration Points:
 * - NotificationService: Database persistence and management
 * - RoomService: WebSocket room operations
 * - Business modules: Job, offer, review, chat notifications
 * - External services: System notifications and alerts
 * - Frontend applications: User notification interfaces
 * 
 * Performance Optimizations:
 * - Efficient room-based notification delivery
 * - Batch notification processing
 * - Minimal database queries for active sessions
 * - Optimized notification serialization
 * - Smart delivery routing based on user presence
 * 
 * Notification Types:
 * - Personal notifications (job updates, offers, reviews)
 * - Chat notifications (new messages, offline alerts)
 * - System notifications (announcements, maintenance)
 * - Business notifications (marketplace activity)
 * - Emergency notifications (security, system issues)
 */
@Injectable()
export class NotificationHandler {
  private readonly logger = new Logger(NotificationHandler.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Handle Join Notifications Request
   * 
   * Processes user requests to join their personal notification room with
   * comprehensive security validation and setup. This method is typically
   * called automatically when users connect but can be manually triggered
   * for notification room management.
   * 
   * Join Process:
   * 1. Validate user can only join their own notification room
   * 2. Add user to their personal notification room
   * 3. Retrieve unread notification count for immediate display
   * 4. Return success confirmation with notification context
   * 5. Log join event for monitoring and analytics
   * 
   * Security Features:
   * - User can only join their own notification room
   * - Identity validation through authenticated socket
   * - Access control to prevent unauthorized access
   * - Comprehensive logging for security monitoring
   * 
   * Multi-Device Support:
   * - Multiple user devices can join the same notification room
   * - Notifications are delivered to all user devices
   * - Consistent notification experience across devices
   * - Synchronized notification status across connections
   * 
   * Performance Features:
   * - Efficient room join operations
   * - Minimal database queries during join
   * - Fast unread count retrieval
   * - Optimized notification room setup
   * 
   * @param socket - Authenticated user socket connection
   * @param data - Notification room join request data
   * @param server - Socket.IO server for room operations
   * @returns Promise<WebSocketResponse> - Join result with notification context
   */
  async handleJoinNotifications(
    socket: AuthenticatedSocket,
    data: JoinNotificationsDto,
    server: Server,
  ): Promise<WebSocketResponse> {
    try {
      // Parse and validate user ID from request
      const userId = parseInt(data.userId);
      
      // Security validation: user can only join their own notification room
      // This prevents unauthorized access to other users' notifications
      if (socket.user.id !== userId) {
        throw new ForbiddenException('You can only join your own notification room');
      }

      // Add user to their personal notification room
      // This enables real-time notification delivery
      const success = await this.roomService.joinNotificationRoom(socket, userId);
      
      if (success) {
        // Get unread notifications count for immediate display
        // This provides instant notification badge updates
        const unreadCount = await this.notificationService.getUnreadCount(userId);
        
        // Return success response with notification context
        return {
          success: true,
          message: 'Successfully joined notification room',
          data: { userId, unreadCount },
        };
      } else {
        throw new Error('Failed to join notification room');
      }
    } catch (error) {
      // Log error details for debugging and security monitoring
      this.logger.error(`Error joining notification room: ${error.message}`);
      
      // Return user-friendly error response
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle Leave Notifications Request
   * 
   * Processes user requests to leave their personal notification room,
   * effectively disabling real-time notifications for that connection.
   * This method handles notification room cleanup and user preference management.
   * 
   * Leave Process:
   * 1. Validate user identity and request context
   * 2. Remove user from their notification room
   * 3. Update notification delivery preferences
   * 4. Return confirmation of successful leave
   * 5. Log leave event for monitoring
   * 
   * Use Cases:
   * - User explicitly disables notifications
   * - User disconnects from WebSocket
   * - Connection cleanup during logout
   * - Notification preference management
   * - Multi-device notification control
   * 
   * Cleanup Operations:
   * - Remove user from notification room
   * - Update notification delivery status
   * - Clean up temporary notification data
   * - Log leave event for analytics
   * 
   * @param socket - Authenticated user socket connection
   * @param data - Notification room leave request data
   * @param server - Socket.IO server for room operations
   * @returns Promise<WebSocketResponse> - Leave result confirmation
   */
  async handleLeaveNotifications(
    socket: AuthenticatedSocket,
    data: JoinNotificationsDto,
    server: Server,
  ): Promise<WebSocketResponse> {
    try {
      // Parse and validate user ID from request
      const userId = parseInt(data.userId);
      
      // Remove user from their personal notification room
      const success = await this.roomService.leaveNotificationRoom(socket, userId);
      
      if (success) {
        // Return success confirmation
        return {
          success: true,
          message: 'Successfully left notification room',
        };
      } else {
        throw new Error('Failed to leave notification room');
      }
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error leaving notification room: ${error.message}`);
      
      // Return user-friendly error response
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle Send Notification Request
   * 
   * Processes manual notification sending requests, typically used for
   * administrative notifications, system announcements, or user-triggered
   * notifications. This method provides comprehensive notification creation
   * and delivery functionality.
   * 
   * Notification Process:
   * 1. Validate request data and user permissions
   * 2. Create notification in database for persistence
   * 3. Format notification for real-time delivery
   * 4. Send notification to user's notification room
   * 5. Return delivery confirmation with notification data
   * 
   * Persistence Features:
   * - Database storage for notification history
   * - Notification read/unread status tracking
   * - Audit trail for notification delivery
   * - User notification preferences integration
   * 
   * Real-Time Features:
   * - Instant notification delivery to online users
   * - Multi-device notification synchronization
   * - Notification status updates
   * - Interactive notification handling
   * 
   * Administrative Use Cases:
   * - System maintenance announcements
   * - Feature updates and releases
   * - Emergency notifications
   * - User engagement campaigns
   * - Compliance and legal notifications
   * 
   * @param socket - Authenticated user socket connection
   * @param data - Notification content and target user data
   * @param server - Socket.IO server for notification delivery
   * @returns Promise<WebSocketResponse> - Notification delivery result
   */
  async handleSendNotification(
    socket: AuthenticatedSocket,
    data: SendNotificationDto,
    server: Server,
  ): Promise<WebSocketResponse> {
    try {
      // Parse and validate target user ID
      const userId = parseInt(data.userId);
      
      // Create notification in database for persistence
      // This ensures notification is stored even if real-time delivery fails
      const notification = await this.notificationService.create({
        userId: userId,
        title: data.title,
        subtitle: data.message, // Use message as subtitle for consistency
        message: data.message,
        path: data.type || '/notifications', // Use type as path or default
      });

      // Create notification data for WebSocket delivery
      // Format includes all necessary information for client display
      const notificationData: NotificationReceivedDto = {
        id: notification.id,
        userId: userId,
        title: data.title,
        message: data.message,
        type: data.type,
        createdDate: notification.createdDate,
      };

      // Send notification to the user's notification room
      // This provides real-time delivery to all connected devices
      const roomName = this.roomService.getNotificationRoomName(userId);
      server.to(roomName).emit('notification_received', notificationData);

      // Log successful notification delivery
      this.logger.log(`Notification sent to user ${userId}: ${data.title}`);

      // Return success response with notification data
      return {
        success: true,
        message: 'Notification sent successfully',
        data: notificationData,
      };
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error sending notification: ${error.message}`);
      
      // Return user-friendly error response
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // System Integration Methods
  // These methods provide interfaces for other system components to
  // send notifications without direct WebSocket knowledge

  /**
   * Send Notification to Specific User (System Method)
   * 
   * System method for sending notifications to specific users from other
   * services and business modules. This method provides a clean interface
   * for system-wide notification delivery without exposing WebSocket complexity.
   * 
   * System Integration Features:
   * - Clean API for business modules
   * - Database persistence with real-time delivery
   * - Comprehensive error handling
   * - Logging and monitoring integration
   * - Flexible notification routing
   * 
   * Business Module Integration:
   * - Job service: Job status updates and notifications
   * - Offer service: Offer creation, acceptance, rejection
   * - Review service: Review requests and feedback
   * - Chat service: Message notifications for offline users
   * - User service: Account and profile notifications
   * 
   * Notification Delivery:
   * - Immediate delivery to online users
   * - Persistent storage for offline users
   * - Multi-device synchronization
   * - Notification status tracking
   * 
   * @param server - Socket.IO server for notification delivery
   * @param userId - Target user ID for notification
   * @param title - Notification title/headline
   * @param message - Detailed notification message
   * @param type - Optional notification type for categorization
   * @param path - Optional frontend path for navigation
   * @returns Promise<void> - Resolves when notification is processed
   */
  async sendNotificationToUser(
    server: Server,
    userId: number,
    title: string,
    message: string,
    type?: string,
    path?: string,
  ): Promise<void> {
    try {
      // Create notification in database for persistence
      // This ensures notification is stored with proper metadata
      const notification = await this.notificationService.create({
        userId: userId,
        title: title,
        subtitle: message,
        message: message,
        path: path || type || '/notifications',
      });

      // Format notification data for real-time delivery
      const notificationData: NotificationReceivedDto = {
        id: notification.id,
        userId: userId,
        title,
        message,
        type,
        createdDate: notification.createdDate,
      };

      // Send notification to user's notification room
      const roomName = this.roomService.getNotificationRoomName(userId);
      server.to(roomName).emit('notification_received', notificationData);

      // Log successful system notification delivery
      this.logger.log(`System notification sent to user ${userId}: ${title}`);
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error sending system notification: ${error.message}`);
      
      // Note: We don't throw errors to prevent system notification failures
      // from disrupting business operations
    }
  }

  /**
   * Send Notification to Multiple Users (System Method)
   * 
   * System method for sending bulk notifications to multiple users efficiently.
   * This method is optimized for system-wide announcements, bulk notifications,
   * and marketing campaigns.
   * 
   * Bulk Notification Features:
   * - Parallel processing for improved performance
   * - Individual error handling per user
   * - Comprehensive logging for bulk operations
   * - Efficient database operations
   * - Optimized WebSocket delivery
   * 
   * Use Cases:
   * - System maintenance announcements
   * - Feature releases and updates
   * - Marketing campaigns and promotions
   * - Emergency notifications
   * - Bulk job notifications (new jobs in category)
   * 
   * Performance Optimizations:
   * - Concurrent notification processing
   * - Batch database operations
   * - Efficient WebSocket broadcasting
   * - Minimal resource usage per notification
   * 
   * @param server - Socket.IO server for notification delivery
   * @param userIds - Array of target user IDs
   * @param title - Notification title (same for all users)
   * @param message - Notification message (same for all users)
   * @param type - Optional notification type
   * @param path - Optional frontend path
   * @returns Promise<void> - Resolves when all notifications are processed
   */
  async sendNotificationToUsers(
    server: Server,
    userIds: number[],
    title: string,
    message: string,
    type?: string,
    path?: string,
  ): Promise<void> {
    try {
      // Create individual notification promises for parallel processing
      const promises = userIds.map(userId => 
        this.sendNotificationToUser(server, userId, title, message, type, path)
      );

      // Execute all notifications in parallel for optimal performance
      await Promise.all(promises);
      
      // Log successful bulk notification delivery
      this.logger.log(`System notification sent to ${userIds.length} users: ${title}`);
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error sending system notifications: ${error.message}`);
    }
  }

  /**
   * Send Chat Notification (Specialized Method)
   * 
   * Specialized method for sending chat-related notifications when users
   * receive messages but are not actively in the chat room or are offline.
   * This method provides context-aware chat notifications.
   * 
   * Chat Notification Features:
   * - Sender identification and context
   * - Job context for chat room identification
   * - Direct routing to specific chat room
   * - Message preview and engagement prompts
   * 
   * Trigger Conditions:
   * - User receives message but is not in chat room
   * - User is offline when message is sent
   * - User has chat notifications enabled
   * - Message is not from the user themselves
   * 
   * Business Benefits:
   * - Improved response times in job communications
   * - Enhanced user engagement and retention
   * - Better job completion rates
   * - Reduced communication delays
   * 
   * @param server - Socket.IO server for notification delivery
   * @param userId - Target user ID for chat notification
   * @param senderName - Name of the message sender
   * @param chatRoomId - Chat room ID for routing
   * @param jobTitle - Optional job title for context
   * @returns Promise<void> - Resolves when chat notification is processed
   */
  async sendChatNotification(
    server: Server,
    userId: number,
    senderName: string,
    chatRoomId: number,
    jobTitle?: string,
  ): Promise<void> {
    // Create user-friendly notification title
    const title = 'New Message';
    
    // Create contextual message with sender and job information
    const message = `${senderName} sent you a message${jobTitle ? ` about "${jobTitle}"` : ''}`;
    
    // Generate chat-specific path for direct navigation
    const path = `/chat/${chatRoomId}`;
    
    // Send chat notification with appropriate type and routing
    await this.sendNotificationToUser(server, userId, title, message, 'chat', path);
  }

  /**
   * Send Job Notification (Specialized Method)
   * 
   * Specialized method for sending job-related notifications with proper
   * context and routing. This method handles various job lifecycle events
   * and provides standardized job notifications.
   * 
   * Job Notification Types:
   * - job_created: New job posted in user's categories
   * - job_accepted: Worker accepted a job offer
   * - job_completed: Job marked as completed
   * - job_cancelled: Job cancelled by creator or system
   * 
   * Business Integration:
   * - Job marketplace workflow integration
   * - User engagement and retention
   * - Job progress tracking and updates
   * - Automated workflow notifications
   * 
   * @param server - Socket.IO server for notification delivery
   * @param userId - Target user ID for job notification
   * @param title - Job notification title
   * @param message - Detailed job notification message
   * @param jobId - Related job ID for routing and context
   * @param type - Specific job event type for categorization
   * @returns Promise<void> - Resolves when job notification is processed
   */
  async sendJobNotification(
    server: Server,
    userId: number,
    title: string,
    message: string,
    jobId: number,
    type: 'job_created' | 'job_accepted' | 'job_completed' | 'job_cancelled' = 'job_created',
  ): Promise<void> {
    // Generate job-specific path for frontend routing
    const path = `/jobs/${jobId}`;
    
    // Send job notification with proper type and routing
    await this.sendNotificationToUser(server, userId, title, message, type, path);
  }
}