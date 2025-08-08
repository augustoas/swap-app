import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './services/websocket.service';
import { RoomService } from './services/room.service';
import { NotificationWebSocketService } from './services/notification-websocket.service';
import { ChatHandler } from './handlers/chat.handler';
import { NotificationHandler } from './handlers/notification.handler';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';
import { ChatRoomModule } from '../chat-room/chat-room.module';
import { NotificationModule } from '../notification/notification.module';

/**
 * WebSocket Module
 * 
 * This module provides centralized WebSocket functionality for the application,
 * including real-time chat, notifications, and connection management.
 * 
 * Architecture Overview:
 * - Single WebSocket Gateway for all real-time communications
 * - Centralized authentication and connection management
 * - Modular handler system for different event types
 * - Service-based architecture for business logic separation
 * - Integration with existing authentication and data modules
 * 
 * Key Components:
 * - WebSocketGateway: Main Socket.IO gateway handling all connections
 * - WebSocketService: Connection management and authentication
 * - RoomService: Chat room management and user permissions
 * - NotificationWebSocketService: Real-time notification delivery
 * - ChatHandler: Chat-specific event handling
 * - NotificationHandler: Notification-specific event handling
 * 
 * Real-Time Features:
 * - Chat messaging with room-based isolation
 * - Personal notifications with user-specific delivery
 * - User presence detection and status
 * - Multi-device support per user
 * - Message delivery confirmation
 * 
 * Security Features:
 * - JWT-based authentication for WebSocket connections
 * - Room-based permission validation
 * - User existence verification
 * - Connection tracking and monitoring
 * - Secure event handling with proper authorization
 * 
 * Integration Points:
 * - AuthModule: JWT token validation and user authentication
 * - UsersModule: User data access and validation
 * - ChatModule: Chat message persistence and retrieval
 * - ChatRoomModule: Chat room management and permissions
 * - NotificationModule: Notification persistence and management
 * 
 * Performance Considerations:
 * - Single gateway reduces connection overhead
 * - Efficient room-based message routing
 * - Connection pooling and reuse
 * - Asynchronous event processing
 * - Optimized data structures for user/socket mapping
 * 
 * Scalability Notes:
 * - Stateful connections require sticky sessions in load-balanced environments
 * - Consider Redis adapter for multi-instance deployments
 * - Connection limits and rate limiting for production
 * - Memory usage monitoring for large user bases
 */
@Module({
  imports: [
    // Authentication Module
    // Provides JWT token validation and authentication services
    // Used by WebSocketService for connection authentication
    // Exports: JwtService, JwtStrategy, AuthService
    AuthModule, 
    
    // Users Module
    // Provides user data access and validation services
    // Used by WebSocketService for user existence verification
    // Follows proper encapsulation instead of direct repository access
    // Exports: UsersService
    UsersModule,
    
    // Chat Module
    // Provides chat message persistence and retrieval services
    // Used by ChatHandler for message storage and history
    // Handles message pagination and real-time delivery
    // Exports: ChatService
    ChatModule, 
    
    // Chat Room Module
    // Provides chat room management and permission services
    // Used by ChatHandler and RoomService for room operations
    // Handles room creation, user permissions, and access control
    // Exports: ChatRoomService
    ChatRoomModule, 
    
    // Notification Module
    // Provides notification persistence and management services
    // Used by NotificationHandler for notification storage
    // Handles notification delivery, read status, and history
    // Exports: NotificationService
    NotificationModule,
  ],
  
  providers: [
    // Main WebSocket Gateway
    // Single point of entry for all WebSocket connections
    // Handles connection lifecycle, authentication, and event routing
    // Integrates with Socket.IO for real-time communication
    WebSocketGateway,
    
    // Core WebSocket Service
    // Manages connection authentication and user tracking
    // Provides JWT-based authentication for WebSocket connections
    // Maintains connection state and user presence information
    // Handles multi-device connection support
    WebSocketService,
    
    // Room Management Service
    // Manages chat room operations and user permissions
    // Handles room joining/leaving with proper authorization
    // Provides room-based message routing and access control
    // Integrates with ChatRoomService for database operations
    RoomService,
    
    // Notification WebSocket Service
    // Specialized service for real-time notification delivery
    // Handles notification routing to connected users
    // Provides methods for other modules to send notifications
    // Integrates with NotificationService for persistence
    NotificationWebSocketService,
    
    // Chat Event Handler
    // Handles all chat-related WebSocket events
    // Manages message sending, room operations, and chat history
    // Provides real-time chat functionality with proper permissions
    // Integrates with ChatService and ChatRoomService
    ChatHandler,
    
    // Notification Event Handler
    // Handles all notification-related WebSocket events
    // Manages notification delivery and user notification rooms
    // Provides personal notification functionality
    // Integrates with NotificationService for persistence
    NotificationHandler,
  ],
  
  // Public Exports
  // These services are exported for use by other modules throughout the application
  exports: [
    // WebSocketGateway Export
    // Allows other modules to access the main WebSocket gateway
    // Used for direct Socket.IO operations if needed
    // Provides access to server instance and connection management
    WebSocketGateway, 
    
    // WebSocketService Export
    // Allows other modules to access connection management functionality
    // Used for user presence detection and connection queries
    // Provides methods for checking user online status
    WebSocketService, 
    
    // NotificationWebSocketService Export
    // Allows other modules to send real-time notifications
    // Used by business logic modules (Jobs, Offers, Reviews, etc.)
    // Provides unified interface for notification delivery
    // Enables modules to send notifications without direct WebSocket knowledge
    NotificationWebSocketService
  ],
})
export class WebSocketModule {} 