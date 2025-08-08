import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TycService } from './tyc.service';
import { CreateTycDto } from './dto/create-tyc.dto';
import { UpdateTycDto } from './dto/update-tyc.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TermsAndConditions } from '../database/entities/termsAndConditions.entity';
import { IApiResponse } from '../types/Api.interface';

@ApiTags('Terms and Conditions')
@ApiBearerAuth()
@Controller('tyc')
@UseGuards(AuthGuard())
export class TycController {
  constructor(private readonly tycService: TycService) {}

  @ApiOperation({ summary: 'Create new terms and conditions' })
  @ApiResponse({ 
    status: 201, 
    description: 'The terms and conditions have been successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Creado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: { type: 'string', example: 'Terms of Service - Version 1.0' },
            text: { type: 'string', example: 'By using our service, you agree to these terms...' },
            description: { type: 'string', example: 'These terms and conditions outline the rules...' },
            createdDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' },
            updatedDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(@Body() createTycDto: CreateTycDto): Promise<IApiResponse<TermsAndConditions>> {
    const data = await this.tycService.create(createTycDto);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all terms and conditions' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all terms and conditions',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              title: { type: 'string', example: 'Terms of Service - Version 1.0' },
              text: { type: 'string', example: 'By using our service, you agree to these terms...' },
              description: { type: 'string', example: 'These terms and conditions outline the rules...' },
              createdDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' },
              updatedDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(): Promise<IApiResponse<TermsAndConditions[]>> {
    const data = await this.tycService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get terms and conditions by ID' })
  @ApiParam({ name: 'id', description: 'Terms and Conditions ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found terms and conditions',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: { type: 'string', example: 'Terms of Service - Version 1.0' },
            text: { type: 'string', example: 'By using our service, you agree to these terms...' },
            description: { type: 'string', example: 'These terms and conditions outline the rules...' },
            createdDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' },
            updatedDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IApiResponse<TermsAndConditions>> {
    const data = await this.tycService.findOne(+id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update terms and conditions' })
  @ApiParam({ name: 'id', description: 'Terms and Conditions ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The terms and conditions have been successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: { type: 'string', example: 'Updated Terms of Service' },
            text: { type: 'string', example: 'Updated terms and conditions...' },
            description: { type: 'string', example: 'Updated description...' },
            createdDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' },
            updatedDate: { type: 'string', format: 'date-time', example: '2024-03-20T00:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateTycDto: UpdateTycDto
  ): Promise<IApiResponse<TermsAndConditions>> {
    const data = await this.tycService.update(+id, updateTycDto);
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Delete terms and conditions' })
  @ApiParam({ name: 'id', description: 'Terms and Conditions ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The terms and conditions have been successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IApiResponse<void>> {
    await this.tycService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: null };
  }
}
