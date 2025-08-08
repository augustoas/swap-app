import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';

/**
 * Authentication Module
 * 
 * This module provides comprehensive authentication functionality for the application,
 * including JWT-based authentication, password management, and email verification.
 * 
 * Key Features:
 * - JWT token generation and validation
 * - User registration and login
 * - Password reset functionality
 * - Email confirmation system
 * - Google OAuth integration (via GoogleStrategy)
 * - Integration with mail service for email notifications
 * 
 * Architecture:
 * - Uses Passport.js for authentication strategies
 * - JWT tokens for stateless authentication
 * - TypeORM for database operations
 * - Mail service for sending authentication emails
 * 
 * Security Considerations:
 * - JWT tokens are signed with a secret key
 * - Passwords are hashed using bcrypt
 * - Email confirmation required for account activation
 * - Reset tokens have expiration times
 * - Rate limiting should be implemented at the controller level
 */
@Module({
  imports: [
    // Mail module for sending authentication emails (confirmation, reset password)
    MailModule,
    
    // Passport module configuration with JWT as default strategy
    // This enables the @UseGuards(AuthGuard()) decorator throughout the application
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT module with async configuration to access environment variables
    // Configured with:
    // - Dynamic secret from environment variables
    // - Token expiration time from environment variables
    // - Async factory pattern for configuration injection
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        // Token expiration time (e.g., '24h', '7d', 3600 for seconds)
        signOptions: {
          expiresIn: config.get<string | number>('JWT_EXPIRES')
        },
        // JWT secret key for signing and verifying tokens
        // This should be a strong, random string stored in environment variables
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    
    // TypeORM integration for User entity
    // Provides User repository for database operations
    TypeOrmModule.forFeature([User])
  ],
  
  // Controllers that handle HTTP requests for authentication
  controllers: [AuthController],
  
  // Services and strategies that provide authentication logic
  providers: [
    AuthService,     // Main authentication service with business logic
    JwtStrategy,     // Passport strategy for JWT validation
  ],
  
  // Exports that make authentication functionality available to other modules
  // These exports enable:
  // - JwtStrategy: JWT token validation across the application
  // - PassportModule: @UseGuards(AuthGuard()) decorator usage
  // - AuthService: Authentication methods for other services
  // - JwtModule: JWT token creation and verification
  exports: [JwtStrategy, PassportModule, AuthService, JwtModule]
})
export class AuthModule {}
