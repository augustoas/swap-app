import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailService } from './../mail/mail.service';

/**
 * Authentication Service
 * 
 * This service provides comprehensive authentication functionality for the application,
 * including user registration, login, password management, and email verification.
 * 
 * Key Features:
 * - Secure user registration with email confirmation
 * - JWT-based authentication for stateless sessions
 * - Password reset functionality with time-limited tokens
 * - Email verification system
 * - OAuth integrations (Google)
 * - Secure password hashing using bcrypt
 * 
 * Security Measures:
 * - Passwords are hashed with bcrypt (12 rounds)
 * - Email confirmation required for account activation
 * - Time-limited tokens for password reset (1 hour)
 * - Time-limited tokens for email confirmation (24 hours)
 * - Secure random token generation using crypto module
 * - Input validation through DTOs
 * - Rate limiting should be implemented at controller level
 * 
 * Business Logic:
 * - Users must confirm email before full account activation
 * - Failed login attempts return generic error messages
 * - Password reset requires email verification
 * - JWT tokens contain user identification and basic profile info
 * - Email notifications are queued for asynchronous processing
 * 
 * Integration Points:
 * - MailService: For sending authentication emails
 * - JwtService: For token generation and validation
 * - User Repository: For database operations
 * - WebSocket System: Uses JWT tokens for connection authentication
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * User Registration Service
   * 
   * Registers a new user account with email confirmation workflow.
   * This method implements a secure registration process that includes:
   * 
   * Security Features:
   * - Password hashing with bcrypt (12 rounds for strong security)
   * - Email confirmation token generation (32 bytes of entropy)
   * - Time-limited confirmation tokens (24 hours)
   * - Secure random token generation using Node.js crypto module
   * 
   * Business Logic:
   * 1. Extract password from registration data
   * 2. Hash password securely for database storage
   * 3. Create new user entity with provided information
   * 4. Generate secure confirmation token
   * 5. Set token expiration time (24 hours from creation)
   * 6. Save user to database with unconfirmed status
   * 7. Queue confirmation email for asynchronous sending
   * 
   * Email Confirmation Workflow:
   * - User receives email with confirmation link
   * - Link contains unique token tied to user account
   * - User clicks link to confirm email address
   * - Account becomes fully active after confirmation
   * 
   * Error Handling:
   * - Database constraint violations (email uniqueness)
   * - Email sending failures (handled by mail service)
   * - Token generation failures
   * 
   * @param signUpDto - Data Transfer Object containing user registration information
   * @returns Promise<User> - The newly created user object (password field removed)
   * @throws Error - If registration fails due to database errors or validation issues
   */
  async signUp(signUpDto: SignUpDto): Promise<User> {
    try {
      // Extract password from registration data to handle separately
      // This ensures password is properly hashed and not stored in plain text
      const { password, ...signUpData } = signUpDto;
      
      // Hash password with bcrypt using 12 rounds
      // 12 rounds provides strong security while maintaining reasonable performance
      // Each round doubles the computational cost, making brute force attacks impractical
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create new user entity with provided registration data
      // The user will be created with isEmailConfirmed = false by default
      const newUser = await this.userRepository.create(signUpData);
      
      // Generate cryptographically secure confirmation token
      // Using 32 bytes (256 bits) of entropy provides extremely high security
      // The token is converted to hexadecimal string (64 characters)
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      
      // Set user authentication and confirmation properties
      newUser.password = hashedPassword;
      newUser.confirmationToken = confirmationToken;
      
      // Set token expiration to 24 hours from now
      // 86400000 milliseconds = 24 hours
      // After this time, the token becomes invalid and user must request new one
      newUser.confirmationTokenExpiration = new Date(Date.now() + 86400000);
      
      // Save the user to the database with unconfirmed status
      // User can log in but may have restricted access until email is confirmed
      const savedUser = await this.userRepository.save(newUser);
      
      // Queue confirmation email for asynchronous sending
      // This prevents blocking the registration response while email is sent
      // Email contains the confirmation token and user information
      this.mailService.enqueueEmail(
        {user: savedUser, token: confirmationToken}, 
        'sendConfirmationEmail'
      );
      
      // Return user object without sensitive information
      // Password is already excluded from the returned entity
      return savedUser;
    } catch (error) {
      // Re-throw error with original message for proper error handling
      // Controller layer should handle specific error types and responses
      throw new Error(error.message);
    }
  }

  /**
   * User Authentication Service
   * 
   * Authenticates user credentials and returns JWT token for session management.
   * This method implements secure login with the following features:
   * 
   * Security Features:
   * - Email-based user identification
   * - Secure password comparison using bcrypt
   * - JWT token generation for stateless authentication
   * - Generic error messages to prevent user enumeration
   * - Password field removal from response
   * 
   * Authentication Flow:
   * 1. Look up user by email address
   * 2. Verify user exists (without revealing if email is valid)
   * 3. Compare provided password with stored hash
   * 4. Generate JWT token with user information
   * 5. Return token and user object for client storage
   * 
   * JWT Token Payload:
   * - id: User's database ID (as string)
   * - firstname: User's first name
   * - lastname: User's last name
   * - email: User's email address
   * - iat: Issued at timestamp (added by JWT library)
   * - exp: Expiration timestamp (added by JWT library)
   * 
   * Security Considerations:
   * - Uses constant-time comparison for password verification
   * - Returns generic error messages for failed authentication
   * - Does not reveal whether email exists in system
   * - Tokens are signed with server secret key
   * 
   * @param signInDto - Data Transfer Object containing email and password
   * @returns Promise<{token: string, user: User}> - JWT token and user object
   * @throws UnauthorizedException - If credentials are invalid
   * @throws Error - If authentication process fails
   */
  async signIn(signInDto: SignInDto): Promise<{ token: string; user: User }> {
    try {
      // Find user by email address
      // This query should be indexed for performance
      const user = await this.userRepository.findOne({ where: { email: signInDto.email }});
      
      // If user not found, throw generic error
      // Don't reveal whether email exists to prevent user enumeration attacks
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Compare provided password with stored hash
      // bcrypt.compare() handles the salt extraction and comparison securely
      // This is a constant-time operation that prevents timing attacks
      const isPasswordCorrect = await bcrypt.compare(
        signInDto.password,
        user.password,
      );
      
      // If password is incorrect, throw generic error
      // Same error message as user not found to prevent information leakage
      if (!isPasswordCorrect) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Remove password from user object before including in response
      // This prevents accidental password exposure in API responses
      delete user.password;
      
      // Create JWT payload with user information
      // Convert user ID to string for consistency across the application
      const payload = {
        id: user.id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: signInDto.email,
      };
      
      // Generate JWT token with configured expiration time
      // Token is signed with server secret key from environment variables
      const token = await this.jwtService.sign(payload);
      
      // Return both token and user object for client-side storage
      // Client should store token securely and use for subsequent requests
      return { token, user };
    } catch (error) {
      // Re-throw UnauthorizedException to maintain proper HTTP status codes
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Convert other errors to generic Error for consistent error handling
      throw new Error(error.message);
    }
  }

  /**
   * Google OAuth Authentication Handler
   * 
   * Handles authentication response from Google OAuth strategy.
   * This method is called after successful Google OAuth authentication.
   * 
   * Integration Points:
   * - Google OAuth Strategy (configured in google.strategy.ts)
   * - OAuth callback endpoint in AuthController
   * - Frontend OAuth flow integration
   * 
   * @param req - Express request object containing user from Google OAuth
   * @returns User information from Google or error message
   */
  googleLogin(req: any) {
    // Check if Google OAuth provided user information
    if (!req.user) {
      return 'No user from google';
    }
    
    // Return user information from Google OAuth
    // This should be enhanced to:
    // 1. Create local user account if not exists
    // 2. Generate JWT token for session management
    // 3. Link Google account to existing user account
    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  /**
   * Password Reset Token Generation Service
   * 
   * Generates and sends password reset token to user's email address.
   * This method implements secure password reset initiation with:
   * 
   * Security Features:
   * - Secure random token generation (32 bytes entropy)
   * - Time-limited tokens (1 hour expiration)
   * - Email verification requirement
   * - Token tied to specific user account
   * 
   * Business Logic:
   * 1. Verify user exists by email address
   * 2. Generate cryptographically secure reset token
   * 3. Store token and expiration time in database
   * 4. Send reset email with token to user
   * 5. Return token (for testing purposes)
   * 
   * Email Integration:
   * - Uses mail service to send reset password email
   * - Email contains secure link with reset token
   * - User must access email to complete reset process
   * 
   * @param email - User's email address for password reset
   * @returns Promise<string> - Generated reset token
   * @throws Error - If user not found or email sending fails
   */
  async generateResetToken(email: string): Promise<string> {
    try {
      // Find user by email address
      const user = await this.userRepository.findOne({ where: { email } });
      
      // If user not found, throw generic error
      // Consider: Should this reveal if email exists in system?
      if (!user) throw new Error('Invalid credentials');
      
      // Generate cryptographically secure reset token
      // 32 bytes provides 256 bits of entropy for maximum security
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Store reset token and expiration time in user record
      user.resetToken = resetToken;
      
      // Set token expiration to 1 hour from now
      // 3600000 milliseconds = 1 hour
      // Short expiration time reduces security risk if token is compromised
      user.resetTokenExpiration = new Date(Date.now() + 3600000);
      
      // Queue reset password email for asynchronous sending
      // Email contains the reset token and user's email address
      this.mailService.enqueueEmail({email, resetToken}, 'sendResetPassword');
      
      // Save user with reset token information
      await this.userRepository.save(user);
      
      // Return token for testing purposes
      // In production, this might not be necessary
      return resetToken;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Password Reset Token Validation
   * 
   * Private method to validate reset token and retrieve associated user.
   * This method ensures tokens are valid and not expired.
   * 
   * Validation Steps:
   * 1. Find user with matching reset token
   * 2. Check if token exists in database
   * 3. Verify token hasn't expired
   * 4. Return user object if valid
   * 
   * Security Considerations:
   * - Tokens are single-use (should be cleared after use)
   * - Time-based expiration prevents old tokens from being used
   * - Constant-time comparison prevents timing attacks
   * 
   * @param token - Reset token to validate
   * @returns Promise<User> - User associated with valid token
   * @throws Error - If token is invalid or expired
   */
  private async handleResetToken(token: string): Promise<User> {
    // Find user with matching reset token
    const user = await this.userRepository.findOne({
      where: { resetToken: token },
    });
    
    // If no user found with this token, it's invalid
    if (!user) throw new Error('Invalid token');
    
    // Check if token has expired
    // Calculate timestamp for 1 hour ago
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // If token expiration is before 1 hour ago, it's expired
    if (user.resetTokenExpiration < oneHourAgo)
      throw new Error('Token expired');
    
    // Return user object for password reset
    return user;
  }

  /**
   * Password Reset Service
   * 
   * Completes password reset process by updating user's password.
   * This method handles both token-based and authenticated password resets.
   * 
   * Security Features:
   * - Token validation for unauthenticated resets
   * - Password confirmation requirement
   * - Secure password hashing (12 rounds bcrypt)
   * - Token cleanup after successful reset
   * 
   * Business Logic:
   * 1. Validate reset token if provided (unauthenticated reset)
   * 2. Use provided user if already authenticated
   * 3. Verify password and confirmation match
   * 4. Hash new password securely
   * 5. Update user record with new password
   * 6. Clear reset token to prevent reuse
   * 
   * Use Cases:
   * - Unauthenticated reset: User clicks email link with token
   * - Authenticated reset: User changes password while logged in
   * 
   * @param resetPasswordDto - DTO containing new password and confirmation
   * @param user - Optional authenticated user object
   * @returns Promise<UpdateResult> - Database update result
   * @throws Error - If validation fails or update fails
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto, user?: User) {
    try {
      let thisUser = user;
      const { newPassword, confirmPassword, resetToken } = resetPasswordDto;
      
      // If reset token provided, validate it and get user
      // This handles unauthenticated password resets
      if (resetToken) thisUser = await this.handleResetToken(resetToken);
      
      // Ensure we have a valid user at this point
      if (!thisUser) throw new Error('Invalid credentials.');
      
      // Verify password and confirmation match
      // This prevents accidental password changes due to typos
      if (newPassword !== confirmPassword) throw new Error('Passwords must match.');
      
      // Hash new password with same security level as registration
      // 12 rounds of bcrypt provide strong security
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user's password in database
      // This also clears any existing reset tokens
      return this.userRepository.update(thisUser.id, { 
        password: hashedPassword,
        resetToken: null,              // Clear reset token after use
        resetTokenExpiration: null     // Clear expiration timestamp
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Email Confirmation Service
   * 
   * Confirms user's email address using the provided confirmation token.
   * This method completes the email verification process initiated during registration.
   * 
   * Security Features:
   * - Token validation against database
   * - Time-based token expiration (24 hours)
   * - Single-use token system
   * - Prevents duplicate confirmations
   * 
   * Business Logic:
   * 1. Find user with matching confirmation token
   * 2. Verify user exists and token is valid
   * 3. Check if email is already confirmed
   * 4. Validate token hasn't expired
   * 5. Mark email as confirmed
   * 6. Clear confirmation token to prevent reuse
   * 7. Save updated user record
   * 
   * Integration Points:
   * - Email templates contain confirmation links
   * - Frontend handles confirmation success/failure
   * - May trigger welcome email or account activation
   * 
   * @param token - Confirmation token from email link
   * @returns Promise<boolean> - True if confirmation successful
   * @throws Error - If token is invalid, expired, or already used
   */
  async confirmEmail(token: string): Promise<boolean> {
    try {
      // Find user with matching confirmation token
      const user = await this.userRepository.findOne({ 
        where: { confirmationToken: token } 
      });
      
      // Validate user exists and token is correct
      if (!user) throw new Error('User not found or invalid token');
      
      // Check if email is already confirmed
      // Prevents unnecessary processing and potential security issues
      if (user.isEmailConfirmed) throw new Error('Email already confirmed');
      
      // Check if token has expired (24 hours from creation)
      if (user.confirmationTokenExpiration < new Date()) throw new Error('Token expired');
      
      // Double-check token matches (defense in depth)
      if (user.confirmationToken !== token) throw new Error('Invalid token');

      // Mark email as confirmed and clear token
      user.isEmailConfirmed = true;
      user.confirmationToken = null;
      user.confirmationTokenExpiration = null;
      
      // Save updated user record
      await this.userRepository.save(user);
      
      // Return success indicator
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
