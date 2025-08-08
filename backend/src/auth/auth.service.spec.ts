import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockImplementation((password, hashedPassword) => {
    return Promise.resolve(password === 'password123' && hashedPassword === 'hashedPassword');
  }),
}));

// Mock the User entity
jest.mock('../database/entities/user.entity', () => {
  return {
    User: jest.fn().mockImplementation(() => ({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      firstname: 'John',
      lastname: 'Doe',
      phonenumber: '+1234567890',
      isEmailConfirmed: false,
      confirmationToken: null,
      confirmationTokenExpiration: null,
      resetToken: null,
      resetTokenExpiration: null,
    })),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailService = {
    enqueueEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      const mockUser = new User();
      Object.assign(mockUser, {
        ...mockSignUpDto,
        id: 1,
        password: 'hashedPassword',
        confirmationToken: 'token',
        confirmationTokenExpiration: new Date(),
      });

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockMailService.enqueueEmail.mockResolvedValue(undefined);

      const result = await service.signUp(mockSignUpDto);

      expect(result).toBeDefined();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockMailService.enqueueEmail).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(mockSignUpDto.password, 12);
    });

    it('should throw an error if user creation fails', async () => {
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.signUp(mockSignUpDto)).rejects.toThrow('Database error');
    });
  });

  describe('signIn', () => {
    const mockSignInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully sign in a user', async () => {
      const mockUser = new User();
      Object.assign(mockUser, {
        id: 1,
        email: mockSignInDto.email,
        password: 'hashedPassword',
        firstname: 'John',
        lastname: 'Doe',
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.signIn(mockSignInDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.token).toBe('jwt-token');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.signIn(mockSignInDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const mockUser = new User();
      Object.assign(mockUser, {
        id: 1,
        email: mockSignInDto.email,
        password: 'wrong-hashed-password',
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.signIn(mockSignInDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('resetPassword', () => {
    const mockResetPasswordDto: ResetPasswordDto = {
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
      resetToken: 'valid-token',
    };

    it('should successfully reset password with token', async () => {
      const mockUser = new User();
      Object.assign(mockUser, {
        id: 1,
        resetToken: 'valid-token',
        resetTokenExpiration: new Date(Date.now() + 3600000),
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.resetPassword(mockResetPasswordDto);

      expect(result).toBeDefined();
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(mockResetPasswordDto.newPassword, 12);
    });

    it('should throw error for mismatched passwords', async () => {
      const invalidDto = {
        ...mockResetPasswordDto,
        confirmPassword: 'differentPassword',
      };

      await expect(service.resetPassword(invalidDto)).rejects.toThrow('Passwords must match');
    });
  });

  describe('confirmEmail', () => {
    it('should successfully confirm email with valid token', async () => {
      const mockUser = new User();
      Object.assign(mockUser, {
        id: 1,
        confirmationToken: 'valid-token',
        confirmationTokenExpiration: new Date(Date.now() + 3600000),
        isEmailConfirmed: false,
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, isEmailConfirmed: true });

      const result = await service.confirmEmail('valid-token');

      expect(result).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error for expired token', async () => {
      const mockUser = new User();
      Object.assign(mockUser, {
        id: 1,
        confirmationToken: 'expired-token',
        confirmationTokenExpiration: new Date(Date.now() - 3600000),
        isEmailConfirmed: false,
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.confirmEmail('expired-token')).rejects.toThrow('Token expired');
    });
  });
}); 