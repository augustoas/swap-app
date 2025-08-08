import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { profilePicturesConfig } from '@/config/profile-pictures.config';

/**
 * Users Module
 * 
 * This module provides user management functionality for the application,
 * including user CRUD operations, profile management, and worker-specific features.
 * 
 * Key Features:
 * - Complete user lifecycle management (Create, Read, Update, Delete)
 * - Profile picture upload and management
 * - Worker-specific profile updates
 * - Integration with authentication system
 * - Database persistence through TypeORM
 * - File upload handling with Multer
 * 
 * Module Dependencies:
 * - AuthModule: Provides JWT authentication and authorization
 * - TypeOrmModule: Database access and User entity management
 * - MulterModule: File upload handling for profile pictures
 * 
 * Integration Points:
 * - WebSocket Module: User authentication and presence detection
 * - Chat System: User identification and permissions
 * - Job System: Worker profile management
 * - Authentication System: User validation and token generation
 * 
 * Security Features:
 * - JWT-based authentication for all endpoints
 * - File upload validation and security
 * - Input sanitization through DTOs
 * - Secure file storage configuration
 * 
 * Data Management:
 * - User entity persistence through TypeORM
 * - Profile picture file management
 * - Worker-specific data handling
 * - Database relationship management
 * 
 * Export Strategy:
 * - Exports UsersService for use by other modules
 * - Enables proper encapsulation of user data access
 * - Prevents direct repository access from other modules
 * - Maintains clean module boundaries
 */
@Module({
  controllers: [
    // Users Controller
    // Handles all HTTP endpoints for user management
    // Provides RESTful API for user operations
    // Includes comprehensive Swagger documentation
    // Implements JWT authentication guards
    UsersController
  ],
  
  providers: [
    // Users Service
    // Contains business logic for user operations
    // Handles data validation and transformation
    // Manages database interactions through repositories
    // Provides encapsulated access to user data
    UsersService
  ],
  
  imports: [
    // Authentication Module
    // Provides JWT authentication and authorization services
    // Exports AuthGuard for protecting endpoints
    // Enables token validation and user authentication
    // Required for all user management endpoints
    AuthModule,
    
    // TypeORM Feature Module for User Entity
    // Provides User repository for database operations
    // Enables database access through dependency injection
    // Handles entity relationships and database queries
    // Supports transactions and advanced query features
    TypeOrmModule.forFeature([User]),
    
    // Multer Module for File Upload
    // Configured with profile pictures configuration
    // Handles file upload, validation, and storage
    // Provides file processing and security features
    // Supports image upload for user profiles
    MulterModule.register(profilePicturesConfig),
  ],
  
  // Module Exports
  // Makes UsersService available to other modules
  // Enables proper encapsulation and module boundaries
  // Prevents direct repository access from external modules
  // Maintains clean architecture and separation of concerns
  exports: [
    // Users Service Export
    // Allows other modules to access user management functionality
    // Used by:
    // - WebSocket Module: User authentication and validation
    // - Chat System: User identification and permissions
    // - Job System: Worker profile management
    // - Authentication System: User validation during login
    // - Notification System: User lookup for notifications
    // 
    // Benefits of Service Export:
    // - Encapsulates database access logic
    // - Provides consistent user data access patterns
    // - Enables future caching or data transformation
    // - Maintains proper error handling and validation
    // - Supports business logic centralization
    UsersService
  ],
})
export class UsersModule {}
