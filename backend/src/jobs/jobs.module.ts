import { forwardRef, Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../database/entities/job.entity';
import { AuthModule } from '../auth/auth.module';
import { JobCategoriesModule } from '../job-categories/job-categories.module';
import { NotificationModule } from '../notification/notification.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { OffersModule } from '../offers/offers.module';

@Module({
  controllers: [JobsController],
  providers: [JobsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Job]),
    JobCategoriesModule,
    NotificationModule,
    WebSocketModule,
    MulterModule.register(multerConfig),
    forwardRef(() => OffersModule)
  ],
  exports: [JobsService],
})
export class JobsModule {}

