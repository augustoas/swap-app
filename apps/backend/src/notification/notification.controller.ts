import { Controller, Post, Param, Delete, UseGuards, Get, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { User } from '../database/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notification')
@UseGuards(AuthGuard())
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of notifications for the current user',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              title: { type: 'string', example: 'New Job Created' },
              subtitle: { type: 'string', example: 'Status: Published' },
              message: { type: 'string', example: 'A new job has been created' },
              path: { type: 'string', example: '/jobs/123' },
              is_read: { type: 'boolean', example: false },
              createdDate: { type: 'string', example: '2024-03-20T00:00:00.000Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('findByCurrentAuthUser')
  async findByCurrentAuthUser(@CurrentUser() user: User) {
    const data = await this.notificationService.findByCurrentAuthUser(user);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get unread notifications count for current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Count of unread notifications',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'object',
          properties: {
            count: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { message: '', payload: { count } };
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification marked as read',
    schema: {
      properties: {
        message: { type: 'string', example: 'Notification marked as read' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    const notification = await this.notificationService.findOne(+id);
    if (!notification || notification.user.id !== user.id) {
      return { message: 'Notification not found or access denied', payload: null };
    }
    
    const data = await this.notificationService.markAsRead(+id);
    return { message: 'Notification marked as read', payload: data };
  }

  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Notificación eliminada exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const notification = await this.notificationService.findOne(+id);
    if (!notification || notification.user.id !== user.id) {
      return { message: 'Notification not found or access denied', payload: null };
    }
    
    const data = await this.notificationService.remove(+id);
    return { message: 'Notificación eliminada exitosamente', payload: data };
  }
}
