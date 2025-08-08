import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../database/entities/review.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [
    AuthModule, 
    TypeOrmModule.forFeature([Review]), 
    NotificationModule, 
    WebSocketModule,
    JobsModule
  ],
})
export class ReviewsModule {}
