import { Module } from '@nestjs/common';
import { JobCategoriesService } from './job-categories.service';
import { JobCategoriesController } from './job-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobCategory } from '../database/entities/jobCategory.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [JobCategoriesController],
  providers: [JobCategoriesService],
  imports: [AuthModule, TypeOrmModule.forFeature([JobCategory])],
  exports: [JobCategoriesService],
})
export class JobCategoriesModule {}
