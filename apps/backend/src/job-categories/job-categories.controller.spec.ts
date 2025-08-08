import { Test, TestingModule } from '@nestjs/testing';
import { JobCategoriesController } from './job-categories.controller';
import { JobCategoriesService } from './job-categories.service';
import { CreateJobCategoryDto } from './dto/create-job-category.dto';
import { UpdateJobCategoryDto } from './dto/update-job-category.dto';
import { NotFoundException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('JobCategoriesController', () => {
  let controller: JobCategoriesController;
  let service: JobCategoriesService;

  const mockJobCategory = {
    id: 1,
    job: { id: 1 },
    category: { id: 1 },
  };

  const mockJobCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      controllers: [JobCategoriesController],
      providers: [
        {
          provide: JobCategoriesService,
          useValue: mockJobCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<JobCategoriesController>(JobCategoriesController);
    service = module.get<JobCategoriesService>(JobCategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new job category relationship', async () => {
      const createJobCategoryDto: CreateJobCategoryDto = {
        jobId: '1',
        categoryId: '1',
      };

      mockJobCategoriesService.create.mockResolvedValue(mockJobCategory);

      const result = await controller.create(createJobCategoryDto);

      expect(service.create).toHaveBeenCalledWith(createJobCategoryDto);
      expect(result).toEqual({
        message: 'Creado exitosamente',
        payload: mockJobCategory,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of job category relationships', async () => {
      const jobCategories = [mockJobCategory];
      mockJobCategoriesService.findAll.mockResolvedValue(jobCategories);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: '',
        payload: jobCategories,
      });
    });
  });

  describe('findOne', () => {
    it('should return a job category relationship by id', async () => {
      mockJobCategoriesService.findOne.mockResolvedValue(mockJobCategory);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: '',
        payload: mockJobCategory,
      });
    });

    it('should throw NotFoundException if job category relationship not found', async () => {
      mockJobCategoriesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a job category relationship', async () => {
      const updateJobCategoryDto: UpdateJobCategoryDto = {
        jobId: '2',
        categoryId: '2',
      };

      const updatedJobCategory = {
        ...mockJobCategory,
        job: { id: 2 },
        category: { id: 2 },
      };
      mockJobCategoriesService.update.mockResolvedValue(updatedJobCategory);

      const result = await controller.update('1', updateJobCategoryDto);

      expect(service.update).toHaveBeenCalledWith(1, updateJobCategoryDto);
      expect(result).toEqual({
        message: 'Editado exitosamente',
        payload: updatedJobCategory,
      });
    });

    it('should throw NotFoundException if job category relationship not found', async () => {
      const updateJobCategoryDto: UpdateJobCategoryDto = {
        jobId: '2',
      };

      mockJobCategoriesService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updateJobCategoryDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a job category relationship', async () => {
      mockJobCategoriesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Eliminado exitosamente',
        payload: undefined,
      });
    });

    it('should throw NotFoundException if job category relationship not found', async () => {
      mockJobCategoriesService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
}); 