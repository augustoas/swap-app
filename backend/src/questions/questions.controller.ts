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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../database/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('questions')
@UseGuards(AuthGuard())
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ 
    status: 201, 
    description: 'The question has been successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Creado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'What is the expected timeline for this project?' },
            jobId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.questionsService.create(createQuestionDto, user);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all questions',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              text: { type: 'string', example: 'What is the expected timeline for this project?' },
              jobId: { type: 'number', example: 1 },
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
    const data = await this.questionsService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({ name: 'id', description: 'Question ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found question',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'What is the expected timeline for this project?' },
            jobId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.questionsService.findOne(+id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'id', description: 'Question ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The question has been successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'Updated question text' },
            jobId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    const data = await this.questionsService.update(+id, updateQuestionDto);
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Delete a question' })
  @ApiParam({ name: 'id', description: 'Question ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The question has been successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.questionsService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: data };
  }
}
