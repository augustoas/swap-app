import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from '../database/entities/chat.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [AuthModule, TypeOrmModule.forFeature([Chat])],
  exports: [ChatService],
})
export class ChatModule {}
