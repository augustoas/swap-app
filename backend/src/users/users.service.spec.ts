import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { NotFoundException } from '@nestjs/common';
import { Gender } from '../types/Gender.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

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
    createdJobs: [],
    acceptedJobs: [],
    createdReviews: [],
    receivedReviews: [],
  };

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.save).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle errors during creation', async () => {
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

      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return an empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updated',
        gender: Gender.MALE,
        birthdate: new Date('1990-01-01'),
        phonenumber: '+56912345678',
        rut: '12345678-9',
        accountNumber: '1234567890',
        bank: 'Banco Estado',
        accountType: 'Cuenta Corriente',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        username: 'updated',
        gender: Gender.MALE,
        birthdate: new Date('1990-01-01'),
        phonenumber: '+56912345678',
        rut: '12345678-9',
        accountNumber: '1234567890',
        bank: 'Banco Estado',
        accountType: 'Cuenta Corriente',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
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
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.updateWorker(1, updateWorkerDto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateWorkerDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when updating non-existent worker', async () => {
      const updateWorkerDto: UpdateWorkerDto = {
        rut: '87654321-9',
        accountNumber: '0987654321',
        bank: 'Banco Chile',
        accountType: 'Cuenta Vista',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.updateWorker(999, updateWorkerDto)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found'),
      );
    });
  });
}); 