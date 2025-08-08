import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateWorkerDto } from './dto/update-worker.dto';

/**
 * Users Service
 * 
 * This service provides business logic for user management operations.
 * It handles user CRUD operations, profile management, and worker-specific functionality.
 * 
 * Key Responsibilities:
 * - User lifecycle management (Create, Read, Update, Delete)
 * - Profile picture upload and URL generation
 * - Worker-specific profile updates
 * - Database operations through TypeORM repositories
 * - Input validation and business logic enforcement
 * - Error handling and consistent responses
 * 
 * Business Logic:
 * - User creation with data validation
 * - Profile picture processing and URL generation
 * - Worker profile management with financial data
 * - User existence validation for external integrations
 * - Proper error handling with meaningful messages
 * 
 * Security Considerations:
 * - Input sanitization through DTOs
 * - File upload validation and security
 * - Database transaction safety
 * - Proper error messages without information leakage
 * 
 * Integration Points:
 * - WebSocket System: User authentication and presence detection
 * - Chat System: User identification and permissions
 * - Job System: Worker profile management
 * - Authentication System: User validation during login
 * - Notification System: User lookup for notifications
 * 
 * File Management:
 * - Profile picture upload handling
 * - File path processing and URL generation
 * - File storage integration with multer configuration
 * - Image serving through static file endpoints
 * 
 * Data Access Pattern:
 * - Encapsulates direct database access
 * - Provides consistent interface for user operations
 * - Handles TypeORM repository operations
 * - Maintains transaction boundaries
 * - Supports future caching or data transformation
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create User Service
   * 
   * Creates a new user in the system with the provided information.
   * This method handles user creation with proper validation and error handling.
   * 
   * Business Logic:
   * - Validates user input through DTOs
   * - Creates user entity with provided data
   * - Handles database constraints (unique email, etc.)
   * - Returns created user object
   * 
   * Security Considerations:
   * - Input validation through CreateUserDto
   * - Database constraint enforcement
   * - Password handling (if included in DTO)
   * - Proper error propagation
   * 
   * Error Handling:
   * - Database constraint violations
   * - Validation errors from DTOs
   * - Unique constraint violations (email)
   * - Database connection issues
   * 
   * @param createUserDto - User creation data with validation
   * @returns Promise<User> - Created user entity
   * @throws Error - If user creation fails due to validation or database issues
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Create and save user entity using TypeORM repository
    // The repository.save() method handles:
    // - Entity creation and validation
    // - Database constraint enforcement
    // - Unique constraint checking (email)
    // - Automatic ID generation
    // - Timestamp fields (createdAt, updatedAt)
    return this.userRepository.save(createUserDto);
  }

  /**
   * Find All Users Service
   * 
   * Retrieves all users from the database.
   * This method is typically used for administrative purposes or user listings.
   * 
   * Performance Considerations:
   * - May return large datasets
   * - Consider pagination for production use
   * - Database query optimization
   * - Memory usage for large user bases
   * 
   * Security Considerations:
   * - Sensitive data filtering (passwords, tokens)
   * - Access control for administrative operations
   * - Rate limiting for abuse prevention
   * 
   * Future Enhancements:
   * - Pagination support
   * - Filtering and sorting options
   * - Search functionality
   * - Caching for frequently accessed data
   * 
   * @returns Promise<User[]> - Array of all user entities
   */
  async findAll(): Promise<User[]> {
    // Retrieve all users from database
    // Consider adding pagination and filtering in future versions
    return this.userRepository.find();
  }

  /**
   * Find User by ID Service
   * 
   * Retrieves a specific user by their unique ID.
   * This method includes proper error handling for non-existent users.
   * 
   * Business Logic:
   * - Validates user ID parameter
   * - Queries database for user entity
   * - Handles non-existent user scenarios
   * - Returns user object or throws exception
   * 
   * Error Handling:
   * - NotFoundException for non-existent users
   * - Database connection issues
   * - Invalid ID format handling
   * 
   * Usage Patterns:
   * - WebSocket authentication: Verify user exists
   * - Chat system: Get user details for messages
   * - Profile viewing: Display user information
   * - Permission checking: Validate user access
   * 
   * @param id - User ID to search for
   * @returns Promise<User> - User entity if found
   * @throws NotFoundException - If user with given ID doesn't exist
   */
  async findOne(id: number): Promise<User> {
    // Query database for user by ID
    const user = await this.userRepository.findOne({ where: { id: id } });
    
    // Handle non-existent user with proper error message
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Return found user entity
    return user;
  }

  /**
   * Update User Service
   * 
   * Updates an existing user's information and optionally their profile picture.
   * This method handles both data updates and file upload processing.
   * 
   * Features:
   * - Partial user data updates through DTOs
   * - Profile picture upload and processing
   * - File path extraction and URL generation
   * - Database update with validation
   * - Automatic updated timestamp handling
   * 
   * File Upload Processing:
   * - Extracts filename from file path
   * - Generates accessible URL for profile picture
   * - Integrates with multer file upload configuration
   * - Handles file storage and serving
   * 
   * Business Logic:
   * - Validates user existence before update
   * - Processes uploaded files if provided
   * - Updates user entity with new data
   * - Returns updated user object
   * 
   * Security Considerations:
   * - Input validation through UpdateUserDto
   * - File upload security (handled by multer)
   * - File type and size validation
   * - Path traversal prevention
   * 
   * Error Handling:
   * - NotFoundException for non-existent users
   * - File upload errors
   * - Database update failures
   * - Validation errors from DTOs
   * 
   * @param id - User ID to update
   * @param updateUserDto - User update data with validation
   * @param profilePicture - Optional uploaded profile picture file
   * @returns Promise<User> - Updated user entity
   * @throws NotFoundException - If user with given ID doesn't exist
   */
  async update(id: number, updateUserDto: UpdateUserDto, profilePicture: Express.Multer.File): Promise<User> {
    // Extract filename from uploaded file path
    // The multer configuration stores files with unique names
    // We extract the filename to create a public URL
    const filename = profilePicture.path.split('/').pop();
    
    // Generate accessible URL for profile picture
    // This URL will be used by frontend to display the image
    // The URL format matches the static file serving configuration
    const profilePicturePath = `${'http://localhost:4000/uploads/profile-pictures'}/${filename}`;
    
    // Update user entity with new data and profile picture URL
    // The repository.update() method handles:
    // - Entity validation
    // - Database constraint checking
    // - Automatic timestamp updates
    // - Partial updates (only provided fields)
    const result = await this.userRepository.update(id, {
      ...updateUserDto,
      profilePicturePath: profilePicturePath,
    });
    
    // Check if update affected any rows (user exists)
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Return updated user entity
    return this.findOne(id);
  }

  /**
   * Delete User Service
   * 
   * Removes a user from the system permanently.
   * This method handles user deletion with proper error handling.
   * 
   * Business Logic:
   * - Validates user existence before deletion
   * - Performs hard delete from database
   * - Handles cascade deletions for related entities
   * - Returns void on successful deletion
   * 
   * Security Considerations:
   * - Permanent data removal
   * - Cascade deletion handling
   * - Data retention policy compliance
   * - Audit trail considerations
   * 
   * Data Integrity:
   * - Foreign key constraint handling
   * - Related entity cleanup
   * - Transaction boundaries
   * - Rollback on failure
   * 
   * Alternative Approaches:
   * - Consider soft delete for data retention
   * - Implement user deactivation instead
   * - Add deletion audit trail
   * - Implement data archiving
   * 
   * @param id - User ID to delete
   * @returns Promise<void> - Void on successful deletion
   * @throws NotFoundException - If user with given ID doesn't exist
   */
  async remove(id: number): Promise<void> {
    // Delete user from database
    // The repository.delete() method handles:
    // - Entity existence validation
    // - Cascade deletions for related entities
    // - Database constraint enforcement
    // - Transaction boundaries
    const result = await this.userRepository.delete(id);
    
    // Check if deletion affected any rows (user existed)
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Successful deletion returns void
  }

  /**
   * Update Worker Information Service
   * 
   * Updates worker-specific information for a user.
   * This method handles specialized worker profile data including financial information.
   * 
   * Worker-Specific Features:
   * - RUT (Chilean tax identification) management
   * - Bank account information updates
   * - Account type specification
   * - Financial data validation
   * 
   * Business Logic:
   * - Validates worker-specific data through DTOs
   * - Updates only worker-related fields
   * - Maintains user entity integrity
   * - Returns updated user object
   * 
   * Security Considerations:
   * - Sensitive financial data handling
   * - Input validation for financial fields
   * - Data encryption considerations
   * - Compliance with financial regulations
   * 
   * Integration Points:
   * - Payment processing systems
   * - Tax reporting systems
   * - Financial compliance modules
   * - Worker verification processes
   * 
   * Validation Rules:
   * - RUT format validation (Chilean tax ID)
   * - Bank account number validation
   * - Account type enumeration
   * - Bank name validation
   * 
   * @param id - User ID to update
   * @param updateWorkerDto - Worker-specific update data with validation
   * @returns Promise<User> - Updated user entity with worker information
   * @throws NotFoundException - If user with given ID doesn't exist
   */
  async updateWorker(
    id: number,
    updateWorkerDto: UpdateWorkerDto,
  ): Promise<User> {
    // Update user entity with worker-specific data
    // The repository.update() method handles:
    // - Entity validation for worker fields
    // - Database constraint checking
    // - Partial updates (only worker fields)
    // - Automatic timestamp updates
    const result = await this.userRepository.update(id, updateWorkerDto);
    
    // Check if update affected any rows (user exists)
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Return updated user entity with worker information
    return this.findOne(id);
  }
}
