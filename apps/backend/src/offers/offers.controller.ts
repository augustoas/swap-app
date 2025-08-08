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
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { CurrentUser } from '../auth/decorators/CurrentUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../database/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Offers')
@ApiBearerAuth()
@Controller('offers')
@UseGuards(AuthGuard())
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiOperation({ summary: 'Create a new offer' })
  @ApiResponse({ 
    status: 201, 
    description: 'The offer has been successfully created',
    schema: {
      properties: {
        message: { type: 'string', example: 'Creado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'I can help you with this job' },
            budget: { type: 'number', example: 1000 },
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
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.offersService.create(createOfferDto, user);
    return { message: 'Creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get all offers' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all offers',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              text: { type: 'string', example: 'I can help you with this job' },
              budget: { type: 'number', example: 1000 },
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
    const data = await this.offersService.findAll();
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Get an offer by ID' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found offer',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'I can help you with this job' },
            budget: { type: 'number', example: 1000 },
            jobId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.offersService.findOne(+id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Update an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The offer has been successfully updated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Editado exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            text: { type: 'string', example: 'Updated offer text' },
            budget: { type: 'number', example: 1500 },
            jobId: { type: 'number', example: 1 },
            userId: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    const data = await this.offersService.update(+id, updateOfferDto);
    return { message: 'Editado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Delete an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The offer has been successfully deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Eliminado exitosamente' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.offersService.remove(+id);
    return { message: 'Eliminado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Get offers by current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of offers for the current user',
    schema: {
      properties: {
        message: { type: 'string', example: '' },
        payload: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              text: { type: 'string', example: 'I can help you with this job' },
              budget: { type: 'number', example: 1000 },
              jobId: { type: 'number', example: 1 },
              userId: { type: 'number', example: 1 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('user/offers')
  @UseGuards(AuthGuard())
  async findOffersByUser(@CurrentUser() user: User) {
    const data = await this.offersService.findOffersByUserId(user.id);
    return { message: '', payload: data };
  }

  @ApiOperation({ summary: 'Accept an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The offer has been successfully accepted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Oferta aceptada exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            status: { type: 'string', example: 'accepted' },
            text: { type: 'string', example: 'I can help you with this job' },
            budget: { type: 'number', example: 1000 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Post(':id/accept')
  async acceptOffer(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.offersService.acceptOffer(+id, user);
    return { 
      message: 'Oferta aceptada exitosamente', 
      payload: data 
    };
  }

  @ApiOperation({ summary: 'Decline an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'The offer has been successfully declined',
    schema: {
      properties: {
        message: { type: 'string', example: 'Oferta rechazada exitosamente' },
        payload: { 
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            status: { type: 'string', example: 'rejected' },
            text: { type: 'string', example: 'I can help you with this job' },
            budget: { type: 'number', example: 1000 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Post(':id/decline')
  async declineOffer(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.offersService.declineOffer(+id, user);
    return { 
      message: 'Oferta rechazada exitosamente', 
      payload: data 
    };
  }
}
