import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Job } from '../entities/job.entity';
import { Offer } from '../entities/offer.entity';
import { Seeder } from 'nestjs-seeder';
import { Offer_Status } from '../../types/Status.enum';
import { Job_Status } from '../../types/Status.enum';

@Injectable()
export class OfferSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(Offer) private readonly offerRepository: Repository<Offer>,
  ) {}

  async seed(): Promise<any> {
    // Find swap and userx users
    const swapUser = await this.userRepository.findOne({
      where: { email: 'swap@swap.cl' }
    });
    const userX = await this.userRepository.findOne({
      where: { email: 'userx@userx.cl' }
    });

    // Get first 4 jobs to create different scenarios
    const jobs = await this.jobRepository.find({
      take: 4,
      order: { id: 'ASC' }
    });

    // Scenario 1: Job with pending offers (first job)
    const job1 = jobs[0];
    if (job1) {
      // Create pending offer from swap user
      const swapOffer1 = this.offerRepository.create({
        text: `Offer from Swap user for job ${job1.id}`,
        budget: Math.round(job1.budget * 0.9),
        status: Offer_Status.PENDING,
        user: swapUser,
        job: job1
      });
      await this.offerRepository.save(swapOffer1);

      // Create pending offer from userX
      const userXOffer1 = this.offerRepository.create({
        text: `Offer from UserX for job ${job1.id}`,
        budget: Math.round(job1.budget * 0.85),
        status: Offer_Status.PENDING,
        user: userX,
        job: job1
      });
      await this.offerRepository.save(userXOffer1);
    }

    // Scenario 2: Job with accepted offer and confirmed status (second job)
    const job2 = jobs[1];
    if (job2) {
      // Create accepted offer from userX
      const acceptedOfferBudget = Math.round(job2.budget * 0.8);
      const acceptedOffer = this.offerRepository.create({
        text: `Accepted offer from UserX for job ${job2.id}`,
        budget: acceptedOfferBudget,
        status: Offer_Status.ACCEPTED,
        user: userX,
        job: job2
      });
      await this.offerRepository.save(acceptedOffer);

      // Create rejected offer from swap user
      const rejectedOffer = this.offerRepository.create({
        text: `Rejected offer from Swap user for job ${job2.id}`,
        budget: Math.round(job2.budget * 0.95),
        status: Offer_Status.REJECTED,
        user: swapUser,
        job: job2
      });
      await this.offerRepository.save(rejectedOffer);

      // Update job to confirmed status with accepted budget and worker
      job2.status = Job_Status.CONFIRMED;
      job2.jobWorker = userX;
      job2.accepted_budget = acceptedOfferBudget;
      await this.jobRepository.save(job2);
    }

    // Scenario 3: Another confirmed job (third job)
    const job3 = jobs[2];
    if (job3) {
      // Create accepted offer from swap user
      const acceptedOfferBudget3 = Math.round(job3.budget * 0.75);
      const acceptedOffer3 = this.offerRepository.create({
        text: `Accepted offer from Swap user for job ${job3.id}`,
        budget: acceptedOfferBudget3,
        status: Offer_Status.ACCEPTED,
        user: swapUser,
        job: job3
      });
      await this.offerRepository.save(acceptedOffer3);

      // Update job to confirmed status
      job3.status = Job_Status.CONFIRMED;
      job3.jobWorker = swapUser;
      job3.accepted_budget = acceptedOfferBudget3;
      await this.jobRepository.save(job3);
    }

    // Scenario 4: Finished job (fourth job)
    const job4 = jobs[3];
    if (job4) {
      // Create accepted offer
      const acceptedOfferBudget4 = Math.round(job4.budget * 0.88);
      const acceptedOffer4 = this.offerRepository.create({
        text: `Completed job offer from UserX for job ${job4.id}`,
        budget: acceptedOfferBudget4,
        status: Offer_Status.ACCEPTED,
        user: userX,
        job: job4
      });
      await this.offerRepository.save(acceptedOffer4);

      // Update job to finished status
      job4.status = Job_Status.FINISHED;
      job4.jobWorker = userX;
      job4.accepted_budget = acceptedOfferBudget4;
      await this.jobRepository.save(job4);
    }
  }

  async drop(): Promise<any> {}
}
