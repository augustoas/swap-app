import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../database/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Replies')
@ApiBearerAuth()
@Controller('replies')
@UseGuards(AuthGuard())
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  @ApiOperation({ summary: 'Create a new reply' })
  @ApiResponse({ 
    status: 201, 
    description: 'The reply has been successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Creado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'The project timeline is estimated to be 2 weeks.' },
            questionId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @Body() createReplyDto: CreateReplyDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.repliesService.create(createReplyDto, user);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all replies' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all replies',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              text: { type: 'string', example: 'The project timeline is estimated to be 2 weeks.' },
              questionId: { type: 'number', example: 1 },
              userId: { type: 'number', example: 1 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll() {
    const data = await this.repliesService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get a reply by ID' })
  @ApiParam({ name: 'id', description: 'Reply ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found reply',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'The project timeline is estimated to be 2 weeks.' },
            questionId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.repliesService.findOne(+id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update a reply' })
  @ApiParam({ name: 'id', description: 'Reply ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The reply has been successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'Updated reply text' },
            questionId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateReplyDto,
  ) {
    const data = await this.repliesService.update(+id, updateReplyDto);
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Delete a reply' })
  @ApiParam({ name: 'id', description: 'Reply ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The reply has been successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.repliesService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: data };
  }
}
