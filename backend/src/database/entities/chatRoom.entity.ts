import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from './user.entity';
import { Chat } from './chat.entity';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Job, (job) => job.chatRoom)
  @JoinColumn()
  job: Job;

  @ManyToOne(() => User, { nullable: false })
  jobCreator: User;

  @ManyToOne(() => User, { nullable: false })
  jobWorker: User;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @OneToMany(() => Chat, (chat) => chat.chatRoom)
  chats: Chat[];
} 