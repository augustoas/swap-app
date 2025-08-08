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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(AuthGuard())
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ 
    status: 201, 
    description: 'Category successfully created',
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
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoriesService.create(createCategoryDto);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all categories',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Electronics' },
              description: { type: 'string', example: 'Electronic devices and accessories' }
            }
          }
        }
      }
    }
  })
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get a category by id' })
  @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category found',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Electronics' },
            description: { type: 'string', example: 'Electronic devices and accessories' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(+id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Patch(':id')
  @UseGuards(AuthGuard())
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.update(+id, updateCategoryDto);
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Delete(':id')
  @UseGuards(AuthGuard())
  async remove(@Param('id') id: string) {
    const data = await this.categoriesService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: data };
  }
}
