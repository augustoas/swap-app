import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

/**
 * JWT Authentication Strategy
 *
 * This class implements the Passport JWT strategy for token-based authentication.
 * It extends PassportStrategy to integrate with NestJS's authentication system.
 * 
 * Key Responsibilities:
 * - Extract JWT tokens from incoming HTTP requests
 * - Validate token signatures using the configured secret
 * - Decode token payload and extract user information
 * - Verify user exists in the database
 * - Attach user object to the request context
 * 
 * Security Features:
 * - Validates JWT signature to prevent token tampering
 * - Checks user existence to handle deleted/disabled accounts
 * - Throws UnauthorizedException for invalid tokens or missing users
 * - Uses Bearer token format from Authorization header
 * 
 * Integration:
 * - Works with @UseGuards(AuthGuard()) decorator
 * - Populates req.user with the validated user object
 * - Used by WebSocket authentication for consistent user validation
 * - Supports both HTTP REST endpoints and WebSocket connections
 * 
 * Token Format Expected:
 * Authorization: Bearer <jwt_token>
 * 
 * Token Payload Structure:
 * {
 *   id: number,           // User ID
 *   firstname: string,    // User's first name
 *   lastname: string,     // User's last name
 *   email: string,        // User's email address
 *   iat: number,          // Issued at timestamp
 *   exp: number           // Expiration timestamp
 * }
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor - Initializes the JWT strategy with configuration and dependencies
   * 
   * Configuration:
   * - jwtFromRequest: Extracts JWT from Authorization header as Bearer token
   * - secretOrKey: Secret key for token validation (from environment variables)
   * 
   * Dependencies:
   * - userRepository: TypeORM repository for User entity database operations
   * 
   * @param userRepository - Injected User repository for database operations
   * @throws Error if JWT_SECRET environment variable is not defined
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
    ) {
    // Retrieve JWT secret from environment variables
    // This is critical for security - the secret must be:
    // 1. Strong and random (at least 32 characters)
    // 2. Kept secret and not exposed in code
    // 3. Consistent across all application instances
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    
    // Configure the JWT strategy with Passport
    super({
      // Extract JWT token from Authorization header with Bearer prefix
      // Format: "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Secret key for verifying token signatures
      // This ensures tokens haven't been tampered with
      secretOrKey: secret,
      
      // Additional options (using defaults):
      // - ignoreExpiration: false (tokens expire as configured)
      // - issuer: undefined (no issuer validation)
      // - audience: undefined (no audience validation)
      // - algorithms: ['HS256'] (default signing algorithm)
    });
  }

  /**
   * Token Validation Method
   * 
   * This method is automatically called by Passport when a valid JWT token is found.
   * It receives the decoded token payload and must return the user object or throw
   * an UnauthorizedException.
   * 
   * Validation Steps:
   * 1. Extract user ID from token payload
   * 2. Query database to verify user exists
   * 3. Return user object if found
   * 4. Throw UnauthorizedException if user not found
   * 
   * Security Considerations:
   * - Always validates against current database state
   * - Handles deleted/disabled user accounts
   * - Prevents access with valid tokens for non-existent users
   * - Does not check email confirmation status (handled elsewhere)
   * 
   * @param payload - The decoded JWT payload containing user information
   * @returns Promise<User> - The validated user entity from database
   * @throws UnauthorizedException - If user is not found or validation fails
   */
  async validate(payload: any): Promise<User> {
    // Extract user ID from token payload
    // The payload structure is defined when the token is created in AuthService
    const { id } = payload;
    
    // Query database to verify user still exists
    // This is crucial for security - prevents access with valid tokens
    // for users that have been deleted or disabled after token creation
    const user = await this.userRepository.findOne({where: {id: id}});
    
    // If user not found, deny access
    // This could happen if:
    // - User account was deleted after token creation
    // - User account was disabled/suspended
    // - Token contains invalid user ID
    // - Database connection issues (handled by TypeORM)
    if (!user) {
      throw new UnauthorizedException('You can not access this resource at this moment.');
    }
    
    // Return the user object - this will be attached to the request as req.user
    // The returned user object will be available in:
    // - Controller methods via @CurrentUser() decorator
    // - Request object as req.user
    // - WebSocket connections after authentication
    return user;
  }
}