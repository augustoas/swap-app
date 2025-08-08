import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Reply } from './reply.entity';
import { Job } from './job.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.questions)
  user: User;

  @ManyToOne(() => Job, (job) => job.questions)
  job: Job;

  @OneToMany(() => Reply, (replies) => replies.question, { nullable: true })
  replies: Reply[];

  @Column({ type: 'boolean', default: false })
  is_read: boolean;
}
