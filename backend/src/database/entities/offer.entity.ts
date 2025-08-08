import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Job } from './job.entity';
import { Offer_Status } from '../../types/Status.enum';
@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column()
  budget: number;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Job, (job) => job.offers)
  job: Job;

  @Column({
    type: 'enum',
    enum: Offer_Status,
    default: Offer_Status.PENDING,
  })
  status: Offer_Status;
}
