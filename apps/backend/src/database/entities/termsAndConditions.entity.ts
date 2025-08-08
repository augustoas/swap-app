import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Factory } from 'nestjs-seeder';
import { User } from './user.entity';

@Entity()
export class TermsAndConditions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @Factory((faker) => faker.lorem.lines(1))
  title: string;

  @Column({ type: 'text' })
  @Factory((faker) => faker.lorem.lines(2))
  text: string;

  @Column({ type: 'text' })
  @Factory((faker) => faker.lorem.lines(5))
  description: string;

  @ManyToMany(() => User, (users) => users.termsAndConditions)
  users: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;
}
