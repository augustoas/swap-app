import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Category } from './category.entity';
import { Job } from './job.entity';

@Entity()
@Unique(['category', 'job']) // no se puede repetir la categoria para un job
export class JobCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @ManyToOne(() => Category, (category) => category.jobCategories)
  category: Category;

  @ManyToOne(() => Job, (job) => job.jobCategories)
  job: Job;
}
