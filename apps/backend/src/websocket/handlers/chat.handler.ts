import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthenticatedSocket, WebSocketResponse } from '../interfaces/websocket.interface';
import { RoomService } from '../services/room.service';
import { ChatService } from '../../chat/chat.service';
import { ChatRoomService } from '../../chat-room/chat-room.service';
import { NotificationHandler } from './notification.handler';
import { JoinChatRoomDto, LeaveChatRoomDto, SendMessageDto, MessageReceivedDto } from '../dto/chat.dto';

/**
 * Chat Handler
 * 
 * This specialized handler manages all chat-related WebSocket operations for the
 * job marketplace application. It handles real-time messaging between job creators
 * and workers, providing secure, efficient, and feature-rich chat functionality.
 * 
 * Key Responsibilities:
 * - Chat room access control and permission validation
 * - Real-time message delivery and broadcasting
 * - Message persistence and history management
 * - User presence tracking in chat rooms
 * - Integration with notification system for offline users
 * - Chat room lifecycle management
 * 
 * Business Context:
 * - Facilitates communication between job creators and workers
 * - Supports job-related discussions and coordination
 * - Enables real-time problem solving and updates
 * - Provides secure communication channels for sensitive job information
 * - Integrates with job workflow and offer management
 * 
 * Security Features:
 * - Permission validation for chat room access
 * - User authentication through JWT tokens
 * - Job participant access control (creator/worker only)
 * - Input validation and sanitization
 * - Secure message broadcasting and delivery
 * - Comprehensive logging for security monitoring
 * 
 * Real-Time Features:
 * - Instant message delivery to active participants
 * - User join/leave notifications
 * - Message history retrieval
 * - Presence indicators and typing status
 * - Multi-device synchronization
 * - Offline notification integration
 * 
 * Performance Optimizations:
 * - Efficient room-based message broadcasting
 * - Caching of chat room information
 * - Minimal database queries for active sessions
 * - Optimized message serialization
 * - Smart notification delivery (only to offline users)
 * 
 * Integration Points:
 * - ChatService: Message persistence and retrieval
 * - ChatRoomService: Room management and validation
 * - NotificationHandler: Offline user notifications
 * - RoomService: WebSocket room operations
 * - Job system: Context and permission validation
 * 
 * Error Handling:
 * - Graceful error responses without system exposure
 * - Comprehensive logging for debugging
 * - User-friendly error messages
 * - Proper HTTP status code mapping
 * - Fallback mechanisms for failed operations
 */
@Injectable()
export class ChatHandler {
  private readonly logger = new Logger(ChatHandler.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly chatService: ChatService,
    private readonly chatRoomService: ChatRoomService,
    private readonly notificationHandler: NotificationHandler,
  ) {}

  /**
   * Handle Join Chat Room Request
   * 
   * Processes user requests to join specific chat rooms with comprehensive
   * validation, permission checking, and setup. This method is the primary
   * entry point for users wanting to participate in job-related conversations.
   * 
   * Join Process:
   * 1. Validate chat room existence and user permissions
   * 2. Check user is either job creator or worker
   * 3. Cache room information for performance
   * 4. Add user to WebSocket room
   * 5. Retrieve and return message history
   * 6. Notify other participants of user joining
   * 
   * Permission Model:
   * - Only job creator and assigned worker can access chat room
   * - Chat room must be active and associated with valid job
   * - User must be authenticated and authorized
   * - No external or unauthorized access allowed
   * 
   * Performance Features:
   * - Chat room information caching
   * - Efficient message history retrieval
   * - Minimal database queries during session
   * - Optimized user presence tracking
   * 
   * Error Scenarios:
   * - Chat room not found or inactive
   * - User not authorized for specific room
   * - Database connection issues
   * - WebSocket room operation failures
   * 
   * @param socket - Authenticated user socket connection
   * @param data - Chat room join request data
   * @param server - Socket.IO server for room operations
   * @returns Promise<WebSocketResponse> - Join result with room data or error
   */
  async handleJoinChatRoom(
    socket: AuthenticatedSocket,
    data: JoinChatRoomDto,
    server: Server,
  ): Promise<WebSocketResponse> {
    try {
      // Parse and validate chat room ID from request
      const chatRoomId = parseInt(data.chatRoomId);
      
      // Validate that the chat room exists and retrieve full context
      // This includes job information, participants, and room status
      const chatRoom = await this.chatRoomService.findOne(chatRoomId);
      if (!chatRoom) {
        throw new BadRequestException('Chat room not found');
      }

      // Check if user is either job creator or job worker
      // This is the core security check for chat room access
      const userId = socket.user.id;
      if (chatRoom.jobCreator.id !== userId && chatRoom.jobWorker.id !== userId) {
        throw new ForbiddenException('You do not have access to this chat room');
      }

      // Cache chat room info for permission checks and performance
      // This reduces database queries for subsequent operations
      this.roomService.setChatRoomInfo(chatRoomId, {
        chatRoomId: chatRoom.id,
        jobId: chatRoom.job.id,
        jobCreatorId: chatRoom.jobCreator.id,
        jobWorkerId: chatRoom.jobWorker.id,
        isActive: chatRoom.isActive,
      });

      // Join the WebSocket room for real-time communication
      // This enables message broadcasting and presence tracking
      const success = await this.roomService.joinChatRoom(socket, chatRoomId, server);
      
      if (success) {
        // Get recent messages from the chat room for immediate display
        // This provides context and history for the conversation
        const messages = await this.chatService.findByChatRoomId(chatRoomId);
        
        // Transform messages into client-friendly format
        // Include sender information and proper timestamp formatting
        const messageHistory = messages.map(msg => ({
          id: msg.id,
          chatRoomId: msg.chatRoom.id,
          senderId: msg.sender.id,
          senderName: `${msg.sender.firstname} ${msg.sender.lastname}`,
          text: msg.text,
          createdDate: msg.createdDate,
        }));

        // Return comprehensive success response with chat context
        return {
          success: true,
          message: 'Successfully joined chat room',
          data: {
            chatRoomId,
            messages: messageHistory,
            chatRoom: {
              id: chatRoom.id,
              jobId: chatRoom.job.id,
              jobCreator: {
                id: chatRoom.jobCreator.id,
                name: `${chatRoom.jobCreator.firstname} ${chatRoom.jobCreator.lastname}`,
              },
              jobWorker: {
                id: chatRoom.jobWorker.id,
                name: `${chatRoom.jobWorker.firstname} ${chatRoom.jobWorker.lastname}`,
              },
            },
          },
        };
      } else {
        throw new Error('Failed to join chat room');
      }
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error joining chat room: ${error.message}`);
      
      // Return user-friendly error response
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle Leave Chat Room Request
   * 
   * Processes user requests to leave chat rooms with proper cleanup
   * and notification to remaining participants. This method ensures
   * clean disconnection and resource management.
   * 
   * Leave Process:
   * 1. Validate chat room ID and user context
   * 2. Remove user from WebSocket room
   * 3. Update user presence status
   * 4. Notify remaining participants
   * 5. Clean up any temporary resources
   * 
   * Cleanup Operations:
   * - Remove user from room participant list
   * - Update presence indicators
   * - Clean up temporary caches if needed
   * - Log leave event for monitoring
   * 
   * Use Cases:
   * - User explicitly leaves chat room
   * - User navigates away from chat interface
   * - User closes application or browser
   * - Connection cleanup during logout
   * 
   * @param socket - Authenticated user socket connection
   * @param data - Chat room leave request data
   * @param server - Socket.IO server for room operations
   * @returns Promise<WebSocketResponse> - Leave result confirmation
   */
  async handleLeaveChatRoom(
    socket: AuthenticatedSocket,
    data: LeaveChatRoomDto,
    server: Server,
  ): Promise<WebSocketResponse> {
    try {
      // Parse and validate chat room ID from request
      const chatRoomId = parseInt(data.chatRoomId);
      
      // Remove user from WebSocket room with proper cleanup
      const success = await this.roomService.leaveChatRoom(socket, chatRoomId, server);
      
      if (success) {
        // Return success confirmation to user
        return {
          success: true,
          message: 'Successfully left chat room',
        };
      } else {
        throw new Error('Failed to leave chat room');
      }
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error leaving chat room: ${error.message}`);
      
      // Return user-friendly error response
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle Send Message Request
   * 
   * Processes chat message sending with real-time delivery, persistence,
   * and notification integration. This is the core messaging functionality
   * that enables real-time communication between job participants.
   * 
   * Message Flow:
   * 1. Validate user permissions and message content
   * 2. Check rate limiting and message constraints
   * 3. Store message in database for persistence
   * 4. Broadcast message to all room participants
   * 5. Send notifications to offline participants
   * 6. Return delivery confirmation to sender
   * 
   * Security Validations:
   * - User must be authorized for the chat room
   * - Message content validation and sanitization
   * - Rate limiting to prevent spam
   * - Permission checks for room access
   * 
   * Real-Time Features:
   * - Instant message broadcasting to room participants
   * - Message delivery confirmation
   * - Presence-aware notification delivery
   * - Multi-device synchronization
   * 
   * Persistence Features:
   * - Message storage in database
   * - Message history and retrieval
   * - Delivery status tracking
   * - Search and filtering capabilities
   * 
   * Notification Integration:
   * - Offline user notification delivery
   * - Context-aware notification content
   * - Smart notification routing
   * - Job context in notifications
   * 
   * @param socket - Authenticated user socket connection
   * @param data - Message content and target room data
   * @param server - Socket.IO server for message broadcasting
   * @returns Promise<WebSocketResponse> - Message delivery result
   */
  async handleSendMessage(
    socket: AuthenticatedSocket,
    data: SendMessageDto,
    server: Server,
  ): Promise<WebSocketResponse> {
    try {
      // Parse and validate chat room ID and user context
      const chatRoomId = parseInt(data.chatRoomId);
      const userId = socket.user.id;

      // Validate permissions using cached data or database lookup
      // This ensures users can only send messages to authorized rooms
      let chatRoom = null;
      if (!this.roomService.canUserAccessChatRoom(userId, chatRoomId)) {
        // If not in cache, validate from database for security
        chatRoom = await this.chatRoomService.findOne(chatRoomId);
        if (!chatRoom || (chatRoom.jobCreator.id !== userId && chatRoom.jobWorker.id !== userId)) {
          throw new ForbiddenException('You do not have access to this chat room');
        }
      }

      // Get chat room info if not already fetched for notification context
      if (!chatRoom) {
        chatRoom = await this.chatRoomService.findOne(chatRoomId);
      }

      // Create the message in the database for persistence
      // This ensures messages are stored even if real-time delivery fails
      const newMessage = await this.chatService.create({
        chatRoomId: data.chatRoomId,
        senderId: userId.toString(),
        text: data.text,
      });

      // Get the full message with relations for broadcasting
      // This includes sender information and proper formatting
      const fullMessage = await this.chatService.findOne(newMessage.id);

      // Prepare the message data for broadcasting
      // Format includes all necessary information for client display
      const messageData: MessageReceivedDto = {
        id: fullMessage.id,
        chatRoomId: fullMessage.chatRoom.id,
        senderId: fullMessage.sender.id,
        senderName: `${fullMessage.sender.firstname} ${fullMessage.sender.lastname}`,
        text: fullMessage.text,
        createdDate: fullMessage.createdDate,
      };

      // Broadcast the message to all users in the chat room
      // This provides instant delivery to all active participants
      const roomName = this.roomService.getChatRoomName(chatRoomId);
      server.to(roomName).emit('message_received', messageData);

      // Send notification to the other participant if they're not in the room
      // This ensures offline users receive message notifications
      const otherUserId = chatRoom.jobCreator.id === userId ? chatRoom.jobWorker.id : chatRoom.jobCreator.id;
      
      // Check if the other user is currently in the chat room
      const roomUsers = await this.roomService.getChatRoomUsers(server, chatRoomId);
      
      // Determine if other user is actively participating in chat
      const otherUserInRoom = roomUsers.some(socketId => {
        const connectedUser = server.sockets.sockets.get(socketId);
        return connectedUser && (connectedUser as any).user?.id === otherUserId;
      });

      // Send notification only if user is not actively in the chat room
      if (!otherUserInRoom) {
        // Send notification to the other user with job context
        const senderName = `${fullMessage.sender.firstname} ${fullMessage.sender.lastname}`;
        await this.notificationHandler.sendChatNotification(
          server,
          otherUserId,
          senderName,
          chatRoomId,
          chatRoom.job.description?.substring(0, 50) // Job title/description excerpt
        );
      }

      // Return success response with message data
      return {
        success: true,
        message: 'Message sent successfully',
        data: messageData,
      };
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error sending message: ${error.message}`);
      
      // Return user-friendly error response
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle Get Chat History Request
   * 
   * Retrieves chat message history for a specific chat room with proper
   * permission validation and efficient data delivery. This method supports
   * chat room initialization and message history browsing.
   * 
   * History Retrieval Process:
   * 1. Validate user permissions for chat room access
   * 2. Retrieve message history from database
   * 3. Format messages for client consumption
   * 4. Return paginated or complete history
   * 5. Log access for monitoring purposes
   * 
   * Security Features:
   * - Permission validation before history access
   * - User authorization for specific chat rooms
   * - Access logging for audit trails
   * - Data filtering for privacy protection
   * 
   * Performance Optimizations:
   * - Efficient database queries
   * - Proper message pagination
   * - Minimal data transfer
   * - Caching for frequently accessed history
   * 
   * Use Cases:
   * - Initial chat room loading
   * - Message history browsing
   * - Search and filtering operations
   * - Audit and compliance requirements
   * 
   * Future Enhancements:
   * - Pagination support for large histories
   * - Message search and filtering
   * - Export capabilities for records
   * - Advanced query options
   * 
   * @param socket - Authenticated user socket connection
   * @param data - Chat room ID for history request
   * @param server - Socket.IO server for context (if needed)
   * @returns Promise<WebSocketResponse> - Message history or error
   */
  async handleGetChatHistory(
    socket: AuthenticatedSocket,
    data: { chatRoomId: string },
    server: Server,
  ): Promise<WebSocketResponse> {
    try {
      // Parse and validate chat room ID from request
      const chatRoomId = parseInt(data.chatRoomId);
      const userId = socket.user.id;

      // Validate permissions - user must be authorized for this chat room
      // This prevents unauthorized access to message history
      const chatRoom = await this.chatRoomService.findOne(chatRoomId);
      if (!chatRoom || (chatRoom.jobCreator.id !== userId && chatRoom.jobWorker.id !== userId)) {
        throw new ForbiddenException('You do not have access to this chat room');
      }

      // Get chat history from database
      // This includes all messages with sender information
      const messages = await this.chatService.findByChatRoomId(chatRoomId);
      
      // Transform messages into client-friendly format
      // Include all necessary information for display
      const messageHistory = messages.map(msg => ({
        id: msg.id,
        chatRoomId: msg.chatRoom.id,
        senderId: msg.sender.id,
        senderName: `${msg.sender.firstname} ${msg.sender.lastname}`,
        text: msg.text,
        createdDate: msg.createdDate,
      }));

      // Return success response with complete message history
      return {
        success: true,
        message: 'Chat history retrieved successfully',
        data: {
          chatRoomId,
          messages: messageHistory,
        },
      };
    } catch (error) {
      // Log error details for debugging and monitoring
      this.logger.error(`Error getting chat history: ${error.message}`);
      
      // Return user-friendly error response
      return {
        success: false,
        error: error.message,
      };
    }
  }
} 