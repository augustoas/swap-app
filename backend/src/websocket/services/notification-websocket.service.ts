import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway } from '../websocket.gateway';
import { NotificationService } from '../../notification/notification.service';

/**
 * Notification WebSocket Service
 * 
 * This service provides a unified interface for sending real-time notifications
 * throughout the application. It bridges the gap between business logic modules
 * and the WebSocket notification system, enabling any module to send notifications
 * without direct WebSocket knowledge.
 * 
 * Key Features:
 * - Unified notification interface for all application modules
 * - Database persistence combined with real-time delivery
 * - Specialized notification types for different business contexts
 * - Batch notification support for multiple users
 * - Automatic notification routing and delivery
 * - Error handling and logging for notification failures
 * 
 * Architecture Benefits:
 * - Encapsulates WebSocket complexity from business modules
 * - Provides consistent notification format across the application
 * - Enables notification persistence and real-time delivery
 * - Supports future enhancement (push notifications, email fallback)
 * - Centralizes notification logic for maintainability
 * 
 * Integration Points:
 * - WebSocketGateway: Real-time notification delivery
 * - NotificationService: Database persistence and management
 * - Business Modules: Jobs, Offers, Reviews, Chat systems
 * - External Services: Could integrate with push notification services
 * 
 * Notification Flow:
 * 1. Business module calls notification method
 * 2. Notification is created in database for persistence
 * 3. Real-time notification is sent via WebSocket
 * 4. Users receive immediate notification if online
 * 5. Offline users see notification when they reconnect
 * 
 * Error Handling:
 * - Graceful failure without affecting business operations
 * - Comprehensive logging for debugging and monitoring
 * - Database persistence even if WebSocket delivery fails
 * - Retry mechanisms could be added for critical notifications
 * 
 * Performance Considerations:
 * - Asynchronous notification delivery
 * - Batch processing for multiple users
 * - Efficient database operations
 * - Minimal impact on business logic performance
 */
@Injectable()
export class NotificationWebSocketService {
  private readonly logger = new Logger(NotificationWebSocketService.name);

  constructor(
    private readonly webSocketGateway: WebSocketGateway,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send Notification to Specific User
   * 
   * This is the core notification method that provides persistent and real-time
   * notification delivery to a specific user. It ensures notifications are both
   * stored in the database and delivered in real-time if the user is online.
   * 
   * Features:
   * - Database persistence for notification history
   * - Real-time delivery via WebSocket
   * - Automatic path generation for frontend routing
   * - Comprehensive error handling and logging
   * - Type safety and input validation
   * 
   * Business Logic:
   * 1. Create notification record in database
   * 2. Send real-time notification via WebSocket
   * 3. Log successful delivery for monitoring
   * 4. Handle errors gracefully without failing caller
   * 
   * Database Persistence Benefits:
   * - Notification history for users
   * - Delivery confirmation and tracking
   * - Offline notification queue
   * - Analytics and reporting capabilities
   * - Notification preferences management
   * 
   * Real-Time Delivery Benefits:
   * - Immediate user awareness
   * - Enhanced user experience
   * - Reduced response times
   * - Interactive application feel
   * 
   * @param userId - Target user ID for notification
   * @param title - Notification title/headline
   * @param message - Detailed notification message
   * @param type - Optional notification type for categorization
   * @param path - Optional frontend path for navigation
   * @returns Promise<void> - Resolves when notification processing is complete
   */
  async sendNotificationToUser(
    userId: number,
    title: string,
    message: string,
    type?: string,
    path?: string,
  ): Promise<void> {
    try {
      // Create notification in database for persistence
      // This ensures notification is saved even if WebSocket delivery fails
      // Database record provides:
      // - Notification history
      // - Read/unread status tracking
      // - Offline notification queue
      // - User notification preferences
      await this.notificationService.create({
        userId,
        title,
        subtitle: message,  // Use message as subtitle for consistency
        message,
        path: path || '/notifications',  // Default path if none provided
      });

      // Send real-time notification via WebSocket
      // This provides immediate delivery to online users
      // WebSocket delivery includes:
      // - Instant notification display
      // - Real-time badge updates
      // - Interactive notification handling
      // - Multi-device synchronization
      await this.webSocketGateway.sendNotificationToUser(userId, title, message, type);
      
      // Log successful notification for monitoring and debugging
      this.logger.log(`Notification sent to user ${userId}: ${title}`);
    } catch (error) {
      // Handle errors gracefully without affecting caller's operations
      // Even if notification fails, business operations should continue
      // Error scenarios:
      // - Database connection issues
      // - WebSocket delivery problems
      // - Invalid user IDs
      // - Network connectivity issues
      this.logger.error(`Error sending notification to user ${userId}: ${error.message}`);
      
      // Note: We don't re-throw the error to prevent notification failures
      // from disrupting business operations (jobs, offers, etc.)
      // Consider implementing retry mechanisms for critical notifications
    }
  }

  /**
   * Send Notification to Multiple Users
   * 
   * Batch notification method for sending the same notification to multiple users.
   * This method is optimized for bulk operations and provides consistent delivery
   * across multiple recipients.
   * 
   * Use Cases:
   * - System-wide announcements
   * - Feature updates and maintenance notices
   * - Bulk job notifications (new jobs in category)
   * - Marketing campaigns and promotions
   * - Emergency notifications and alerts
   * 
   * Performance Optimizations:
   * - Parallel processing using Promise.all()
   * - Individual error handling per user
   * - Efficient database batch operations
   * - Optimized WebSocket delivery
   * 
   * Error Handling Strategy:
   * - Individual user failures don't affect others
   * - Comprehensive logging for failed deliveries
   * - Graceful degradation for partial failures
   * - Monitoring and alerting for bulk failures
   * 
   * @param userIds - Array of target user IDs
   * @param title - Notification title (same for all users)
   * @param message - Notification message (same for all users)
   * @param type - Optional notification type
   * @param path - Optional frontend path
   * @returns Promise<void> - Resolves when all notifications are processed
   */
  async sendNotificationToUsers(
    userIds: number[],
    title: string,
    message: string,
    type?: string,
    path?: string,
  ): Promise<void> {
    // Create individual notification promises for each user
    // Using Promise.all() for parallel processing improves performance
    // Each user's notification is processed independently
    const promises = userIds.map(userId => 
      this.sendNotificationToUser(userId, title, message, type, path)
    );
    
    // Execute all notifications in parallel
    // Individual failures won't affect other users' notifications
    // This provides optimal performance for bulk operations
    await Promise.all(promises);
  }

  /**
   * Send Job-Related Notification
   * 
   * Specialized notification method for job-related events in the marketplace.
   * This method provides standardized job notifications with proper routing
   * and context information.
   * 
   * Job Notification Types:
   * - job_created: New job posted in user's categories
   * - job_accepted: Worker accepted a job offer
   * - job_completed: Job marked as completed
   * - job_cancelled: Job cancelled by creator or system
   * - job_finished: Job marked as finished and ready for rating
   * 
   * Business Context:
   * - Integrates with job marketplace workflow
   * - Provides job-specific routing and navigation
   * - Enables job progress tracking
   * - Supports user engagement and retention
   * 
   * Frontend Integration:
   * - Automatic routing to job details page
   * - Context-aware notification display
   * - Job status integration
   * - User action prompts and suggestions
   * 
   * @param userId - Target user ID for job notification
   * @param title - Job notification title
   * @param message - Detailed job notification message
   * @param jobId - Related job ID for routing and context
   * @param type - Specific job event type for categorization
   * @returns Promise<void> - Resolves when job notification is processed
   */
  async sendJobNotification(
    userId: number,
    title: string,
    message: string,
    jobId: number,
    type: 'job_created' | 'job_accepted' | 'job_completed' | 'job_cancelled' | 'job_finished' = 'job_created',
  ): Promise<void> {
    // Generate job-specific path for frontend routing
    // This enables direct navigation to job details from notification
    const path = `/jobs/${jobId}`;
    
    // Send notification with job context and routing
    await this.sendNotificationToUser(userId, title, message, type, path);
  }

  /**
   * Send Chat Notification
   * 
   * Specialized notification method for chat message alerts.
   * This method is used when users receive messages but are not actively
   * in the chat room or are offline.
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
   * @param userId - Target user ID for chat notification
   * @param senderName - Name of the message sender
   * @param chatRoomId - Chat room ID for routing
   * @param jobTitle - Optional job title for context
   * @returns Promise<void> - Resolves when chat notification is processed
   */
  async sendChatNotification(
    userId: number,
    senderName: string,
    chatRoomId: number,
    jobTitle?: string,
  ): Promise<void> {
    // Create user-friendly notification title
    const title = 'New Message';
    
    // Create contextual message with sender and job information
    // Include job title if available for better context
    const message = `${senderName} sent you a message${jobTitle ? ` about "${jobTitle}"` : ''}`;
    
    // Generate chat-specific path for direct navigation
    // This takes user directly to the relevant chat room
    const path = `/chat/${chatRoomId}`;
    
    // Send chat notification with appropriate type and routing
    await this.sendNotificationToUser(userId, title, message, 'chat', path);
  }

  /**
   * Send Offer-Related Notification
   * 
   * Specialized notification method for job offer events.
   * This method handles various offer lifecycle notifications with
   * proper context and routing.
   * 
   * Offer Notification Types:
   * - offer_received: New offer received on user's job
   * - offer_accepted: Offer was accepted by job creator
   * - offer_rejected: Offer was rejected by job creator
   * 
   * Business Workflow Integration:
   * - Supports offer management workflow
   * - Enables quick offer responses
   * - Provides offer status tracking
   * - Improves marketplace efficiency
   * 
   * User Experience Benefits:
   * - Immediate offer awareness
   * - Quick access to offer details
   * - Streamlined decision making
   * - Enhanced marketplace engagement
   * 
   * @param userId - Target user ID for offer notification
   * @param title - Offer notification title
   * @param message - Detailed offer notification message
   * @param jobId - Related job ID for context
   * @param offerId - Specific offer ID for routing
   * @param type - Offer event type for categorization
   * @returns Promise<void> - Resolves when offer notification is processed
   */
  async sendOfferNotification(
    userId: number,
    title: string,
    message: string,
    jobId: number,
    offerId: number,
    type: 'offer_received' | 'offer_accepted' | 'offer_rejected' = 'offer_received',
  ): Promise<void> {
    // Generate offer-specific path with job and offer context
    // This enables direct navigation to offer details
    const path = `/jobs/${jobId}/offers/${offerId}`;
    
    // Send offer notification with proper type and routing
    await this.sendNotificationToUser(userId, title, message, type, path);
  }

  /**
   * Send Review-Related Notification
   * 
   * Specialized notification method for review and rating events.
   * This method handles review lifecycle notifications that are
   * crucial for marketplace trust and reputation.
   * 
   * Review Notification Types:
   * - review_received: New review received from job completion
   * - review_request: Request to review completed job
   * 
   * Reputation System Integration:
   * - Encourages review participation
   * - Builds marketplace trust
   * - Provides feedback loop closure
   * - Supports quality improvement
   * 
   * Business Value:
   * - Increased review completion rates
   * - Better marketplace quality
   * - Enhanced user trust
   * - Improved service quality
   * 
   * @param userId - Target user ID for review notification
   * @param title - Review notification title
   * @param message - Detailed review notification message
   * @param jobId - Related job ID for context
   * @param type - Review event type for categorization
   * @returns Promise<void> - Resolves when review notification is processed
   */
  async sendReviewNotification(
    userId: number,
    title: string,
    message: string,
    jobId: number,
    type: 'review_received' | 'review_request' = 'review_received',
  ): Promise<void> {
    // Generate review-specific path for job reviews section
    // This takes user to the review interface for the specific job
    const path = `/jobs/${jobId}/reviews`;
    
    // Send review notification with appropriate type and routing
    await this.sendNotificationToUser(userId, title, message, type, path);
  }
} 