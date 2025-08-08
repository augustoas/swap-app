import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/users.service';
import { AuthenticatedSocket, ConnectedUser } from '../interfaces/websocket.interface';

/**
 * WebSocket Service
 * 
 * This service provides centralized WebSocket connection management and authentication
 * for the application. It handles all aspects of WebSocket connection lifecycle,
 * from initial authentication to connection cleanup.
 * 
 * Key Features:
 * - JWT-based WebSocket authentication
 * - Multi-device connection support per user
 * - Connection state management and tracking
 * - User presence detection
 * - Integration with existing authentication system
 * 
 * Authentication Architecture:
 * - Uses same JWT tokens as REST API endpoints
 * - Validates tokens using JwtService (consistent with JwtStrategy)
 * - Verifies user existence through UsersService
 * - Supports email confirmation status checking
 * - Handles token expiration and invalid tokens
 * 
 * Connection Management:
 * - Tracks all active WebSocket connections
 * - Maps users to their socket connections
 * - Supports multiple simultaneous connections per user
 * - Provides connection statistics and monitoring
 * - Handles graceful connection cleanup
 * 
 * Integration Points:
 * - JwtService: Token validation and decoding
 * - UsersService: User existence verification
 * - WebSocket Gateway: Connection event handling
 * - Chat System: User presence for message delivery
 * - Notification System: Real-time notification delivery
 * 
 * Security Considerations:
 * - Token validation on every connection attempt
 * - User existence verification prevents stale token usage
 * - Proper error handling prevents information leakage
 * - Connection tracking prevents unauthorized access
 * - Email confirmation status monitoring
 */
@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  
  // Map of socket IDs to connected user information
  // This provides O(1) lookup for socket-specific operations
  private connectedUsers = new Map<string, ConnectedUser>();
  
  // Map of user IDs to their socket IDs (supports multiple connections per user)
  // This enables efficient user-based operations like sending messages to all user devices
  private userSockets = new Map<number, string[]>(); // userId -> socketIds

  constructor(
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * WebSocket Authentication Service
   * 
   * Authenticates WebSocket connections using JWT tokens, following the same
   * authentication pattern as REST API endpoints. This ensures consistency
   * across the application and maintains security standards.
   * 
   * Authentication Flow:
   * 1. Extract and verify JWT token using JwtService
   * 2. Decode token payload to get user information
   * 3. Validate user exists using UsersService
   * 4. Check email confirmation status (optional)
   * 5. Attach user information to socket object
   * 6. Return authenticated socket for further processing
   * 
   * Security Features:
   * - Same JWT validation as REST API (consistent security)
   * - User existence verification prevents stale tokens
   * - Email confirmation status checking
   * - Proper error handling with detailed logging
   * - UnauthorizedException for invalid tokens
   * 
   * Token Validation:
   * - Uses JwtService.verify() for signature validation
   * - Handles token expiration automatically
   * - Supports same token structure as REST API
   * - Validates token payload structure
   * 
   * Error Handling:
   * - Logs authentication failures for monitoring
   * - Throws UnauthorizedException for invalid tokens
   * - Provides specific error messages for debugging
   * - Prevents information leakage in production
   * 
   * @param socket - Socket.IO socket instance from client connection
   * @param token - JWT token from client authentication
   * @returns Promise<AuthenticatedSocket> - Socket with attached user information
   * @throws UnauthorizedException - If token is invalid or user not found
   */
  async authenticateSocket(socket: Socket, token: string): Promise<AuthenticatedSocket> {
    try {
      // Verify JWT token using same service as REST API
      // This ensures consistent token validation across all endpoints
      // The JwtService automatically handles:
      // - Signature verification
      // - Token expiration checking
      // - Payload decoding
      const decoded = this.jwtService.verify(token);
      
      // Extract user ID from token payload
      // Support both 'sub' (standard JWT claim) and 'id' (custom claim)
      // This maintains compatibility with different token structures
      const userId = decoded.sub || decoded.id;
      
      // Validate user ID exists in token payload
      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Verify user exists in database using UsersService
      // This is critical for security - prevents access with valid tokens
      // for users that have been deleted or disabled after token creation
      // Uses proper encapsulation through UsersService instead of direct repository access
      const user = await this.usersService.findOne(userId);

      // If user not found, deny WebSocket connection
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Optional: Check email confirmation status
      // This can be used to restrict WebSocket access to confirmed users
      // Currently logs warning but allows connection - can be made stricter
      if (!user.isEmailConfirmed) {
        this.logger.warn(`User ${user.email} connected but email not confirmed`);
        // Uncomment to require email confirmation for WebSocket access:
        // throw new UnauthorizedException('Email not confirmed');
      }

      // Create authenticated socket with user information
      // This adds user data to the socket object for use in event handlers
      const authenticatedSocket = socket as AuthenticatedSocket;
      authenticatedSocket.user = {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      };

      // Log successful authentication for monitoring
      this.logger.log(`Socket authenticated for user: ${user.email} (ID: ${user.id})`);
      
      return authenticatedSocket;
    } catch (error) {
      // Log authentication failures for security monitoring
      this.logger.error(`Socket authentication failed: ${error.message}`);
      
      // Re-throw UnauthorizedException to maintain proper error handling
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Convert other errors to UnauthorizedException for security
      // This prevents information leakage about internal errors
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Connection Registration Service
   * 
   * Registers a new authenticated WebSocket connection and updates
   * connection tracking data structures. This method is called after
   * successful authentication to maintain connection state.
   * 
   * Connection Tracking:
   * - Adds connection to global connection map
   * - Updates user-specific socket list
   * - Supports multiple connections per user
   * - Records connection timestamp
   * - Provides connection statistics
   * 
   * Multi-Device Support:
   * - Users can connect from multiple devices simultaneously
   * - Each device gets its own socket connection
   * - Messages can be delivered to all user devices
   * - Connection count tracking per user
   * 
   * Data Structures:
   * - connectedUsers: Maps socket ID to user info
   * - userSockets: Maps user ID to array of socket IDs
   * - Both provide O(1) lookup for efficient operations
   * 
   * @param socket - Authenticated socket with user information
   */
  addConnectedUser(socket: AuthenticatedSocket): void {
    // Create connection record with user and timestamp information
    const connectedUser: ConnectedUser = {
      socketId: socket.id,
      userId: socket.user.id,
      email: socket.user.email,
      firstname: socket.user.firstname,
      lastname: socket.user.lastname,
      connectedAt: new Date(),
    };

    // Add to global connection map for socket-based lookups
    // This enables efficient operations like finding user info by socket ID
    this.connectedUsers.set(socket.id, connectedUser);

    // Update user's socket list for user-based operations
    // Get existing sockets for this user (empty array if first connection)
    const userSockets = this.userSockets.get(socket.user.id) || [];
    
    // Add new socket ID to user's socket list
    userSockets.push(socket.id);
    
    // Update user socket mapping
    this.userSockets.set(socket.user.id, userSockets);

    // Log connection with device count for monitoring
    this.logger.log(`User connected: ${socket.user.email} (${socket.id}) - Total connections: ${userSockets.length}`);
  }

  /**
   * Connection Cleanup Service
   * 
   * Removes disconnected WebSocket connection from tracking data structures.
   * This method is called when a socket disconnects to maintain accurate
   * connection state and prevent memory leaks.
   * 
   * Cleanup Process:
   * 1. Find connection record by socket ID
   * 2. Remove from global connection map
   * 3. Update user's socket list
   * 4. Remove user from user sockets if no connections remain
   * 5. Log disconnection with remaining connection count
   * 
   * Memory Management:
   * - Prevents memory leaks from accumulating connection records
   * - Maintains accurate connection statistics
   * - Enables proper user presence detection
   * - Supports garbage collection of unused data
   * 
   * Multi-Device Handling:
   * - Correctly handles partial disconnections (user still online on other devices)
   * - Only marks user as fully offline when all connections are closed
   * - Maintains connection count accuracy
   * 
   * @param socketId - Socket ID of disconnected connection
   */
  removeConnectedUser(socketId: string): void {
    // Find connection record for this socket
    const connectedUser = this.connectedUsers.get(socketId);
    
    if (connectedUser) {
      // Remove from global connection map
      this.connectedUsers.delete(socketId);

      // Update user's socket list
      const userSockets = this.userSockets.get(connectedUser.userId) || [];
      const updatedSockets = userSockets.filter(id => id !== socketId);
      
      // If user has no remaining connections, remove from user sockets map
      if (updatedSockets.length === 0) {
        this.userSockets.delete(connectedUser.userId);
        this.logger.log(`User fully disconnected: ${connectedUser.email} (${socketId})`);
      } else {
        // Update user socket mapping with remaining connections
        this.userSockets.set(connectedUser.userId, updatedSockets);
        this.logger.log(`User socket disconnected: ${connectedUser.email} (${socketId}) - Remaining: ${updatedSockets.length}`);
      }
    }
  }

  /**
   * Connection Lookup Service
   * 
   * Retrieves user information for a specific socket connection.
   * This method provides O(1) lookup for socket-based operations.
   * 
   * @param socketId - Socket ID to lookup
   * @returns ConnectedUser | undefined - User information if found
   */
  getConnectedUser(socketId: string): ConnectedUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  /**
   * User Socket Lookup Service
   * 
   * Retrieves all socket IDs for a specific user.
   * This enables sending messages to all of a user's connected devices.
   * 
   * Use Cases:
   * - Send notifications to all user devices
   * - Broadcast messages to user across all connections
   * - Check if user is online on any device
   * - Implement multi-device synchronization
   * 
   * @param userId - User ID to lookup
   * @returns string[] - Array of socket IDs for the user
   */
  getUserSockets(userId: number): string[] {
    return this.userSockets.get(userId) || [];
  }

  /**
   * User Presence Detection Service
   * 
   * Checks if a user is currently connected via WebSocket.
   * This method is used for presence indication and message delivery decisions.
   * 
   * @param userId - User ID to check
   * @returns boolean - True if user has at least one active connection
   */
  isUserConnected(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Connection Statistics Service
   * 
   * Returns the total number of unique users currently connected.
   * This provides system-wide presence statistics.
   * 
   * @returns number - Number of unique users with active connections
   */
  getConnectedUsersCount(): number {
    return new Set(Array.from(this.connectedUsers.values()).map(user => user.userId)).size;
  }

  /**
   * Full Connection List Service
   * 
   * Returns all current connection records for administrative purposes.
   * This method should be used carefully in production due to potential
   * data volume and privacy considerations.
   * 
   * @returns ConnectedUser[] - Array of all connection records
   */
  getAllConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * User Information Service
   * 
   * Retrieves user information by ID using the UsersService.
   * This method provides a convenient way to get user details during
   * WebSocket operations while maintaining proper encapsulation.
   * 
   * Encapsulation Benefits:
   * - Uses UsersService instead of direct repository access
   * - Maintains consistent user data access patterns
   * - Supports future caching or data transformation
   * - Provides proper error handling and logging
   * 
   * @param userId - User ID to lookup
   * @returns Promise<User | null> - User object if found, null if not found or error
   */
  async getUserById(userId: number) {
    try {
      return await this.usersService.findOne(userId);
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}: ${error.message}`);
      return null;
    }
  }
} 