import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { JobCategory } from '../entities/jobCategory.entity';
import { Category } from '../entities/category.entity';
import { Seeder, DataFactory } from 'nestjs-seeder';

@Injectable()
export class JobCategorySeeder implements Seeder {
  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobCategory) private readonly jobcategoryRepository: Repository<JobCategory>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed(): Promise<any> {
    const jobs = await this.jobRepository.find();
    const categories = await this.categoryRepository.find();
    for (const index in jobs) {
      const randomNumberOfCategories = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < randomNumberOfCategories; i++) {
        let randomCategory = categories[Math.floor(Math.random() * categories.length)];
        let newJobCategory = this.jobcategoryRepository.create({
          job: jobs[index],
          category: randomCategory
        });
        try {
          await this.jobcategoryRepository.save(newJobCategory);
        } catch (error) {
          continue;
        }
      }
    }
  }

  async drop(): Promise<any> {}
}
