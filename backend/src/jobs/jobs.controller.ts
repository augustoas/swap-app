import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AuthGuard } from '@nestjs/passport';
// import { OptionalJwt } from '../auth/decorators/OptionalJwt.decorator';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

import { User } from '../database/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Create a new job' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        ...Object.fromEntries(
          Object.entries(new CreateJobDto()).map(([key]) => [
            key,
            { type: 'string' },
          ]),
        ),
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Job successfully created',
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
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createJobDto: CreateJobDto,
    @UploadedFiles() images: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    const data = await this.jobsService.create(createJobDto, user, images);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all jobs',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              budget: { type: 'string', example: '1000' },
              description: { type: 'string', example: 'Need a web developer' },
              details: { type: 'string', example: 'Looking for a web developer with experience' },
              currency: { type: 'string', example: 'USD' },
              region: { type: 'string', example: 'Metropolitan Region' },
              commune: { type: 'string', example: 'Santiago' },
              address: { type: 'string', example: '123 Main St' },
              dateType: { type: 'string', example: 'SPECIFIC' },
              date: { type: 'string', example: '2024-03-20' },
              is_remote: { type: 'boolean', example: true }
            }
          }
        }
      }
    }
  })
  @Get()
  async findAll() {
    const data = await this.jobsService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get a job by id' })
  @ApiParam({ name: 'id', description: 'Job ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Job found',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            budget: { type: 'string', example: '1000' },
            description: { type: 'string', example: 'Need a web developer' },
            details: { type: 'string', example: 'Looking for a web developer with experience' },
            currency: { type: 'string', example: 'USD' },
            region: { type: 'string', example: 'Metropolitan Region' },
            commune: { type: 'string', example: 'Santiago' },
            address: { type: 'string', example: '123 Main St' },
            dateType: { type: 'string', example: 'SPECIFIC' },
            date: { type: 'string', example: '2024-03-20' },
            is_remote: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.jobsService.findOne(+id, user);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update a job' })
  @ApiParam({ name: 'id', description: 'Job ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Job successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Patch(':id')
  @UseGuards(AuthGuard())
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @CurrentUser() user: User) {
    const data = await this.jobsService.update(+id, updateJobDto, user);
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Update a job images' })
  @ApiParam({ name: 'id', description: 'Job ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Job images successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Patch(':id/images')
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor('images', 10))
  async updateImages(@Param('id') id: string, @UploadedFiles() images: Express.Multer.File[], @CurrentUser() user: User) {
    const data = await this.jobsService.updateImages(+id, images, user);
    return { message: 'Imágenes actualizadas exitosamente', payload: data };
  }


  @ApiOperation({ summary: 'Delete a job' })
  @ApiParam({ name: 'id', description: 'Job ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Job successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Delete(':id')
  @UseGuards(AuthGuard())
  async remove(@Param('id') id: string) {
    const data = await this.jobsService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get jobs by current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of jobs created by the current user',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              budget: { type: 'string', example: '1000' },
              description: { type: 'string', example: 'Need a web developer' },
              details: { type: 'string', example: 'Looking for a web developer with experience' },
              currency: { type: 'string', example: 'USD' },
              region: { type: 'string', example: 'Metropolitan Region' },
              commune: { type: 'string', example: 'Santiago' },
              address: { type: 'string', example: '123 Main St' },
              dateType: { type: 'string', example: 'SPECIFIC' },
              date: { type: 'string', example: '2024-03-20' },
              is_remote: { type: 'boolean', example: true }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('user/jobs')
  @UseGuards(AuthGuard())
  async findJobsByUser(@CurrentUser() user: User) {
    const data = await this.jobsService.findJobsByUserId(user.id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get finished jobs where current user is the worker' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of finished jobs where the current user is the job worker',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              budget: { type: 'string', example: '1000' },
              description: { type: 'string', example: 'Web development job' },
              status: { type: 'string', example: 'finished' },
              jobCreator: { type: 'object' },
              jobWorker: { type: 'object' },
              createdDate: { type: 'string', example: '2024-01-15T10:30:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('swapper/finished-jobs')
  @UseGuards(AuthGuard())
  async findFinishedJobsByWorker(@CurrentUser() user: User) {
    const data = await this.jobsService.findFinishedJobsByWorkerId(user.id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Finish a job' })
  @ApiParam({ name: 'id', description: 'Job ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Job successfully finished',
    schema: {
      properties: {
        message: { type: 'string', example: 'Trabajo terminado exitosamente' },
        payload: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            status: { type: 'string', example: 'finished' },
            description: { type: 'string', example: 'Job description' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Job cannot be finished' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Patch(':id/finish')
  @UseGuards(AuthGuard())
  async finishJob(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.jobsService.finishJob(+id, user);
    return { message: 'Trabajo terminado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Rate a job' })
  @ApiParam({ name: 'id', description: 'Job ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Job successfully rated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Patch(':id/rate')
  @UseGuards(AuthGuard())
  async rateJob(@Param('id') id: string, @Body() rating: number, @CurrentUser() user: User) {
    const data = await this.jobsService.rateJob(+id, rating, user);
    return { message: 'Se ha evaluado exitosamente', payload: data };
  }
}
