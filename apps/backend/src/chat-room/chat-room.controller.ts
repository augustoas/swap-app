import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto, ChatRoomPreview } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { ChatRoom } from '../database/entities/chatRoom.entity';
import { IApiResponse } from '../types/Api.interface';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { User } from '../database/entities/user.entity';

@ApiTags('ChatRoom')
@ApiBearerAuth()
@Controller('chat-rooms')
@UseGuards(AuthGuard())
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ 
    status: 201, 
    description: 'The chat room has been successfully created',
    type: ChatRoom 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @Body() createChatRoomDto: CreateChatRoomDto,
  ): Promise<IApiResponse<ChatRoom>> {
    const data = await this.chatRoomService.create(createChatRoomDto);
    return {
      message: 'Chat room created successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get all chat rooms' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all chat rooms',
    type: [ChatRoom] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(): Promise<IApiResponse<ChatRoom[]>> {
    const data = await this.chatRoomService.findAll();
    return {
      message: 'Chat rooms retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get a chat room by ID' })
  @ApiParam({ name: 'id', description: 'Chat room ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found chat room',
    type: ChatRoom 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IApiResponse<ChatRoom>> {
    const data = await this.chatRoomService.findOne(+id);
    return {
      message: 'Chat room retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get chat rooms by user ID (detailed)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of chat rooms for the user',
    type: [ChatRoom] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<IApiResponse<ChatRoom[]>> {
    const data = await this.chatRoomService.findByUserId(+userId);
    return {
      message: 'User chat rooms retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get chat rooms by user ID with preview data (hybrid loading)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of chat rooms with preview data (last message, unread count)',
    type: [ChatRoomPreview] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('user/:userId/preview')
  async findByUserIdWithPreview(@Param('userId') userId: string): Promise<IApiResponse<ChatRoomPreview[]>> {
    const data = await this.chatRoomService.findByUserIdWithPreview(+userId);
    return {
      message: 'User chat rooms with preview retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get current user chat rooms with preview data' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of current user chat rooms with preview data',
    type: [ChatRoomPreview] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('my-chats/preview')
  async getMyChatsWithPreview(@CurrentUser() user: User): Promise<IApiResponse<ChatRoomPreview[]>> {
    const data = await this.chatRoomService.findByUserIdWithPreview(user.id);
    return {
      message: 'Your chat rooms with preview retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get chat room by job ID' })
  @ApiParam({ name: 'jobId', description: 'Job ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found chat room for the job',
    type: ChatRoom 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Get('job/:jobId')
  async findByJobId(@Param('jobId') jobId: string): Promise<IApiResponse<ChatRoom>> {
    const data = await this.chatRoomService.findByJobId(+jobId);
    return {
      message: 'Chat room for job retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Update a chat room' })
  @ApiParam({ name: 'id', description: 'Chat room ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The chat room has been successfully updated',
    type: ChatRoom 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChatRoomDto: UpdateChatRoomDto,
  ): Promise<IApiResponse<ChatRoom>> {
    const data = await this.chatRoomService.update(+id, updateChatRoomDto);
    return {
      message: 'Chat room updated successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Delete a chat room' })
  @ApiParam({ name: 'id', description: 'Chat room ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The chat room has been successfully deleted' 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IApiResponse<void>> {
    await this.chatRoomService.remove(+id);
    return {
      message: 'Chat room deleted successfully',
      payload: null,
    };
  }
}
