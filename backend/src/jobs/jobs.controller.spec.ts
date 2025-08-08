import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { NotFoundException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../database/entities/user.entity';
import { Job } from '../database/entities/job.entity';
import { JobCategoriesService } from '../job-categories/job-categories.service';
import { NotificationService } from '../notification/notification.service';
import { Currency } from '../types/Currency.enum';
import { DateType } from '../types/DateType.enum';
import { Job_Status } from '../types/Status.enum';
import { Gender } from '../types/Gender.enum';

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'password',
    firstname: 'Test',
    lastname: 'User',
    phonenumber: '123456789',
    gender: Gender.MALE,
    createdDate: new Date(),
    updatedDate: new Date(),
    offers: [],
    questions: [],
    createdJobs: [],
    acceptedJobs: [],
    createdReviews: [],
    receivedReviews: [],
    replies: [],
    termsAndConditions: [],
    notification: [],
    chat: [],
    isSwapper: false,
    isEmailConfirmed: false,
  } as User;

  const mockJob = {
    id: 1,
    budget: 1000,
    description: 'Test Job',
    details: 'Test Details',
    currency: Currency.USD,
    region: 'Test Region',
    commune: 'Test Commune',
    address: 'Test Address',
    dateType: DateType.OnDate,
    date: new Date('2024-03-20'),
    is_remote: true,
    status: Job_Status.PUBLISHED,
    images: [],
    jobCreator: mockUser,
    jobWorker: null,
    offers: [],
    questions: [],
    jobCategories: [],
    viewsCounter: 0,
    accepted_budget: null,
    createdDate: new Date(),
    updatedDate: new Date(),
    reviews: [],
    chat: [],
  } as Job;

  const mockJobsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findJobsByUserId: jest.fn(),
  };

  const mockJobCategoriesService = {
    create: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
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
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
        {
          provide: JobCategoriesService,
          useValue: mockJobCategoriesService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const createJobDto: CreateJobDto = {
        budget: 1000,
        description: 'Test Job',
        details: 'Test Details',
        currency: Currency.USD,
        region: 'Test Region',
        commune: 'Test Commune',
        address: 'Test Address',
        dateType: DateType.OnDate,
        date: '2024-03-20',
        is_remote: true,
        jobCategories: [],
        accepted_budget: null,
      };

      const mockImages = [] as Express.Multer.File[];
      mockJobsService.create.mockResolvedValue(mockJob);

      const result = await controller.create(createJobDto, mockImages, mockUser);

      expect(service.create).toHaveBeenCalledWith(createJobDto, mockUser, mockImages);
      expect(result).toEqual({
        message: 'Creado exitosamente',
        payload: mockJob,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of jobs', async () => {
      const jobs = [mockJob];
      mockJobsService.findAll.mockResolvedValue(jobs);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: '',
        payload: jobs,
      });
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJob);

      const result = await controller.findOne('1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual({
        message: '',
        payload: mockJob,
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      mockJobsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      const updateJobDto: UpdateJobDto = {
        description: 'Updated Job',
        budget: 2000,
        currency: Currency.USD,
        region: 'Test Region',
        commune: 'Test Commune',
        address: 'Test Address',
        dateType: DateType.OnDate,
        date: new Date('2024-03-20'),
        is_remote: true,
        accepted_budget: null,
        details: 'Updated Details',
        viewsCounter: 0,
      };

      const updatedJob = { ...mockJob, ...updateJobDto };
      mockJobsService.update.mockResolvedValue(updatedJob);

      const result = await controller.update('1', updateJobDto);

      expect(service.update).toHaveBeenCalledWith(1, updateJobDto);
      expect(result).toEqual({
        message: 'Editado exitosamente',
        payload: updatedJob,
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      const updateJobDto: UpdateJobDto = {
        description: 'Updated Job',
        budget: 2000,
        currency: Currency.USD,
        region: 'Test Region',
        commune: 'Test Commune',
        address: 'Test Address',
        dateType: DateType.OnDate,
        date: new Date('2024-03-20'),
        is_remote: true,
        accepted_budget: null,
        details: 'Updated Details',
        viewsCounter: 0,
      };

      mockJobsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('999', updateJobDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a job', async () => {
      mockJobsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Eliminado exitosamente',
        payload: undefined,
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      mockJobsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findJobsByUser', () => {
    it('should return jobs created by the current user', async () => {
      const jobs = [mockJob];
      mockJobsService.findJobsByUserId.mockResolvedValue(jobs);

      const result = await controller.findJobsByUser(mockUser);

      expect(service.findJobsByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        message: '',
        payload: jobs,
      });
    });
  });
}); 