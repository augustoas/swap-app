import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Job } from '../entities/job.entity';
import { Offer } from '../entities/offer.entity';
import { Seeder } from 'nestjs-seeder';

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

    // Get first 2 jobs
    const jobs = await this.jobRepository.find({
      take: 2,
      order: { id: 'ASC' }
    });

    // Create offers for each job from both users
    for (const job of jobs) {
      // Create offer from swap user
      const swapOffer = this.offerRepository.create({
        text: `Offer from Swap user for job ${job.id}`,
        budget: Math.round(job.budget * 0.9), // Round to nearest integer
        user: swapUser,
        job: job
      });
      await this.offerRepository.save(swapOffer);

      // Create offer from userX
      const userXOffer = this.offerRepository.create({
        text: `Offer from UserX for job ${job.id}`,
        budget: Math.round(job.budget * 0.85), // Round to nearest integer
        user: userX,
        job: job
      });
      await this.offerRepository.save(userXOffer);
    }
  }

  async drop(): Promise<any> {}
}
