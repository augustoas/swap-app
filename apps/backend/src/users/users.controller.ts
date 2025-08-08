import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../database/entities/user.entity';
import { IApiResponse } from '../types/Api.interface';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

/**
 * Users Controller
 * 
 * This controller provides HTTP endpoints for user management operations.
 * It handles user CRUD operations, profile management, and worker-specific functionality.
 * 
 * Key Features:
 * - Complete user CRUD operations (Create, Read, Update, Delete)
 * - Profile picture upload and management
 * - Worker-specific profile updates
 * - Consistent API response formatting
 * - Comprehensive Swagger documentation
 * - JWT-based authentication protection
 * 
 * Security Features:
 * - All endpoints require JWT authentication
 * - Bearer token authentication via AuthGuard
 * - File upload validation and security
 * - Proper error handling and validation
 * - Input sanitization through DTOs
 * 
 * API Design:
 * - RESTful endpoint structure
 * - Consistent response format using IApiResponse
 * - Proper HTTP status codes
 * - Comprehensive error handling
 * - Swagger documentation for all endpoints
 * 
 * Integration Points:
 * - UsersService: Business logic and data operations
 * - AuthModule: JWT authentication and authorization
 * - File upload system: Profile picture management
 * - WebSocket system: User presence and authentication
 * - Chat system: User identification and permissions
 * 
 * Response Format:
 * All endpoints return responses in the format:
 * {
 *   message: string,    // Success/error message
 *   payload: T          // Response data (User object, array, etc.)
 * }
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard()) // All endpoints require JWT authentication
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create User Endpoint
   * 
   * Creates a new user account with the provided information.
   * This endpoint is typically used for administrative user creation
   * or internal system operations.
   * 
   * Security Considerations:
   * - Requires JWT authentication
   * - Input validation through CreateUserDto
   * - Password handling should be secure (hashed)
   * - Consider rate limiting for abuse prevention
   * 
   * Business Logic:
   * - Validates user input through DTOs
   * - Delegates to UsersService for business logic
   * - Returns created user with success message
   * - Handles duplicate email scenarios
   * 
   * @param createUserDto - User creation data
   * @returns Promise<IApiResponse<User>> - Created user with success message
   */
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'The user has been successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Usuario creado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            status: { type: 'boolean', example: true },
            phonenumber: { type: 'string', example: '+56912345678' },
            rut: { type: 'string', example: '12345678-9' },
            accountNumber: { type: 'string', example: '1234567890' },
            bank: { type: 'string', example: 'Banco Estado' },
            accountType: { type: 'string', example: 'Cuenta Corriente' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<IApiResponse<User>> {
    // Delegate user creation to service layer
    // Service handles validation, business logic, and database operations
    const data = await this.usersService.create(createUserDto);
    
    // Return consistent API response format
    return { message: 'Usuario creado exitosamente', payload: data };
  }

  /**
   * Get All Users Endpoint
   * 
   * Retrieves a list of all users in the system.
   * This endpoint is typically used for administrative purposes
   * or user management interfaces.
   * 
   * Security Considerations:
   * - Requires JWT authentication
   * - Consider pagination for large datasets
   * - May need additional authorization for admin-only access
   * - Sensitive data filtering (passwords, tokens)
   * 
   * Performance Considerations:
   * - May need pagination for large user bases
   * - Consider caching for frequently accessed data
   * - Database query optimization
   * - Response size limitations
   * 
   * @returns Promise<IApiResponse<User[]>> - List of all users
   */
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              firstname: { type: 'string', example: 'John' },
              lastname: { type: 'string', example: 'Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              status: { type: 'boolean', example: true },
              phonenumber: { type: 'string', example: '+56912345678' },
              rut: { type: 'string', example: '12345678-9' },
              accountNumber: { type: 'string', example: '1234567890' },
              bank: { type: 'string', example: 'Banco Estado' },
              accountType: { type: 'string', example: 'Cuenta Corriente' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(): Promise<IApiResponse<User[]>> {
    // Retrieve all users from service layer
    // Service handles database query and data transformation
    const data = await this.usersService.findAll();
    
    // Return users with empty message (success implied by 200 status)
    return { message: '', payload: data };
  }

  /**
   * Get User by ID Endpoint
   * 
   * Retrieves a specific user by their unique ID.
   * This endpoint is used for user profile viewing and management.
   * 
   * Security Considerations:
   * - Requires JWT authentication
   * - Parameter validation (numeric ID)
   * - Consider authorization (users accessing own data)
   * - Handle non-existent users gracefully
   * 
   * Error Handling:
   * - 404 Not Found for non-existent users
   * - 401 Unauthorized for invalid tokens
   * - 400 Bad Request for invalid ID format
   * 
   * @param id - User ID as string parameter
   * @returns Promise<IApiResponse<User>> - User object if found
   */
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found user',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            status: { type: 'boolean', example: true },
            phonenumber: { type: 'string', example: '+56912345678' },
            rut: { type: 'string', example: '12345678-9' },
            accountNumber: { type: 'string', example: '1234567890' },
            bank: { type: 'string', example: 'Banco Estado' },
            accountType: { type: 'string', example: 'Cuenta Corriente' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IApiResponse<User>> {
    // Convert string parameter to number and retrieve user
    // Service handles ID validation and database query
    const data = await this.usersService.findOne(+id);
    
    // Return user with empty message (success implied by 200 status)
    return { message: '', payload: data };
  }

  /**
   * Update User Endpoint
   * 
   * Updates an existing user's information and optionally their profile picture.
   * This endpoint supports partial updates through the UpdateUserDto.
   * 
   * Features:
   * - Partial user data updates
   * - Profile picture upload and processing
   * - File validation and security
   * - Automatic URL generation for uploaded images
   * 
   * Security Considerations:
   * - Requires JWT authentication
   * - File upload validation (size, type, etc.)
   * - Input sanitization through DTOs
   * - Consider authorization (users updating own data)
   * 
   * File Upload:
   * - Single profile picture upload
   * - Files processed through MulterModule
   * - Automatic URL generation for stored images
   * - File type and size validation
   * 
   * @param id - User ID as string parameter
   * @param updateUserDto - User update data
   * @param images - Uploaded profile picture files
   * @returns Promise<IApiResponse<User>> - Updated user object
   */
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The user has been successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Usuario editado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            status: { type: 'boolean', example: true },
            phonenumber: { type: 'string', example: '+56912345678' },
            rut: { type: 'string', example: '12345678-9' },
            accountNumber: { type: 'string', example: '1234567890' },
            bank: { type: 'string', example: 'Banco Estado' },
            accountType: { type: 'string', example: 'Cuenta Corriente' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(FilesInterceptor('profile-picture', 1)) // Single file upload
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<IApiResponse<User>> {
    // Update user with provided data and optional profile picture
    // Service handles file processing, validation, and database update
    const data = await this.usersService.update(+id, updateUserDto, images[0]);
    
    // Return updated user with success message
    return { message: 'Usuario editado exitosamente', payload: data };
  }

  /**
   * Delete User Endpoint
   * 
   * Removes a user from the system permanently.
   * This endpoint should be used carefully as it's a destructive operation.
   * 
   * Security Considerations:
   * - Requires JWT authentication
   * - Consider soft delete vs. hard delete
   * - Data retention policies
   * - Cascade deletion handling
   * - Authorization for admin-only operations
   * 
   * Business Logic:
   * - Consider data cleanup (related records)
   * - Audit trail for deletions
   * - Backup/recovery considerations
   * - User notification requirements
   * 
   * @param id - User ID as string parameter
   * @returns Promise<IApiResponse<any>> - Deletion confirmation
   */
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The user has been successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Usuario eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IApiResponse<any>> {
    // Delete user from system
    // Service handles database deletion and cleanup
    const data = await this.usersService.remove(+id);
    
    // Return deletion confirmation
    return { message: 'Usuario eliminado exitosamente', payload: data };
  }

  /**
   * Update Worker Information Endpoint
   * 
   * Updates worker-specific information for a user.
   * This endpoint is specialized for worker profile management
   * and contains fields specific to worker functionality.
   * 
   * Worker-Specific Features:
   * - RUT (Chilean tax ID) management
   * - Bank account information
   * - Account type specification
   * - Worker verification data
   * 
   * Business Logic:
   * - Separate from general user updates
   * - Worker-specific validation rules
   * - Integration with payment systems
   * - Compliance with financial regulations
   * 
   * Security Considerations:
   * - Requires JWT authentication
   * - Sensitive financial data handling
   * - Input validation for financial fields
   * - Consider encryption for sensitive data
   * 
   * @param id - User ID as string parameter
   * @param updateWorkerDto - Worker-specific update data
   * @returns Promise<IApiResponse<User>> - Updated user with worker info
   */
  @ApiOperation({ summary: 'Update worker information' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The worker information has been successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Trabajador editado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            rut: { type: 'string', example: '12345678-9' },
            accountNumber: { type: 'string', example: '1234567890' },
            bank: { type: 'string', example: 'Banco Estado' },
            accountType: { type: 'string', example: 'Cuenta Corriente' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id/worker')
  async updateWorker(
    @Param('id') id: string,
    @Body() updateWorkerDto: UpdateWorkerDto,
  ): Promise<IApiResponse<User>> {
    // Update worker-specific information
    // Service handles worker validation and database update
    const data = await this.usersService.updateWorker(+id, updateWorkerDto);
    
    // Return updated user with worker success message
    return { message: 'Trabajador editado exitosamente', payload: data };
  }
}
