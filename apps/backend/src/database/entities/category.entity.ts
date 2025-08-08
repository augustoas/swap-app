import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobCategory } from './jobCategory.entity';
import { Factory } from 'nestjs-seeder';

@Entity()
@Unique(['name'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Factory((faker) => faker.string.alphanumeric(16))
  name: string;

  @Column({ type: 'text' })
  @Factory((faker) => faker.lorem.lines())
  description: string;

  @OneToMany(() => JobCategory, (jobCategories) => jobCategories.category)
  jobCategories: JobCategory[];

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;
}
