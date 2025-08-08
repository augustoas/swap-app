import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from './user.entity';

@Entity()
@Unique(['reviewCreator', 'reviewReceiver', 'job']) // un job no puede tener más de un review
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column()
  rating: string;

  @ManyToOne(() => User, (reviewCreator) => reviewCreator.createdReviews)
  reviewCreator: User;

  @ManyToOne(() => User, (reviewReceiver) => reviewReceiver.receivedReviews)
  reviewReceiver: User;

  @ManyToOne(() => Job, (job) => job.reviews)
  job: Job;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;
}
