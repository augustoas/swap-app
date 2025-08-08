import { seeder } from 'nestjs-seeder';
import { User } from './database/entities/user.entity';
import { Job } from './database/entities/job.entity';
import { Offer } from './database/entities/offer.entity';
import { Question } from './database/entities/question.entity';
import { Reply } from './database/entities/reply.entity';
import { TermsAndConditions } from './database/entities/termsAndConditions.entity';
import { UserSeeder } from './database/seeders/user.seeder';
import { JobSeeder } from './database/seeders/job.seeder';
import { TYCSeeder } from './database/seeders/tyc.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorySeeder } from './database/seeders/category.seeder';
import { JobCategorySeeder } from './database/seeders/jobCategory.seeder';
import { Category } from './database/entities/category.entity';
import { JobCategory } from './database/entities/jobCategory.entity';
import { QuestionSeeder } from './database/seeders/question.seeder';
import { ReplySeeder } from './database/seeders/reply.seeder';
import { OfferSeeder } from './database/seeders/offer.seeder';

seeder({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT),
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      synchronize: false,
      entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
    }),
    TypeOrmModule.forFeature([User, Category, Job, JobCategory, TermsAndConditions, Offer, Question, Reply]),
  ],
}).run([UserSeeder, CategorySeeder, JobSeeder, JobCategorySeeder, TYCSeeder, OfferSeeder, QuestionSeeder, ReplySeeder]);
