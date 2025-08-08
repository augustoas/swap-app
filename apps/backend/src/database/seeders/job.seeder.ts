import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Job } from '../entities/job.entity';
import { Seeder, DataFactory } from 'nestjs-seeder';

@Injectable()
export class JobSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
  ) {}

  async seed(): Promise<any> {
    // Find admin user
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@admin.cl' }
    });

    // Create 5 jobs for admin
    const jobs = DataFactory.createForClass(Job).generate(6);
    for (const index in jobs) {
      const newJob = this.jobRepository.create(jobs[index]);
      newJob.jobCreator = { id: adminUser.id } as User;
      await this.jobRepository.save(newJob);
    }
  }

  async drop(): Promise<any> {}
}
