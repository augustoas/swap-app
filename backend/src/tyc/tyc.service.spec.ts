import { Test, TestingModule } from '@nestjs/testing';
import { TycService } from './tyc.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TermsAndConditions } from '../database/entities/termsAndConditions.entity';
import { Repository } from 'typeorm';
import { CreateTycDto } from './dto/create-tyc.dto';
import { UpdateTycDto } from './dto/update-tyc.dto';
import { NotFoundException } from '@nestjs/common';

describe('TycService', () => {
  let service: TycService;
  let repository: Repository<TermsAndConditions>;

  const mockTyc: TermsAndConditions = {
    id: 1,
    title: 'Test Terms',
    text: 'Test Text',
    description: 'Test Description',
    createdDate: new Date(),
    updatedDate: new Date(),
    users: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TycService,
        {
          provide: getRepositoryToken(TermsAndConditions),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TycService>(TycService);
    repository = module.get<Repository<TermsAndConditions>>(
      getRepositoryToken(TermsAndConditions),
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new terms and conditions', async () => {
      const createTycDto: CreateTycDto = {
        title: 'Test Terms',
        text: 'Test Text',
        description: 'Test Description',
      };

      mockRepository.create.mockReturnValue(mockTyc);
      mockRepository.save.mockResolvedValue(mockTyc);

      const result = await service.create(createTycDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTycDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTyc);
    });

    it('should handle errors during creation', async () => {
      const createTycDto: CreateTycDto = {
        title: 'Test Terms',
        text: 'Test Text',
        description: 'Test Description',
      };

      mockRepository.create.mockReturnValue(mockTyc);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createTycDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of terms and conditions', async () => {
      const mockTycs = [mockTyc];
      mockRepository.find.mockResolvedValue(mockTycs);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockTycs);
    });

    it('should return an empty array when no terms and conditions exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single terms and conditions', async () => {
      mockRepository.findOne.mockResolvedValue(mockTyc);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockTyc);
    });

    it('should throw NotFoundException when terms and conditions not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Terms and conditions with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update and return the terms and conditions', async () => {
      const updateTycDto: UpdateTycDto = {
        title: 'Updated Terms',
      };

      const updatedTyc = { ...mockTyc, ...updateTycDto };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedTyc);

      const result = await service.update(1, updateTycDto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateTycDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(updatedTyc);
    });

    it('should throw NotFoundException when updating non-existent terms and conditions', async () => {
      const updateTycDto: UpdateTycDto = {
        title: 'Updated Terms',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(999, updateTycDto)).rejects.toThrow(
        new NotFoundException('Terms and conditions with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should delete the terms and conditions', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent terms and conditions', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Terms and conditions with ID 999 not found'),
      );
    });
  });
});