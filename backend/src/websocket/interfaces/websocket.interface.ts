import { Socket } from 'socket.io';

/**
 * WebSocket Interfaces
 * 
 * This file defines the core TypeScript interfaces used throughout the WebSocket
 * system to ensure type safety, consistency, and proper data structure validation.
 * These interfaces serve as contracts between different components of the WebSocket
 * architecture and provide clear documentation of data structures.
 * 
 * Key Benefits:
 * - Type safety throughout the WebSocket system
 * - Consistent data structures across all components
 * - Clear documentation of expected data formats
 * - IntelliSense support for developers
 * - Compile-time validation of data structures
 * - Easier refactoring and maintenance
 * 
 * Interface Categories:
 * - Socket Extensions: Enhanced socket types with authentication
 * - User Management: Connected user tracking and presence
 * - Room Management: Chat room information and metadata
 * - Response Formats: Standardized response structures
 * 
 * Usage Throughout System:
 * - WebSocket Gateway: Connection management and event handling
 * - Event Handlers: Chat and notification processing
 * - Services: WebSocket and room management operations
 * - DTOs: Data transfer object validation
 * - Client Integration: Frontend type definitions
 */

/**
 * Authenticated Socket Interface
 * 
 * Extends the standard Socket.IO socket with authenticated user information.
 * This interface is used throughout the WebSocket system to ensure that all
 * socket connections have verified user context and authentication.
 * 
 * Key Features:
 * - Extends base Socket.IO socket functionality
 * - Adds authenticated user information to socket context
 * - Provides type safety for user-related operations
 * - Ensures consistent user data structure across system
 * - Enables user-specific permission checks and operations
 * 
 * Authentication Flow:
 * 1. Base socket connection established
 * 2. JWT token validated through WebSocketService
 * 3. User information extracted and attached to socket
 * 4. Socket type upgraded to AuthenticatedSocket
 * 5. All subsequent operations use authenticated context
 * 
 * Security Benefits:
 * - Guaranteed user authentication for all operations
 * - Type-safe access to user information
 * - Prevents unauthenticated socket operations
 * - Consistent user data structure validation
 * 
 * User Data Structure:
 * - id: Unique user identifier for database operations
 * - email: User email for logging and identification
 * - firstname: User first name for display purposes
 * - lastname: User last name for display purposes
 * 
 * Usage Examples:
 * - Event handlers: Access user ID for permission checks
 * - Chat operations: Display user name in messages
 * - Notification delivery: Target specific authenticated users
 * - Logging: Track user activities and actions
 * 
 * @extends Socket - Base Socket.IO socket functionality
 */
export interface AuthenticatedSocket extends Socket {
  user: {
    id: number;        // Unique user identifier from database
    email: string;     // User email address for identification
    firstname: string; // User first name for display
    lastname: string;  // User last name for display
  };
}

/**
 * Connected User Interface
 * 
 * Represents a connected user in the WebSocket system with comprehensive
 * tracking information. This interface is used by the WebSocketService
 * to maintain user presence, connection status, and session information.
 * 
 * Key Features:
 * - Complete user identification and contact information
 * - Connection tracking with socket ID and timestamp
 * - Multi-device support through multiple socket tracking
 * - User presence and activity monitoring
 * - Session management and analytics support
 * 
 * Connection Management:
 * - socketId: Unique identifier for specific socket connection
 * - userId: Links connection to database user record
 * - connectedAt: Timestamp for connection duration tracking
 * - User details: For display and identification purposes
 * 
 * Multi-Device Support:
 * - Same user can have multiple ConnectedUser entries
 * - Each device/browser tab gets separate socket connection
 * - Notifications delivered to all user's connected devices
 * - Consistent user experience across devices
 * 
 * Analytics and Monitoring:
 * - Connection duration tracking
 * - User activity and engagement metrics
 * - Device and platform analytics
 * - Usage patterns and behavior analysis
 * 
 * Use Cases:
 * - User presence indicators in chat rooms
 * - Multi-device notification delivery
 * - Connection monitoring and diagnostics
 * - User engagement analytics
 * - Administrative user management
 * 
 * Data Structure:
 * - socketId: Socket.IO connection identifier
 * - userId: Database user primary key
 * - email: User email for identification
 * - firstname/lastname: Display names
 * - connectedAt: Connection timestamp
 */
export interface ConnectedUser {
  socketId: string;    // Unique Socket.IO connection identifier
  userId: number;      // Database user ID for linking
  email: string;       // User email address
  firstname: string;   // User first name for display
  lastname: string;    // User last name for display
  connectedAt: Date;   // Connection establishment timestamp
}

/**
 * Chat Room Information Interface
 * 
 * Represents cached chat room metadata used for quick permission validation
 * and room management operations. This interface enables efficient chat room
 * access control without frequent database queries.
 * 
 * Key Features:
 * - Cached room metadata for performance optimization
 * - Permission validation data for access control
 * - Job context linking for business logic
 * - Room status tracking for active/inactive states
 * - Participant identification for security
 * 
 * Performance Benefits:
 * - Reduces database queries for permission checks
 * - Enables fast room access validation
 * - Improves chat room operation speed
 * - Minimizes latency for user interactions
 * - Optimizes resource usage during active sessions
 * 
 * Security Features:
 * - Job participant validation (creator/worker only)
 * - Room access control enforcement
 * - Permission checking without database hits
 * - Secure room operation validation
 * 
 * Business Context:
 * - Links chat rooms to specific job contexts
 * - Identifies job creator and assigned worker
 * - Tracks room active status
 * - Enables job-specific chat functionality
 * 
 * Cache Management:
 * - Stored in RoomService memory cache
 * - Populated during room join operations
 * - Cleared when rooms become inactive
 * - Updated when job status changes
 * 
 * Data Structure:
 * - chatRoomId: Unique chat room identifier
 * - jobId: Associated job for context
 * - jobCreatorId: Job creator user ID
 * - jobWorkerId: Assigned worker user ID
 * - isActive: Room operational status
 * 
 * Usage Examples:
 * - Permission validation before message sending
 * - Room access control during join operations
 * - Job context display in chat interface
 * - Active room filtering and management
 */
export interface ChatRoomInfo {
  chatRoomId: number;  // Unique chat room identifier
  jobId: number;       // Associated job identifier
  jobCreatorId: number; // Job creator user ID
  jobWorkerId: number;  // Assigned worker user ID
  isActive: boolean;    // Room active/inactive status
}

/**
 * WebSocket Response Interface
 * 
 * Standardized response format for all WebSocket operations throughout the
 * system. This interface ensures consistent response structure, proper error
 * handling, and type-safe data exchange between client and server.
 * 
 * Key Features:
 * - Consistent response format across all WebSocket operations
 * - Type-safe data payload with generic support
 * - Standardized error handling and reporting
 * - Success/failure status indication
 * - Flexible data structure for various response types
 * 
 * Response Structure:
 * - success: Boolean indicating operation success/failure
 * - message: Optional human-readable message
 * - data: Optional typed data payload
 * - error: Optional error message for failures
 * 
 * Success Responses:
 * - success: true
 * - message: Descriptive success message
 * - data: Operation result data (typed)
 * - error: undefined
 * 
 * Error Responses:
 * - success: false
 * - message: undefined or error context
 * - data: undefined
 * - error: Error message for user display
 * 
 * Generic Type Support:
 * - T parameter allows type-safe data payloads
 * - Enables IntelliSense for response data
 * - Compile-time validation of response structures
 * - Flexible data types for different operations
 * 
 * Usage Throughout System:
 * - All WebSocket event handlers return this format
 * - Client-side WebSocket responses use this structure
 * - Error handling follows consistent pattern
 * - Data validation and serialization support
 * 
 * Examples:
 * - Chat room join: Returns room data and message history
 * - Message sending: Returns sent message data
 * - Notification delivery: Returns notification details
 * - Error cases: Returns error message and context
 * 
 * Client Integration:
 * - Frontend applications expect this format
 * - Type definitions shared with client code
 * - Consistent error handling across UI
 * - Predictable response structure for all operations
 * 
 * @template T - Type of data payload for type safety
 */
export interface WebSocketResponse<T = any> {
  success: boolean;    // Operation success status
  message?: string;    // Optional descriptive message
  data?: T;           // Optional typed data payload
  error?: string;     // Optional error message
} 