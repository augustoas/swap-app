import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../database/entities/user.entity';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    googleLogin: jest.fn(),
    generateResetToken: jest.fn(),
    resetPassword: jest.fn(),
    confirmEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    const mockSignUpDto: SignUpDto = {
      email: 'test@example.com',
      password: 'password123',
      firstname: 'John',
      lastname: 'Doe',
      phonenumber: '+1234567890',
    };

    it('should successfully create a new user', async () => {
      const mockUser = {
        id: 1,
        ...mockSignUpDto,
        password: undefined, // Password should be removed from response
      };

      mockAuthService.signUp.mockResolvedValue(mockUser);

      const result = await controller.signUp(mockSignUpDto);

      expect(result).toEqual({
        message: 'Usuario creado exitosamente',
        payload: mockUser,
      });
      expect(mockAuthService.signUp).toHaveBeenCalledWith(mockSignUpDto);
    });

    it('should handle signup errors', async () => {
      mockAuthService.signUp.mockRejectedValue(new Error('Signup failed'));

      await expect(controller.signUp(mockSignUpDto)).rejects.toThrow('Signup failed');
    });
  });

  describe('signIn', () => {
    const mockSignInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully sign in a user', async () => {
      const mockResponse = {
        token: 'jwt-token',
        user: {
          id: 1,
          email: mockSignInDto.email,
          firstname: 'John',
          lastname: 'Doe',
        },
      };

      mockAuthService.signIn.mockResolvedValue(mockResponse);

      const result = await controller.signIn(mockSignInDto);

      expect(result).toEqual({
        message: 'Inicio de sesión exitoso',
        payload: mockResponse,
      });
      expect(mockAuthService.signIn).toHaveBeenCalledWith(mockSignInDto);
    });

    it('should handle invalid credentials', async () => {
      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.signIn(mockSignInDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    const mockForgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should generate reset token and send email', async () => {
      const mockToken = 'reset-token';

      mockAuthService.generateResetToken.mockResolvedValue(mockToken);

      const result = await controller.forgotPassword(mockForgotPasswordDto);

      expect(result).toEqual({
        message: 'Se ha enviado un correo con las indicaciones para recuperar su contraseña.',
        payload: mockToken,
      });
      expect(mockAuthService.generateResetToken).toHaveBeenCalledWith(mockForgotPasswordDto.email);
    });

    it('should handle non-existent email', async () => {
      mockAuthService.generateResetToken.mockRejectedValue(new Error('User not found'));

      await expect(controller.forgotPassword(mockForgotPasswordDto)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    const mockResetPasswordDto: ResetPasswordDto = {
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
      resetToken: 'valid-token',
    };

    it('should successfully reset password with token', async () => {
      const mockResult = { affected: 1 };

      mockAuthService.resetPassword.mockResolvedValue(mockResult);

      const result = await controller.resetPassword(mockResetPasswordDto);

      expect(result).toEqual({
        message: 'Cambio de contraseña exitoso.',
        payload: mockResult,
      });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto, undefined);
    });

    it('should successfully reset password with authenticated user', async () => {
      const mockUser = { id: 1 } as User;
      const mockResult = { affected: 1 };

      mockAuthService.resetPassword.mockResolvedValue(mockResult);

      const result = await controller.resetPassword(mockResetPasswordDto, mockUser);

      expect(result).toEqual({
        message: 'Cambio de contraseña exitoso.',
        payload: mockResult,
      });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(mockResetPasswordDto, mockUser);
    });

    it('should handle password reset errors', async () => {
      mockAuthService.resetPassword.mockRejectedValue(new Error('Invalid token'));

      await expect(controller.resetPassword(mockResetPasswordDto)).rejects.toThrow('Invalid token');
    });
  });

  describe('confirmEmail', () => {
    it('should successfully confirm email', async () => {
      const token = 'valid-token';
      mockAuthService.confirmEmail.mockResolvedValue(true);

      const result = await controller.confirmEmail(token);

      expect(result).toEqual({
        message: 'Email confirmado exitosamente.',
        payload: true,
      });
      expect(mockAuthService.confirmEmail).toHaveBeenCalledWith(token);
    });

    it('should handle invalid confirmation token', async () => {
      const token = 'invalid-token';
      mockAuthService.confirmEmail.mockRejectedValue(new Error('Invalid token'));

      await expect(controller.confirmEmail(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('googleAuth', () => {
    it('should be defined', () => {
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should handle Google auth redirect with user data', () => {
      const mockReq = { user: { id: 1, email: 'test@example.com' } };
      const mockResponse = {
        message: 'User information from google',
        user: mockReq.user,
      };

      mockAuthService.googleLogin.mockReturnValue(mockResponse);

      const result = controller.googleAuthRedirect(mockReq);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(mockReq);
    });

    it('should handle Google auth redirect without user data', () => {
      const mockReq = { user: null };
      const mockResponse = 'No user from google';

      mockAuthService.googleLogin.mockReturnValue(mockResponse);

      const result = controller.googleAuthRedirect(mockReq);

      expect(result).toBe(mockResponse);
      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(mockReq);
    });
  });
}); 