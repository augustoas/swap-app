import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { User } from '../database/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Gender } from '../types/Gender.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phonenumber: '+56912345678',
    rut: '12345678-9',
    accountNumber: '1234567890',
    bank: 'Banco Estado',
    accountType: 'Cuenta Corriente',
    createdDate: new Date(),
    updatedDate: new Date(),
    createdJobs: [],
    acceptedJobs: [],
    createdReviews: [],
    receivedReviews: [],
    offers: [],
    questions: [],
    replies: [],
    termsAndConditions: [],
    notification: [],
    chat: [],
    isSwapper: false,
    isEmailConfirmed: false,
    gender: Gender.MALE,
    resetToken: null,
    resetTokenExpiration: null,
    birthdate: new Date('1990-01-01'),
    deletedAt: null,
    confirmationToken: null,
    confirmationTokenExpiration: null,
    profilePicturePath: null,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateWorker: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async () => ({
            secret: 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        status: true,
        phonenumber: '+56912345678',
        rut: '12345678-9',
        accountNumber: '1234567890',
        bank: 'Banco Estado',
        accountType: 'Cuenta Corriente',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        message: 'Usuario creado exitosamente',
        payload: mockUser,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: '',
        payload: mockUsers,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: '',
        payload: mockUser,
      });
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'johndoe',
        gender: Gender.MALE,
        birthdate: new Date('1990-01-01'),
        phonenumber: '+56987654321',
        rut: '87654321-9',
        accountNumber: '0987654321',
        bank: 'Banco Chile',
        accountType: 'Cuenta Vista',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({
        message: 'Usuario editado exitosamente',
        payload: updatedUser,
      });
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Usuario eliminado exitosamente',
        payload: undefined,
      });
    });
  });

  describe('updateWorker', () => {
    it('should update worker information and return the user', async () => {
      const updateWorkerDto: UpdateWorkerDto = {
        rut: '87654321-9',
        accountNumber: '0987654321',
        bank: 'Banco Chile',
        accountType: 'Cuenta Vista',
      };

      const updatedUser = { ...mockUser, ...updateWorkerDto };
      mockUsersService.updateWorker.mockResolvedValue(updatedUser);

      const result = await controller.updateWorker('1', updateWorkerDto);

      expect(mockUsersService.updateWorker).toHaveBeenCalledWith(1, updateWorkerDto);
      expect(result).toEqual({
        message: 'Trabajador editado exitosamente',
        payload: updatedUser,
      });
    });
  });
}); 