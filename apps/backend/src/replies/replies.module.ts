import { Module } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reply } from '../database/entities/reply.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { JobsModule } from '../jobs/jobs.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  controllers: [RepliesController],
  providers: [RepliesService],
  imports: [
    AuthModule, 
    TypeOrmModule.forFeature([Reply]), 
    NotificationModule, 
    WebSocketModule,
    JobsModule, 
    QuestionsModule
  ],
  exports: [RepliesService],
})
export class RepliesModule {}
