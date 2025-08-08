import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Job_Status } from '../../types/Status.enum';
import { Currency } from '../../types/Currency.enum';
import { User } from './user.entity';
import { Review } from './review.entity';
import { Offer } from './offer.entity';
import { Question } from './question.entity';
import { JobCategory } from './jobCategory.entity';
import { Factory } from 'nestjs-seeder';
import { DateType } from '../../types/DateType.enum';
import { ChatRoom } from './chatRoom.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Factory((faker) => faker.number.int({ min: 10000, max: 2000000 }))
  budget: number;

  @Column({ nullable: true })
  accepted_budget: number;

  @Column({ type: 'text' })
  @Factory((faker) => faker.lorem.lines())
  description: string;

  @Column({ type: 'text' })
  @Factory((faker) => faker.lorem.lines())
  details: string;

  @Column({
    type: 'enum',
    enum: Job_Status,
    nullable: true,
    default: Job_Status.PUBLISHED,
  })
  @Factory(() => Job_Status.PUBLISHED)
  status: Job_Status;

  @Column({
    type: 'enum',
    enum: Currency,
    nullable: true,
    default: Currency.CLP, // Set the default value here
  })
  @Factory(() => Currency.CLP)
  currency: Currency;

  @Column({ nullable: true })
  @Factory(() => 'Región Metropolitana')
  region: string;

  @Column({ nullable: true })
  @Factory(() => 'Las Condes')
  commune: string;

  @Column({ nullable: true })
  @Factory(() => 'Martin de Zamora 4891')
  address: string;

  @Column({ default: 0 })
  viewsCounter: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @ManyToOne(() => User, (jobCreator) => jobCreator.createdJobs, { nullable: true, onDelete: 'SET NULL' })
  jobCreator: User;

  @ManyToOne(() => User, (jobWorker) => jobWorker.acceptedJobs, { nullable: true, onDelete: 'SET NULL'})
  jobWorker: User;

  @Column({ type: 'float', nullable: true, default: null })
  @Factory(() => null)
  jobWorkerRating: number;

  @Column({ type: 'float', nullable: true, default: null })
  @Factory(() => null)
  jobCreatorRating: number;

  @OneToMany(() => Offer, (offers) => offers.job)
  offers: Offer[];

  @OneToMany(() => Question, (questions) => questions.job)
  questions: Question[];

  @OneToMany(() => Review, (reviews) => reviews.job)
  reviews: Review[];

  @OneToMany(() => JobCategory, (jobCategories) => jobCategories.job)
  jobCategories: JobCategory[];

  @Column({
    type: 'enum',
    enum: DateType,
  })
  @Factory(() => Object.values(DateType)[Math.floor(Math.random() * Object.values(DateType).length)] as DateType)
  dateType: DateType;

  @Column({ nullable: true })
  @Factory((faker) => faker.date.soon({ days: 10 }))
  date: Date;

  @Column({ type: 'boolean' })
  @Factory(() => Math.random() < 0.5)
  is_remote: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column('simple-array', { nullable: true, default: [] })
  @Factory(() => [])
  images: string[];

  @OneToOne(() => ChatRoom, (chatRoom) => chatRoom.job)
  chatRoom: ChatRoom;
}
