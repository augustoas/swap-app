import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../database/entities/review.entity';
import { User } from '../database/entities/user.entity';
import { Job } from '../database/entities/job.entity';
import { NotificationWebSocketService } from '../websocket/services/notification-websocket.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly notificationWebSocketService: NotificationWebSocketService,
    private readonly jobsService: JobsService,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    const { jobId, reviewReceiverId, ...createReviewData } = createReviewDto;
    const newReview = this.reviewRepository.create(createReviewData);
    newReview.job = { id: +jobId } as Job;
    newReview.reviewCreator = { id: +user.id } as User;
    newReview.reviewReceiver = { id: +reviewReceiverId } as User;

    const job = await this.jobsService.findOne(+jobId);
    const savedReview = await this.reviewRepository.save(newReview);

    // Send notification to the person who received the review
    this.notificationWebSocketService.sendReviewNotification(
      +reviewReceiverId,
      'Haz recibido una nueva revisión',
      'Has recibido una nueva revisión. Revisa los detalles.',
      +jobId,
      'review_received'
    );

    return savedReview;
  }

  async findAll(): Promise<Array<Review>> {
    return this.reviewRepository.find();
  }

  async findOne(id: number): Promise<Review> {
    return this.reviewRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const thisReview = await this.reviewRepository.findOne({
      where: { id: id },
    });
    if (updateReviewDto.jobId)
      thisReview.job = { id: +updateReviewDto.jobId } as Job;
    if (updateReviewDto.reviewReceiverId)
      thisReview.reviewReceiver = {
        id: +updateReviewDto.reviewReceiverId,
      } as User;

    await this.reviewRepository.update(id, thisReview);
    return this.reviewRepository.findOne({ where: { id: id } });
  }

  async remove(id: number): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
