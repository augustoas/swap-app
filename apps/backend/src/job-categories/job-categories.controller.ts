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
import { AuthGuard } from '@nestjs/passport';
import { JobCategoriesService } from './job-categories.service';
import { CreateJobCategoryDto } from './dto/create-job-category.dto';
import { UpdateJobCategoryDto } from './dto/update-job-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Job Categories')
@ApiBearerAuth()
@Controller('job-categories')
@UseGuards(AuthGuard())
export class JobCategoriesController {
  constructor(private readonly jobCategoriesService: JobCategoriesService) {}

  @ApiOperation({ summary: 'Create a new job category relationship' })
  @ApiResponse({ 
    status: 201, 
    description: 'Job category relationship successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Creado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(@Body() createJobCategoryDto: CreateJobCategoryDto) {
    const data = await this.jobCategoriesService.create(createJobCategoryDto);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all job category relationships' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all job category relationships',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              categoryId: { type: 'string', example: '1' },
              jobId: { type: 'string', example: '1' }
            }
          }
        }
      }
    }
  })
  @Get()
  async findAll() {
    const data = await this.jobCategoriesService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get a job category relationship by id' })
  @ApiParam({ name: 'id', description: 'Job Category ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Job category relationship found',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            categoryId: { type: 'string', example: '1' },
            jobId: { type: 'string', example: '1' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Job category relationship not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.jobCategoriesService.findOne(+id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update a job category relationship' })
  @ApiParam({ name: 'id', description: 'Job Category ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Job category relationship successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job category relationship not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobCategoryDto: UpdateJobCategoryDto,
  ) {
    const data = await this.jobCategoriesService.update(
      +id,
      updateJobCategoryDto,
    );
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Delete a job category relationship' })
  @ApiParam({ name: 'id', description: 'Job Category ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Job category relationship successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job category relationship not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.jobCategoriesService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: data };
  }
}
