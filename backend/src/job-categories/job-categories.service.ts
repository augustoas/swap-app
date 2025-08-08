import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobCategoryDto } from './dto/create-job-category.dto';
import { UpdateJobCategoryDto } from './dto/update-job-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities/category.entity';
import { Job } from '../database/entities/job.entity';
import { JobCategory } from '../database/entities/jobCategory.entity';

@Injectable()
export class JobCategoriesService {
  constructor(
    @InjectRepository(JobCategory)
    private readonly jobCategoryRepository: Repository<JobCategory>,
  ) {}

  async create(
    createJobCategoryDto: CreateJobCategoryDto,
  ): Promise<JobCategory> {
    const { jobId, categoryId } = createJobCategoryDto;
    const newJobCategory = this.jobCategoryRepository.create();
    newJobCategory.job = { id: +jobId } as Job;
    newJobCategory.category = { id: +categoryId } as Category;

    return this.jobCategoryRepository.save(newJobCategory);
  }

  async findAll(): Promise<Array<JobCategory>> {
    return this.jobCategoryRepository.find();
  }

  async findOne(id: number): Promise<JobCategory> {
    const jobCategory = await this.jobCategoryRepository.findOne({ where: { id: id } });
    if (!jobCategory) {
      throw new NotFoundException(`Job category relationship with ID ${id} not found`);
    }
    return jobCategory;
  }

  async findAllByJobId(jobId: number): Promise<Array<JobCategory>> {
    return this.jobCategoryRepository.find({ where: { job: { id: jobId } } });
  }

  async update(
    id: number,
    updateJobCategoryDto: UpdateJobCategoryDto,
  ): Promise<JobCategory> {
    const jobCategory = await this.findOne(id);
    
    if (updateJobCategoryDto.jobId) {
      jobCategory.job = { id: +updateJobCategoryDto.jobId } as Job;
    }
    if (updateJobCategoryDto.categoryId) {
      jobCategory.category = { id: +updateJobCategoryDto.categoryId } as Category;
    }
    
    await this.jobCategoryRepository.update(id, jobCategory);
    return this.jobCategoryRepository.findOne({ where: { id: id } });
  }

  async remove(id: number): Promise<void> {
    const jobCategory = await this.findOne(id);
    await this.jobCategoryRepository.delete(id);
  }
}
