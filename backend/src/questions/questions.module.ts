import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../database/entities/question.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService],
  imports: [
    AuthModule, 
    TypeOrmModule.forFeature([Question]), 
    NotificationModule, 
    WebSocketModule,
    JobsModule
  ],
  exports: [QuestionsService],
})
export class QuestionsModule {}
