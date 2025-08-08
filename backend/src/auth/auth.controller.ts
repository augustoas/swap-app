import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from '../database/entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { IApiResponse } from '../types/Api.interface';
import { OptionalJwt } from '../auth/decorators/OptionalJwt.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: SignUpDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/signup')
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<IApiResponse<User>> {
    const data = await this.authService.signUp(signUpDto);
    return { message: 'Usuario creado exitosamente', payload: data };
  }

  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully signed in',
    schema: {
      properties: {
        message: { type: 'string', example: 'Inicio de sesión exitoso' },
        payload: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'jwt-token' },
            user: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('/signin')
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<IApiResponse<{ token: string; user: User }>> {
    const data = await this.authService.signIn(signInDto);
    return { message: 'Inicio de sesión exitoso', payload: data };
  }

  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ 
    status: 200, 
    description: 'Google authentication successful',
    schema: {
      properties: {
        message: { type: 'string', example: 'User information from google' },
        user: { type: 'object' }
      }
    }
  })
  @Get('/google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent',
    schema: {
      properties: {
        message: { type: 'string', example: 'Se ha enviado un correo con las indicaciones para recuperar su contraseña.' },
        payload: { type: 'string', example: 'reset-token' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('/forgotpassword')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const data = await this.authService.generateResetToken(forgotPasswordDto.email);
    return {
      message:
        'Se ha enviado un correo con las indicaciones para recuperar su contraseña.',
      payload: data,
    };
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password successfully reset',
    schema: {
      properties: {
        message: { type: 'string', example: 'Cambio de contraseña exitoso.' },
        payload: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid token or passwords do not match' })
  @ApiBearerAuth()
  @Post('/resetpassword')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @OptionalJwt() user?: User,
  ) {
    const data = await this.authService.resetPassword(resetPasswordDto, user);
    return { message: 'Cambio de contraseña exitoso.', payload: data };
  }

  @ApiOperation({ summary: 'Confirm email address' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email successfully confirmed',
    schema: {
      properties: {
        message: { type: 'string', example: 'Email confirmado exitosamente.' },
        payload: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Get('/confirmemail/:token')
  async confirmEmail(@Param('token') token: string) {
    const data = await this.authService.confirmEmail(token);
    return { message: 'Email confirmado exitosamente.', payload: data };
  }
}
