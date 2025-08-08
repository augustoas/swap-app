import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from '../database/entities/job.entity';
import { JobCategoriesService } from '../job-categories/job-categories.service';
import { NotificationService } from '../notification/notification.service';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { User } from '../database/entities/user.entity';
import { Currency } from '../types/Currency.enum';
import { DateType } from '../types/DateType.enum';
import { Job_Status } from '../types/Status.enum';
import { Gender } from '../types/Gender.enum';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: Repository<Job>;
  let jobCategoriesService: JobCategoriesService;
  let notificationService: NotificationService;

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

  const mockJobRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJobCategoriesService = {
    create: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
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

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    jobCategoriesService = module.get<JobCategoriesService>(JobCategoriesService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const createJobDto: CreateJobDto = {
        budget: 1000,
        accepted_budget: null,
        description: 'Test job',
        details: 'Test details',
        currency: Currency.USD,
        region: 'Test Region',
        commune: 'Test Commune',
        address: 'Test Address',
        jobCategories: [],
        dateType: DateType.OnDate,
        date: '2024-03-20',
        is_remote: true
      };

      const expectedJob = {
        ...createJobDto,
        date: new Date('2024-03-20'),
        jobCreator: mockUser,
        images: [],
        status: Job_Status.PUBLISHED,
        viewsCounter: 0
      };

      mockJobRepository.create.mockReturnValue({});
      mockJobRepository.save.mockResolvedValue(expectedJob);

      const result = await service.create(createJobDto, mockUser, []);

      expect(mockJobRepository.create).toHaveBeenCalled();
      expect(mockJobRepository.save).toHaveBeenCalledWith(expectedJob);
      expect(result).toEqual(expectedJob);
      expect(mockNotificationService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        title: 'Se ha creado un nuevo trabajo',
        subtitle: 'Estado: ' + expectedJob.status,
        message: expect.stringContaining('Se ha creado exitosamente un nuevo trabajo'),
        path: expect.stringContaining('/jobs/')
      });
    });

    it('should handle job creation with images', async () => {
      const createJobDto: CreateJobDto = {
        budget: 1000,
        accepted_budget: null,
        description: 'Test job',
        details: 'Test details',
        currency: Currency.USD,
        region: 'Test Region',
        commune: 'Test Commune',
        address: 'Test Address',
        jobCategories: [],
        dateType: DateType.OnDate,
        date: '2024-03-20',
        is_remote: true
      };

      const mockImages = [
        { path: 'image1.jpg' } as Express.Multer.File,
        { path: 'image2.jpg' } as Express.Multer.File
      ];
      const expectedJob = {
        ...createJobDto,
        date: new Date('2024-03-20'),
        jobCreator: mockUser,
        images: mockImages.map(img => img.path),
        status: Job_Status.PUBLISHED,
        viewsCounter: 0
      };

      mockJobRepository.create.mockReturnValue({});
      mockJobRepository.save.mockResolvedValue(expectedJob);

      const result = await service.create(createJobDto, mockUser, mockImages);

      expect(mockJobRepository.create).toHaveBeenCalled();
      expect(mockJobRepository.save).toHaveBeenCalledWith(expectedJob);
      expect(result).toEqual(expectedJob);
    });
  });

  describe('findAll', () => {
    it('should return an array of jobs', async () => {
      const jobs = [mockJob];
      mockJobRepository.find.mockResolvedValue(jobs);

      const result = await service.findAll();

      expect(jobRepository.find).toHaveBeenCalledWith({
        relations: [
          'jobWorker',
          'jobCreator',
          'jobCategories',
          'jobCategories.category',
        ],
        order: {
          createdDate: 'DESC',
        },
      });
      expect(result).toEqual(jobs);
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      mockJobRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findOne(1);

      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'jobWorker',
          'jobCreator',
          'jobCategories',
          'jobCategories.category',
          'questions',
          'questions.user',
          'questions.replies',
          'questions.replies.user',
        ],
      });
      expect(result).toEqual(mockJob);
    });

    it('should include offers when user is job creator', async () => {
      mockJobRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findOne(1, mockUser);

      expect(jobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.arrayContaining([
          'offers',
          'offers.user',
        ]),
      });
      expect(result).toEqual(mockJob);
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
      mockJobRepository.update.mockResolvedValue(undefined);
      mockJobRepository.findOne.mockResolvedValue(updatedJob);

      const result = await service.update(1, updateJobDto);

      expect(jobRepository.update).toHaveBeenCalledWith(1, updateJobDto);
      expect(jobRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(updatedJob);
    });
  });

  describe('remove', () => {
    it('should remove a job', async () => {
      mockJobRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(jobRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findJobsByUserId', () => {
    it('should return jobs created by a specific user', async () => {
      const jobs = [mockJob];
      mockJobRepository.find.mockResolvedValue(jobs);

      const result = await service.findJobsByUserId(1);

      expect(jobRepository.find).toHaveBeenCalledWith({
        where: { jobCreator: { id: 1 } },
        relations: ['jobWorker', 'jobCreator', 'offers', 'offers.user'],
        order: {
          createdDate: 'DESC',
        },
      });
      expect(result).toEqual(jobs);
    });
  });
}); 