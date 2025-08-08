import { BadRequestException, Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job_Status } from '../types/Status.enum';
import { Job } from '../database/entities/job.entity';
import { User } from '../database/entities/user.entity';
import { JobCategoriesService } from '../job-categories/job-categories.service';
import { NotificationWebSocketService } from '../websocket/services/notification-websocket.service';
import { OffersService } from '@/offers/offers.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    private readonly jobCategoriesService: JobCategoriesService,
    private readonly notificationWebSocketService: NotificationWebSocketService,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
  ) {}

  /**
   * Creates a new job.
   *
   * @param createJobDto - The data for creating the job.
   * @param user - The user creating the job.
   * @returns A promise that resolves to the created job.
   */
  async create(
    createJobDto: CreateJobDto,
    user: User,
    images: Express.Multer.File[],
  ): Promise<Job> {
    const { categories, ...jobDto } = createJobDto; // Destructure the DTO to get job categories.
    const newJob = this.jobRepository.create();
    newJob.budget = jobDto.budget;
    newJob.accepted_budget = jobDto.accepted_budget;
    newJob.description = jobDto.description;
    newJob.details = jobDto.details;
    newJob.currency = jobDto.currency;
    newJob.region = jobDto.region;
    newJob.commune = jobDto.commune;
    newJob.address = jobDto.address;
    newJob.dateType = jobDto.dateType;
    newJob.date = jobDto.date ? new Date(jobDto.date) : null;
    newJob.is_remote = jobDto.is_remote;
    newJob.status = Job_Status.PUBLISHED;
    newJob.viewsCounter = 0;
    // Handle file uploads
    if (images && images.length > 0) {
      newJob.images = images.map((image) => {
        const filename = image.path.split('/').pop();
        return `${'http://localhost:4000/uploads'}/${filename}`;
      });
    } else {
      newJob.images = [];
    }
    newJob.jobCreator = user;

    const savedJob = await this.jobRepository.save(newJob);
    // save the job categories, dont wait for the job categories to be saved
    for (const category of categories) {
      this.jobCategoriesService.create({
        jobId: savedJob.id.toString(),
        categoryId: category,
      });
    }
    
    // Send real-time notification to user about job creation
    this.notificationWebSocketService.sendJobNotification(
      user.id,
      'Se ha creado un nuevo trabajo',
      `Se ha creado exitosamente un nuevo trabajo con el estado ${savedJob.status}, con el id ${savedJob.id} y con presupuesto de ${savedJob.budget} ${savedJob.currency}`,
      savedJob.id,
      'job_created'
    );
    
    return savedJob;
  }

  /**
   * Retrieves all jobs.
   *
   * @returns A promise that resolves to an array of jobs.
   */
  async findAll(): Promise<Array<Job>> {
    return this.jobRepository.find({
      // Find all jobs and include the job categories, job creator
      relations: [
        'jobWorker',
        'jobCreator',
        'jobCategories',
        'jobCategories.category',
      ],
      order: {
        createdDate: 'DESC', // Change 'DESC' to 'ASC' for ascending order
      },
    });
  }

  /**
   * Retrieves a job by its ID.
   *
   * @param id - The ID of the job.
   * @returns A promise that resolves to the found job.
   */
  async findOne(id: number, user?: User): Promise<Job> {
    const relations = [
      'jobWorker',
      'jobCreator',
      'jobCategories',
      'jobCategories.category',
      'questions',
      'questions.user',
      'questions.replies',
      'questions.replies.user',
    ];
    // if the user is not undefined and is equal to the job creator, then return the job with offers
    if (user) {
      const job = await this.jobRepository.findOne({
        where: { id: id },
        relations: relations,
      });
      if (job.jobCreator.id === Number(user.id)) relations.push('offers', 'offers.user');
    }
    return await this.jobRepository.findOne({
      // Find the job by its ID and include the job categories, job creator.
      where: { id: id },
      relations: relations,
    });
  }

  /**
   * Updates a job.
   *
   * @param id - The ID of the job to update.
   * @param updateJobDto - The data for updating the job.
   * @returns A promise that resolves to the updated job.
   */
  async update(id: number, updateJobDto: UpdateJobDto, user: User): Promise<Job> {
    const thisJob = await this.jobRepository.findOne({ where: { id: id } });
    if (thisJob.jobCreator.id !== user.id) throw new UnauthorizedException('You are not authorized to update this job');
    if (thisJob.status !== Job_Status.PUBLISHED) throw new BadRequestException('You are not authorized to update this job');
    const { budget, date, dateType, is_remote, ..._ } = updateJobDto;
    if (budget && budget !== thisJob.budget || 
      date && date !== thisJob.date || 
      dateType && dateType !== thisJob.dateType || 
      is_remote && is_remote !== thisJob.is_remote) {
      const thisJobOffers = await this.offersService.findOffersByJobId(id);
      for (const offer of thisJobOffers) {
        this.offersService.remove(offer.id);
      }
    }
    await this.jobRepository.update(id, updateJobDto);

    const job = await this.jobRepository.findOne({ where: { id: id } });
    return job;
  }

  async updateImages(id: number, images: Express.Multer.File[], user: User): Promise<Job> {
    const thisJob = await this.jobRepository.findOne({ where: { id: id } });
    if (thisJob.jobCreator.id !== user.id) throw new UnauthorizedException('You are not authorized to update this job');
    if (thisJob.status !== Job_Status.PUBLISHED) throw new BadRequestException('You are not authorized to update this job');
    if (images && images.length > 0) {
      thisJob.images = images.map((image) => {
        const filename = image.path.split('/').pop();
        return `${'http://localhost:4000/uploads'}/${filename}`;
      });
    } else {
      thisJob.images = [];
    }
    await this.jobRepository.update(id, thisJob);
    return thisJob;
  }

  /**
   * Removes a job.
   *
   * @param id - The ID of the job to remove.
   * @returns A promise that resolves when the job is removed.
   */
  async remove(id: number): Promise<void> {
    await this.jobRepository.delete(id);
  }

  async findJobsByUserId(userId: number): Promise<Job[]> {
    const jobs = await this.jobRepository.find({
      where: { jobCreator: { id: userId } },
      relations: ['jobWorker', 'jobCreator', 'offers', 'offers.user'],
      order: {
        createdDate: 'DESC',
      },
    });

    return jobs;
  }

  /**
   * Finds all finished jobs where the user is the job worker.
   *
   * @param userId - The ID of the user (job worker).
   * @returns A promise that resolves to an array of finished jobs where the user is the worker.
   */
  async findFinishedJobsByWorkerId(userId: number): Promise<Job[]> {
    const jobs = await this.jobRepository.find({
      where: { 
        jobWorker: { id: userId },
        status: Job_Status.FINISHED
      },
      relations: ['jobWorker', 'jobCreator', 'offers', 'offers.user'],
      order: {
        createdDate: 'DESC',
      },
    });

    return jobs;
  }

  async rateJob(jobId: number, rating: number, user: User): Promise<Job> {
    const thisJob = await this.jobRepository.findOne({ where: { id: jobId } });
    // if the job is not finished, then you are not authorized to rate it
    if (thisJob.status !== Job_Status.FINISHED) throw new BadRequestException('You are not authorized to rate this job');
    // if the rating is not between 0 and 5, then throw an error
    if (rating < 0 || rating > 5) throw new BadRequestException('Rating must be between 0 and 5');
    if (thisJob.jobCreator.id === user.id) thisJob.jobCreatorRating = rating;
    else if (thisJob.jobWorker.id === user.id) thisJob.jobWorkerRating = rating;
    // if the user is not the job creator or the job worker, then you are not authorized to rate it
    else throw new UnauthorizedException('You are not authorized to rate this job');
    // if the job creator and the job worker have rated the job, then close the job
    if (thisJob.jobCreatorRating !== null && thisJob.jobWorkerRating !== null) thisJob.status = Job_Status.CLOSED;
    await this.jobRepository.update(jobId, thisJob);
    return thisJob;
  }

  /**
   * Finishes a job by changing its status to FINISHED.
   *
   * @param jobId - The ID of the job to finish.
   * @param user - The user requesting to finish the job.
   * @returns A promise that resolves to the updated job.
   */
  async finishJob(jobId: number, user: User): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['jobCreator', 'jobWorker'],
    });

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    // Only the job creator or job worker can finish the job
    if (job.jobCreator.id !== user.id && job.jobWorker?.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to finish this job');
    }

    // Job must be in CONFIRMED status to be finished
    if (job.status !== Job_Status.CONFIRMED) {
      throw new BadRequestException('Job must be confirmed before it can be finished');
    }

    job.status = Job_Status.FINISHED;
    await this.jobRepository.save(job);

    // Send notification to the other party
    const notificationUserId = job.jobCreator.id === user.id ? job.jobWorker.id : job.jobCreator.id;
    const notificationTitle = 'Trabajo Terminado';
    const notificationMessage = 'El trabajo ha sido marcado como terminado. Ahora pueden calificarse mutuamente.';

    this.notificationWebSocketService.sendJobNotification(
      notificationUserId,
      notificationTitle,
      notificationMessage,
      jobId,
      'job_finished'
    );

    return job;
  }
}

