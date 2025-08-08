import { Test, TestingModule } from '@nestjs/testing';
import { JobCategoriesService } from './job-categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobCategory } from '../database/entities/jobCategory.entity';
import { Repository } from 'typeorm';
import { CreateJobCategoryDto } from './dto/create-job-category.dto';
import { UpdateJobCategoryDto } from './dto/update-job-category.dto';
import { NotFoundException } from '@nestjs/common';

describe('JobCategoriesService', () => {
  let service: JobCategoriesService;
  let repository: Repository<JobCategory>;

  const mockJobCategory = {
    id: 1,
    job: { id: 1 },
    category: { id: 1 },
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
        JobCategoriesService,
        {
          provide: getRepositoryToken(JobCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<JobCategoriesService>(JobCategoriesService);
    repository = module.get<Repository<JobCategory>>(getRepositoryToken(JobCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new job category relationship', async () => {
      const createJobCategoryDto: CreateJobCategoryDto = {
        jobId: '1',
        categoryId: '1',
      };

      mockRepository.create.mockReturnValue(mockJobCategory);
      mockRepository.save.mockResolvedValue(mockJobCategory);

      const result = await service.create(createJobCategoryDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockJobCategory);
    });
  });

  describe('findAll', () => {
    it('should return an array of job category relationships', async () => {
      const jobCategories = [mockJobCategory];
      mockRepository.find.mockResolvedValue(jobCategories);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(jobCategories);
    });
  });

  describe('findOne', () => {
    it('should return a job category relationship by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockJobCategory);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockJobCategory);
    });

    it('should throw NotFoundException if job category relationship not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByJobId', () => {
    it('should return an array of job category relationships for a specific job', async () => {
      const jobCategories = [mockJobCategory];
      mockRepository.find.mockResolvedValue(jobCategories);

      const result = await service.findAllByJobId(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { job: { id: 1 } },
      });
      expect(result).toEqual(jobCategories);
    });
  });

  describe('update', () => {
    it('should update a job category relationship', async () => {
      const updateJobCategoryDto: UpdateJobCategoryDto = {
        jobId: '2',
        categoryId: '2',
      };

      mockRepository.findOne.mockResolvedValue(mockJobCategory);
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOne.mockResolvedValue({
        ...mockJobCategory,
        job: { id: 2 },
        category: { id: 2 },
      });

      const result = await service.update(1, updateJobCategoryDto);

      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({
        ...mockJobCategory,
        job: { id: 2 },
        category: { id: 2 },
      });
    });

    it('should throw NotFoundException if job category relationship not found', async () => {
      const updateJobCategoryDto: UpdateJobCategoryDto = {
        jobId: '2',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateJobCategoryDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a job category relationship', async () => {
      mockRepository.findOne.mockResolvedValue(mockJobCategory);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if job category relationship not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
}); 