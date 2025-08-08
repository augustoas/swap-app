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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { User } from '../database/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(AuthGuard())
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ 
    status: 201, 
    description: 'The review has been successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Creado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'Great work! Very professional and delivered on time.' },
            rating: { type: 'string', example: '5' },
            reviewReceiverId: { type: 'number', example: 1 },
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
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.reviewsService.create(createReviewDto, user);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all reviews',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              text: { type: 'string', example: 'Great work! Very professional and delivered on time.' },
              rating: { type: 'string', example: '5' },
              reviewReceiverId: { type: 'number', example: 1 },
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
    const data = await this.reviewsService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found review',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'Great work! Very professional and delivered on time.' },
            rating: { type: 'string', example: '5' },
            reviewReceiverId: { type: 'number', example: 1 },
            jobId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.reviewsService.findOne(+id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'id', description: 'Review ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The review has been successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'Updated review text' },
            rating: { type: 'string', example: '4' },
            reviewReceiverId: { type: 'number', example: 1 },
            jobId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const data = await this.reviewsService.update(+id, updateReviewDto);
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The review has been successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.reviewsService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: data };
  }
}
