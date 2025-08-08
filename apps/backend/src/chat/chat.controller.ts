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
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatService, PaginatedMessages } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from '../database/entities/chat.entity';
import { IApiResponse } from '../types/Api.interface';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { User } from '../database/entities/user.entity';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(AuthGuard())
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Create a new chat message' })
  @ApiResponse({ 
    status: 201, 
    description: 'The chat message has been successfully created',
    type: Chat 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @Body() createChatDto: CreateChatDto,
  ): Promise<IApiResponse<Chat>> {
    const data = await this.chatService.create(createChatDto);
    return {
      message: 'Chat message created successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get all chat messages' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all chat messages',
    type: [Chat] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(): Promise<IApiResponse<Chat[]>> {
    const data = await this.chatService.findAll();
    return {
      message: 'Chat messages retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get a chat message by ID' })
  @ApiParam({ name: 'id', description: 'Chat message ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found chat message',
    type: Chat 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat message not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IApiResponse<Chat>> {
    const data = await this.chatService.findOne(+id);
    return {
      message: 'Chat message retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get messages by chat room ID (all messages)' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all messages in the chat room',
    type: [Chat] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('room/:chatRoomId')
  async findByChatRoomId(@Param('chatRoomId') chatRoomId: string): Promise<IApiResponse<Chat[]>> {
    const data = await this.chatService.findByChatRoomId(+chatRoomId);
    return {
      message: 'Chat room messages retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get recent messages for a chat room (hybrid loading)' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room ID', type: 'number' })
  @ApiQuery({ name: 'limit', description: 'Number of messages to retrieve', type: 'number', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent messages in the chat room',
    type: [Chat] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('room/:chatRoomId/recent')
  async getRecentMessages(
    @Param('chatRoomId') chatRoomId: string,
    @Query('limit') limit?: string,
  ): Promise<IApiResponse<Chat[]>> {
    const data = await this.chatService.getRecentMessages(+chatRoomId, limit ? +limit : 50);
    return {
      message: 'Recent messages retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get paginated messages for a chat room' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room ID', type: 'number' })
  @ApiQuery({ name: 'limit', description: 'Number of messages to retrieve', type: 'number', required: false })
  @ApiQuery({ name: 'before', description: 'Get messages before this message ID', type: 'number', required: false })
  @ApiQuery({ name: 'after', description: 'Get messages after this message ID', type: 'number', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated messages with metadata',
    schema: {
      properties: {
        message: { type: 'string' },
        payload: {
          type: 'object',
          properties: {
            messages: { type: 'array', items: { type: 'object' } },
            hasMore: { type: 'boolean' },
            totalCount: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('room/:chatRoomId/paginated')
  async getPaginatedMessages(
    @Param('chatRoomId') chatRoomId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
    @Query('after') after?: string,
  ): Promise<IApiResponse<PaginatedMessages>> {
    const options = {
      limit: limit ? +limit : 50,
      before: before ? +before : undefined,
      after: after ? +after : undefined,
    };
    
    const data = await this.chatService.findByChatRoomIdWithPagination(+chatRoomId, options);
    return {
      message: 'Paginated messages retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get older messages before a specific message' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room ID', type: 'number' })
  @ApiParam({ name: 'messageId', description: 'Message ID to get messages before', type: 'number' })
  @ApiQuery({ name: 'limit', description: 'Number of messages to retrieve', type: 'number', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Older messages with pagination metadata',
    schema: {
      properties: {
        message: { type: 'string' },
        payload: {
          type: 'object',
          properties: {
            messages: { type: 'array', items: { type: 'object' } },
            hasMore: { type: 'boolean' },
            totalCount: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('room/:chatRoomId/before/:messageId')
  async getOlderMessages(
    @Param('chatRoomId') chatRoomId: string,
    @Param('messageId') messageId: string,
    @Query('limit') limit?: string,
  ): Promise<IApiResponse<PaginatedMessages>> {
    const data = await this.chatService.getOlderMessages(
      +chatRoomId, 
      +messageId, 
      limit ? +limit : 20
    );
    return {
      message: 'Older messages retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get newer messages after a specific message' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room ID', type: 'number' })
  @ApiParam({ name: 'messageId', description: 'Message ID to get messages after', type: 'number' })
  @ApiQuery({ name: 'limit', description: 'Number of messages to retrieve', type: 'number', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Newer messages with pagination metadata',
    schema: {
      properties: {
        message: { type: 'string' },
        payload: {
          type: 'object',
          properties: {
            messages: { type: 'array', items: { type: 'object' } },
            hasMore: { type: 'boolean' },
            totalCount: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('room/:chatRoomId/after/:messageId')
  async getNewerMessages(
    @Param('chatRoomId') chatRoomId: string,
    @Param('messageId') messageId: string,
    @Query('limit') limit?: string,
  ): Promise<IApiResponse<PaginatedMessages>> {
    const data = await this.chatService.getNewerMessages(
      +chatRoomId, 
      +messageId, 
      limit ? +limit : 20
    );
    return {
      message: 'Newer messages retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get messages by sender ID' })
  @ApiParam({ name: 'senderId', description: 'Sender ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of messages sent by the user',
    type: [Chat] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('sender/:senderId')
  async findBySenderId(@Param('senderId') senderId: string): Promise<IApiResponse<Chat[]>> {
    const data = await this.chatService.findBySenderId(+senderId);
    return {
      message: 'Sender messages retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get message count for a chat room' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Message count for the chat room',
    schema: {
      properties: {
        message: { type: 'string' },
        payload: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('room/:chatRoomId/count')
  async getMessageCount(@Param('chatRoomId') chatRoomId: string): Promise<IApiResponse<number>> {
    const data = await this.chatService.getMessageCount(+chatRoomId);
    return {
      message: 'Message count retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Get last message for a chat room' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Last message in the chat room',
    type: Chat 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('room/:chatRoomId/last')
  async getLastMessage(@Param('chatRoomId') chatRoomId: string): Promise<IApiResponse<Chat | null>> {
    const data = await this.chatService.getLastMessage(+chatRoomId);
    return {
      message: 'Last message retrieved successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Update a chat message' })
  @ApiParam({ name: 'id', description: 'Chat message ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The chat message has been successfully updated',
    type: Chat 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat message not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ): Promise<IApiResponse<Chat>> {
    const data = await this.chatService.update(+id, updateChatDto);
    return {
      message: 'Chat message updated successfully',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Delete a chat message' })
  @ApiParam({ name: 'id', description: 'Chat message ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The chat message has been successfully deleted' 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat message not found' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IApiResponse<void>> {
    await this.chatService.remove(+id);
    return {
      message: 'Chat message deleted successfully',
      payload: null,
    };
  }
}
